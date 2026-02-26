import { v4 as uuidv4 } from 'uuid';

// ===== 인메모리 저장소 =====
interface StoreData {
    users: Map<string, any>;
    favorites: Map<string, any[]>;
    visits: Map<string, any[]>;
    reviews: any[];
    sessions: Map<string, any>;
    guestCount: number;
    analytics: any[];
}

const store: StoreData = {
    users: new Map(),
    favorites: new Map(),
    visits: new Map(),
    reviews: [],
    sessions: new Map(),
    guestCount: 0,
    analytics: [],
};

// ===== 게스트 관리 =====
export function getGuestCount(): number {
    return store.guestCount;
}

export function canRegisterGuest(): boolean {
    return store.guestCount < 50;
}

export function registerGuest(): { user_id: string; guest_number: number } | null {
    if (!canRegisterGuest()) return null;
    store.guestCount++;
    const userId = `guest_${uuidv4().slice(0, 8)}`;
    store.users.set(userId, {
        user_id: userId,
        user_type: 'guest',
        nickname: `게스트${store.guestCount}`,
        created_at: Date.now(),
        last_active: Date.now(),
    });
    return { user_id: userId, guest_number: store.guestCount };
}

// ===== 회원 관리 =====
export function registerMember(data: any): any {
    // 이메일 중복 확인
    for (const u of store.users.values()) {
        if (u.user_type === 'member' && u.email === data.email) {
            return { error: '이미 가입된 이메일이에요!' };
        }
    }

    let userId = `member_${uuidv4().slice(0, 8)}`;

    // 기존 게스트 데이터 병합 여부
    if (data.guest_id && store.users.has(data.guest_id)) {
        userId = data.guest_id; // 기존 아이디 유지하면서 타입만 변경
    }

    const newUser = {
        user_id: userId,
        user_type: 'member',
        email: data.email,
        password: data.password, // 데모 목적 평문 저장 (실제 서비스에서는 해시 필수)
        nickname: data.nickname,
        created_at: Date.now(),
        last_active: Date.now(),
    };

    store.users.set(userId, newUser);

    // 반환 시 비밀번호 제거
    const { password, ...safeUser } = newUser;
    return safeUser;
}

export function loginMember(data: any): any {
    for (const u of store.users.values()) {
        if (u.user_type === 'member' && u.email === data.email && u.password === data.password) {
            u.last_active = Date.now();
            const { password, ...safeUser } = u;
            return safeUser;
        }
    }
    return { error: '이메일 또는 비밀번호가 일치하지 않아요.' };
}

export function socialLoginMember(email: string, name: string, platform: string, guestId?: string): any {
    // 이미 해당 이메일로 가입한 내역이 있는지 먼저 확인
    for (const u of store.users.values()) {
        if (u.user_type === 'member' && u.email === email) {
            u.last_active = Date.now();
            const { password, ...safeUser } = u;
            return safeUser; // 기존 계정 로그인
        }
    }

    // 신규 소셜 회원 가입 처리
    let userId = `${platform}_${uuidv4().slice(0, 8)}`;

    // 게스트 데이터 병합 연동
    if (guestId && store.users.has(guestId)) {
        userId = guestId;
    }

    const newUser = {
        user_id: userId,
        user_type: 'member',
        email,
        nickname: name,
        social_platform: platform,
        created_at: Date.now(),
        last_active: Date.now(),
    };

    store.users.set(userId, newUser);
    return newUser;
}

// ===== 즐겨찾기 =====
export function getFavorites(userId: string): any[] {
    return store.favorites.get(userId) || [];
}

export function addFavorite(userId: string, data: any): any {
    const favs = store.favorites.get(userId) || [];
    // 게스트 최대 3개 제한
    const user = store.users.get(userId);
    if (user?.user_type === 'guest' && favs.length >= 3) {
        return { error: '게스트는 최대 3개의 카페만 저장할 수 있어요 🙏' };
    }
    // 이미 저장된 카페인지 확인
    if (favs.find((f: any) => f.cafe_id === data.cafe_id)) {
        return { error: '이미 저장된 카페예요!' };
    }
    const fav = {
        favorite_id: uuidv4(),
        user_id: userId,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        address: data.address || '',
        photo_url: data.photo_url || '',
        saved_at: Date.now(),
        memo: data.memo || '',
    };
    favs.push(fav);
    store.favorites.set(userId, favs);
    return fav;
}

export function removeFavorite(userId: string, favoriteId: string): boolean {
    const favs = store.favorites.get(userId) || [];
    const idx = favs.findIndex((f: any) => f.favorite_id === favoriteId);
    if (idx === -1) return false;
    favs.splice(idx, 1);
    store.favorites.set(userId, favs);
    return true;
}

// ===== 방문 이력 =====
export function getVisits(userId: string): any[] {
    return store.visits.get(userId) || [];
}

export function addVisit(userId: string, data: any): any {
    const visits = store.visits.get(userId) || [];
    const visit = {
        visit_id: uuidv4(),
        user_id: userId,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        visited_at: Date.now(),
        emotion_tags: data.emotion_tags || [],
    };
    visits.push(visit);
    store.visits.set(userId, visits);
    return visit;
}

// ===== 챗봇 세션 =====
export function createSession(userId: string): any {
    const session = {
        session_id: uuidv4(),
        user_id: userId,
        messages: [],
        step: 0,
        emotion_profile: {},
        is_complete: false,
        created_at: Date.now(),
    };
    store.sessions.set(session.session_id, session);
    return session;
}

export function getSession(sessionId: string): any | null {
    return store.sessions.get(sessionId) || null;
}

export function updateSession(sessionId: string, data: Partial<any>): any | null {
    const session = store.sessions.get(sessionId);
    if (!session) return null;
    Object.assign(session, data);
    store.sessions.set(sessionId, session);
    return session;
}

export function getSessionsByUser(userId: string): any[] {
    const userSessions = [];
    for (const session of store.sessions.values()) {
        if (session.user_id === userId) {
            userSessions.push(session);
        }
    }
    // 가장 최근 세션이 위로 오도록 정렬
    return userSessions.sort((a, b) => b.created_at - a.created_at);
}

// ===== 리뷰 =====
export function addReview(data: any): any {
    const review = {
        review_id: uuidv4(),
        user_id: data.user_id,
        cafe_id: data.cafe_id,
        cafe_name: data.cafe_name,
        atmosphere_tags: data.atmosphere_tags || [],
        menu_satisfaction: data.menu_satisfaction || 'good',
        one_line: data.one_line || '',
        will_revisit: data.will_revisit ?? true,
        created_at: Date.now(),
    };
    store.reviews.push(review);
    return review;
}

export function getReviewsByCafe(cafeId: string): any[] {
    return store.reviews.filter((r: any) => r.cafe_id === cafeId);
}

export function getAllReviews(): any[] {
    return store.reviews;
}

// ===== 행동 데이터 =====
export function trackEvent(event: any): void {
    store.analytics.push({
        ...event,
        timestamp: Date.now(),
    });
}

export function getAnalytics(): any[] {
    return store.analytics;
}
