import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as store from '../store.js';

// 구글 클라이언트 인스턴스 (환경변수가 없으면 데모용 더미값으로 동작)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'demo-client-id.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = Router();

// 게스트 등록
router.post('/guest-register', (req, res) => {
    if (!store.canRegisterGuest()) {
        return res.status(403).json({
            error: true,
            message: '게스트 인원이 가득 찼어요 🙏\n더 나은 서비스를 위해 회원가입을 진행해 주세요!',
            guest_count: store.getGuestCount(),
            max_guests: 50,
        });
    }
    const result = store.registerGuest();
    res.json({ success: true, ...result, guest_count: store.getGuestCount() });
});

// 게스트 현황
router.get('/guest-status', (req, res) => {
    res.json({
        guest_count: store.getGuestCount(),
        max_guests: 50,
        remaining: 50 - store.getGuestCount(),
        is_full: !store.canRegisterGuest(),
    });
});

// 회원 가입
router.post('/register', (req, res) => {
    const result = store.registerMember(req.body);
    if (result.error) {
        return res.status(400).json({ error: true, message: result.error });
    }
    res.json({ success: true, user: result });
});

// 로그인
router.post('/login', (req, res) => {
    const result = store.loginMember(req.body);
    if (result.error) {
        return res.status(401).json({ error: true, message: result.error });
    }
    res.json({ success: true, user: result });
});

// 구글 소셜 로그인
router.post('/google-auth', async (req, res) => {
    try {
        const { access_token, guest_id } = req.body;
        if (!access_token) {
            return res.status(400).json({ error: true, message: '토큰이 제공되지 않았습니다.' });
        }

        let userEmail = '';
        let userName = '';

        // 실제 키가 아니거나 데모 모드일 땐 토큰 검증 생략
        if (GOOGLE_CLIENT_ID.startsWith('demo-')) {
            userEmail = `google_demo_${Date.now().toString().slice(-6)}@demo.com`;
            userName = '구글 게스트(Demo)';
        } else {
            // 실제 토큰 검증 (ID Token이 아닌 Access Token을 받았을 땐 token info API 활용)
            const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`);
            if (!tokenInfoRes.ok) throw new Error('유효하지 않은 구글 토큰입니다.');
            const tokenInfo = await tokenInfoRes.json();

            // 이메일 권한이 있는지 확인
            if (!tokenInfo.email) {
                return res.status(400).json({ error: true, message: '이메일 정보 제공 동의가 필요합니다.' });
            }

            userEmail = tokenInfo.email;
            userName = userEmail.split('@')[0]; // 이름 대신 닉네임 기본값으로 이메일 아이디 사용
        }

        // store에 위임
        const result = store.socialLoginMember(userEmail, userName, 'google', guest_id);
        res.json({ success: true, user: result });
    } catch (err: any) {
        console.error('Google Auth Error:', err);
        res.status(401).json({ error: true, message: '구글 인증에 실패했습니다.' });
    }
});

// 즐겨찾기 조회
router.get('/:userId/favorites', (req, res) => {
    const favs = store.getFavorites(req.params.userId);
    res.json({ favorites: favs, count: favs.length });
});

// 즐겨찾기 추가
router.post('/:userId/favorites', (req, res) => {
    const result = store.addFavorite(req.params.userId, req.body);
    if (result.error) {
        return res.status(400).json({ error: true, message: result.error });
    }
    res.json({ success: true, favorite: result });
});

// 즐겨찾기 삭제
router.delete('/:userId/favorites/:favId', (req, res) => {
    const removed = store.removeFavorite(req.params.userId, req.params.favId);
    if (!removed) {
        return res.status(404).json({ error: true, message: '즐겨찾기를 찾을 수 없어요' });
    }
    res.json({ success: true });
});

// 방문 이력 조회
router.get('/:userId/visits', (req, res) => {
    const visits = store.getVisits(req.params.userId);
    res.json({ visits, count: visits.length });
});

// 방문 이력 저장
router.post('/:userId/visits', (req, res) => {
    const visit = store.addVisit(req.params.userId, req.body);
    res.json({ success: true, visit });
});

export default router;
