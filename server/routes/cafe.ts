import { Router } from 'express';
import * as store from '../store.js';
import { searchCafes, filterByProfile } from '../agents/location.js';
import { generateRecommendations } from '../agents/recommendation.js';
import { generateNavigationLinks } from '../agents/navigation.js';
import { getWeatherContext, applyWeatherBoost } from '../agents/weather.js';

const router = Router();

// 위치 기반 카페 탐색
router.post('/search', (req, res) => {
    const { lat = 37.4967, lng = 127.0282, radius = 300, emotion_profile } = req.body;

    const result = searchCafes(lat, lng, radius);

    // 감성 프로파일이 있으면 필터링 적용
    if (emotion_profile) {
        result.cafe_list = filterByProfile(result.cafe_list, emotion_profile);
    }

    store.trackEvent({ type: 'cafe_search', lat, lng, radius, results: result.total_found });

    res.json(result);
});

// AI 추천 (감성 매칭)
router.post('/recommend', (req, res) => {
    const { lat = 37.4967, lng = 127.0282, emotion_profile, include_weather = true } = req.body;

    if (!emotion_profile) {
        return res.status(400).json({ error: true, message: '감성 프로파일이 필요해요. 먼저 상담을 진행해주세요!' });
    }

    // 1. 카페 탐색
    const searchResult = searchCafes(lat, lng, 300);
    const cafes = filterByProfile(searchResult.cafe_list, emotion_profile);

    // 2. 리뷰 데이터 수집
    const allReviews = store.getAllReviews();

    // 3. 추천 생성
    let recommendations = generateRecommendations(emotion_profile, cafes, allReviews);

    // 4. 날씨 가중치 적용 (Phase 1)
    let weatherContext = null;
    if (include_weather) {
        weatherContext = getWeatherContext(lat, lng);
        recommendations = applyWeatherBoost(recommendations, weatherContext);
        // 점수 반영 후 재정렬
        recommendations.sort((a: any, b: any) => b.match_score - a.match_score);
        // rank 재할당
        recommendations.forEach((r: any, i: number) => { r.rank = i + 1; });
    }

    // 전체 감성 요약
    const moodTags = emotion_profile.mood_tag || [];
    const counselingSummary = moodTags.length > 0
        ? `오늘의 감성: ${moodTags.map((t: string) => `#${t}`).join(' ')}`
        : '오늘의 기분에 맞는 카페를 찾았어요 ☕';

    store.trackEvent({ type: 'recommend', recommendations_count: recommendations.length, emotion_profile });

    res.json({
        recommendations,
        total_count: recommendations.length,
        counseling_summary: counselingSummary,
        weather_context: weatherContext ? `${weatherContext.weather.icon} ${weatherContext.weather.description}, ${weatherContext.weather.temperature_c}°C` : null,
        search_radius: searchResult.search_radius_used,
    });
});

// 길찾기 딥링크
router.get('/:cafeId/navigate', (req, res) => {
    const { lat, lng, cafe_name, cafe_lat, cafe_lng, address } = req.query;

    const result = generateNavigationLinks(
        { lat: Number(lat) || 37.4967, lng: Number(lng) || 127.0282 },
        {
            cafe_id: req.params.cafeId,
            cafe_name: String(cafe_name || '카페'),
            lat: Number(cafe_lat) || 37.4967,
            lng: Number(cafe_lng) || 127.0282,
            address: String(address || ''),
        }
    );

    store.trackEvent({ type: 'navigate', cafe_id: req.params.cafeId });

    res.json(result);
});

export default router;
