import { v4 as uuidv4 } from 'uuid';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function initFirebase() {
    if (getApps().length > 0) {
        return getFirestore();
    }

    try {
        // Try to load service account locally if credentials exist in .env
        const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

        // If the file exists, initialize with it. Otherwise, initialize using ADC (useful for serverless environments with env vars like FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS)
        if (fs.existsSync(serviceAccountPath)) {
            initializeApp({
                credential: cert(serviceAccountPath)
            });
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                })
            });
        } else {
            // Fallback for cloud run / default integrations
            initializeApp();
        }

        console.log("Firebase initialized successfully");
        return getFirestore();
    } catch (err) {
        console.error("Firebase initialization failed. You must provide serviceAccountKey.json or set FIREBASE_* env variables.");
        console.error(err);
        return null;
    }
}

const db = initFirebase();

// Collections references
const usersRef = db?.collection('users');
const favoritesRef = db?.collection('favorites');
const visitsRef = db?.collection('visits');
const reviewsRef = db?.collection('reviews');
const sessionsRef = db?.collection('sessions');
const analyticsRef = db?.collection('analytics');
const statsRef = db?.collection('stats'); // For guest count and similar counters

// Helper to get server timestamp
const serverTimestamp = () => Date.now(); // Keeping it primitive number for compatibility for now, can switch to FieldValue.serverTimestamp() if Date type mapping changes are made. Using Date.now() ensures exact backwards compat since the prev models stored Date.now().

// ===== 게스트 관리 =====
export async function getGuestCount(): Promise<number> {
    if (!db) return 0;
    try {
        const doc = await statsRef!.doc('guest_stats').get();
        if (doc.exists) {
            return doc.data()?.guestCount || 0;
        }
        // Initialize if not exists
        await statsRef!.doc('guest_stats').set({ guestCount: 0 });
        return 0;
    } catch (e) {
        console.error("Failed to get guest count", e);
        return 0;
    }
}

export async function canRegisterGuest(): Promise<boolean> {
    const count = await getGuestCount();
    return count < 50;
}

export async function registerGuest(): Promise<{ user_id: string; guest_number: number } | null> {
    if (!db) return null;
    const canRegister = await canRegisterGuest();
    if (!canRegister) return null;

    try {
        // Use batch to perform transactions
        const guestStatsRef = statsRef!.doc('guest_stats');

        let newCount = 0;
        await db.runTransaction(async (transaction) => {
            const sfDoc = await transaction.get(guestStatsRef);
            if (!sfDoc.exists) {
                newCount = 1;
                transaction.set(guestStatsRef, { guestCount: newCount });
            } else {
                newCount = (sfDoc.data()?.guestCount || 0) + 1;
                transaction.update(guestStatsRef, { guestCount: newCount });
            }
        });

        const userId = `guest_${uuidv4().slice(0, 8)}`;
        const userDoc = {
            user_id: userId,
            user_type: 'guest',
            nickname: `게스트${newCount}`,
            created_at: serverTimestamp(),
            last_active: serverTimestamp(),
        };

        await usersRef!.doc(userId).set(userDoc);

        return { user_id: userId, guest_number: newCount };
    } catch (e) {
        console.error("Failed to register guest", e);
        return null;
    }
}

// ===== 회원 관리 =====
export async function registerMember(data: any): Promise<any> {
    if (!db) return { error: "DB 연결 오류" };

    // 이메일 중복 확인
    const existingUsers = await usersRef!.where('email', '==', data.email).where('user_type', '==', 'member').get();
    if (!existingUsers.empty) {
        return { error: '이미 가입된 이메일이에요!' };
    }

    let userId = `member_${uuidv4().slice(0, 8)}`;

    // 기존 게스트 데이터 병합 여부 - guest_id가 제공된 경우만
    if (data.guest_id) {
        const existingGuest = await usersRef!.doc(data.guest_id).get();
        if (existingGuest.exists) {
            userId = data.guest_id; // 기존 아이디 유지하면서 덮어쓰기
        }
    }

    const newUser = {
        user_id: userId,
        user_type: 'member',
        email: data.email,
        password: data.password, // 데모 목적 평문 저장 (실제 서비스에서는 해시 필수)
        nickname: data.nickname,
        created_at: serverTimestamp(),
        last_active: serverTimestamp(),
    };

    await usersRef!.doc(userId).set(newUser, { merge: true });

    // 반환 시 비밀번호 제거
    const { password, ...safeUser } = newUser;
    return safeUser;
}

export async function loginMember(data: any): Promise<any> {
    if (!db) return { error: "DB 연결 오류" };

    const snapshot = await usersRef!.where('email', '==', data.email)
        .where('password', '==', data.password)
        .where('user_type', '==', 'member').get();

    if (snapshot.empty) {
        return { error: '이메일 또는 비밀번호가 일치하지 않아요.' };
    }

    // Update last active
    const userDoc = snapshot.docs[0];
    const userSnapshot = userDoc.data();
    await usersRef!.doc(userDoc.id).update({ last_active: serverTimestamp() });

    // 반환 시 비밀번호 제거
    const { password, ...safeUser } = userSnapshot;
    return safeUser;
}

