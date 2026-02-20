import { Router } from 'express';
import { getWeatherContext } from '../agents/weather.js';

const router = Router();

// 현재 날씨 + 감성 컨텍스트 조회
router.get('/', (req, res) => {
    const { lat, lng } = req.query;
    const ctx = getWeatherContext(Number(lat) || undefined, Number(lng) || undefined);
    res.json(ctx);
});

export default router;
