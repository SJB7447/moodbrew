import { Router } from 'express';
import * as store from '../store.js';

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
