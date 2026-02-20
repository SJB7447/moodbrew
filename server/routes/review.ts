import { Router } from 'express';
import * as store from '../store.js';

const router = Router();

// 리뷰 제출
router.post('/', (req, res) => {
    const review = store.addReview(req.body);
    store.trackEvent({ type: 'review_submit', cafe_id: req.body.cafe_id, user_id: req.body.user_id });
    res.json({ success: true, review });
});

// 카페별 리뷰 통계
router.get('/cafe/:cafeId', (req, res) => {
    const reviews = store.getReviewsByCafe(req.params.cafeId);

    // 태그 빈도 분석
    const tagCounts: Record<string, number> = {};
    let revisitCount = 0;
    const satisfactionCounts = { love: 0, good: 0, okay: 0, bad: 0 };

    for (const r of reviews) {
        for (const tag of r.atmosphere_tags || []) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
        if (r.will_revisit) revisitCount++;
        if (r.menu_satisfaction in satisfactionCounts) {
            satisfactionCounts[r.menu_satisfaction as keyof typeof satisfactionCounts]++;
        }
    }

    // 태그 빈도율
    const tagStats = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count, percentage: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);

    res.json({
        cafe_id: req.params.cafeId,
        total_reviews: reviews.length,
        tag_stats: tagStats,
        revisit_rate: reviews.length > 0 ? Math.round((revisitCount / reviews.length) * 100) : 0,
        satisfaction: satisfactionCounts,
        recent_reviews: reviews.slice(-5).reverse(),
    });
});

export default router;