export async function socialLoginMember(email: string, name: string, platform: string, guestId?: string): Promise<any> {
    if (!db) return { error: "DB 연결 오류" };

    // 이미 해당 이메일로 가입한 내역이 있는지 먼저 확인
    const snapshot = await usersRef!.where('email', '==', email)
        .where('user_type', '==', 'member').get();

    if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userSnapshot = userDoc.data();
        await usersRef!.doc(userDoc.id).update({ last_active: serverTimestamp() });
        const { password, ...safeUser } = userSnapshot;
        return safeUser; // 기존 계정 로그인
    }

    // 신규 소셜 회원 가입 처리
    let userId = `${platform}_${uuidv4().slice(0, 8)}`;

    // 게스트 데이터 병합 연동
    if (guestId) {
        const existingGuest = await usersRef!.doc(guestId).get();
        if (existingGuest.exists) {
            userId = guestId;
        }
    }

    const newUser = {
        user_id: userId,
        user_type: 'member',
        email,
        nickname: name,
        social_platform: platform,
        created_at: serverTimestamp(),
        last_active: serverTimestamp(),
    };

    await usersRef!.doc(userId).set(newUser, { merge: true });
    return newUser;
}

// ===== 즐겨찾기 =====
export async function getFavorites(userId: string): Promise<any[]> {
    if (!db) return [];

    const snapshot = await favoritesRef!.where('user_id', '==', userId).orderBy('saved_at', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

export async function addFavorite(userId: string, data: any): Promise<any> {
    if (!db) return { error: "DB 연결 오류" };

    // 1. 유저 확인
    const userSnap = await usersRef!.doc(userId).get();
    const user = userSnap.data();

    // 2. 현재 즐겨찾기 개수와 이미 저장된 카페인지 확인
    const favSnapshot = await favoritesRef!.where('user_id', '==', userId).get();
    const favs = favSnapshot.docs.map(doc => doc.data());

    if (user?.user_type === 'guest' && favs.length >= 3) {
        return { error: '게스트는 최대 3개의 카페만 저장할 수 있어요 🙏' };
    }

    if (favs.find((f: any) => f.cafe_id === data.cafe_id)) {
        return { error: '이미 저장된 카페예요!' };
    }

    const favId = uuidv4();
    const fav = {
        favorite_id: favId,
        user_id: userId,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        address: data.address || '',
        photo_url: data.photo_url || '',
        saved_at: serverTimestamp(),
        memo: data.memo || '',
    };

    await favoritesRef!.doc(favId).set(fav);
    return fav;
}

export async function removeFavorite(userId: string, favoriteId: string): Promise<boolean> {
    if (!db) return false;

    const favSnap = await favoritesRef!.doc(favoriteId).get();
    if (!favSnap.exists) return false;

    if (favSnap.data()?.user_id !== userId) return false; // Not owner

    await favoritesRef!.doc(favoriteId).delete();
    return true;
}

// ===== 방문 이력 =====
export async function getVisits(userId: string): Promise<any[]> {
    if (!db) return [];
    const snapshot = await visitsRef!.where('user_id', '==', userId).orderBy('visited_at', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

export async function addVisit(userId: string, data: any): Promise<any> {
    if (!db) return null;

    const visitId = uuidv4();
    const visit = {
        visit_id: visitId,
        user_id: userId,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        visited_at: serverTimestamp(),
        emotion_tags: data.emotion_tags || [],
    };

    await visitsRef!.doc(visitId).set(visit);
    return visit;
}

// ===== 챗봇 세션 =====
export async function createSession(userId: string): Promise<any> {
    if (!db) return null;

    const sessionId = uuidv4();
    const session = {
        session_id: sessionId,
        user_id: userId,
        messages: [],
        step: 0,
        emotion_profile: {},
        is_complete: false,
        created_at: serverTimestamp(),
    };

    await sessionsRef!.doc(sessionId).set(session);
    return session;
}

export async function getSession(sessionId: string): Promise<any | null> {
    if (!db) return null;

    const sessionSnap = await sessionsRef!.doc(sessionId).get();
    return sessionSnap.exists ? sessionSnap.data() : null;
}

export async function updateSession(sessionId: string, data: Partial<any>): Promise<any | null> {
    if (!db) return null;

    await sessionsRef!.doc(sessionId).update(data);
    const updatedSnap = await sessionsRef!.doc(sessionId).get();
    return updatedSnap.exists ? updatedSnap.data() : null;
}

export async function getSessionsByUser(userId: string): Promise<any[]> {
    if (!db) return [];
    // 가장 최근 세션이 위로 오도록 정렬
    const snapshot = await sessionsRef!.where('user_id', '==', userId).orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

// ===== 리뷰 =====
export async function addReview(data: any): Promise<any> {
    if (!db) return null;

    const reviewId = uuidv4();
    const review = {
        review_id: reviewId,
        user_id: data.user_id,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        atmosphere_tags: data.atmosphere_tags || [],
        menu_satisfaction: data.menu_satisfaction || 'good',
        one_line: data.one_line || '',
        will_revisit: data.will_revisit ?? true,
        created_at: serverTimestamp(),
    };

    await reviewsRef!.doc(reviewId).set(review);
    return review;
}

export async function getReviewsByCafe(cafeId: string): Promise<any[]> {
    if (!db) return [];

    const snapshot = await reviewsRef!.where('cafe_id', '==', cafeId).orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

export async function getAllReviews(): Promise<any[]> {
    if (!db) return [];

    const snapshot = await reviewsRef!.orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

// ===== 행동 데이터 =====
export async function trackEvent(event: any): Promise<void> {
    if (!db) return;

    await analyticsRef!.add({
        ...event,
        timestamp: serverTimestamp(),
    });
}

export async function getAnalytics(): Promise<any[]> {
    if (!db) return [];

    const snapshot = await analyticsRef!.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => doc.data());
}

