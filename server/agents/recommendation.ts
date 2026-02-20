// ===== 추천 엔진 에이전트 =====
// 감성 프로파일 + 카페 목록 → 감성 매칭 스코어링 → 최대 6곳 추천

interface ScoringResult {
    cafe: any;
    atmosphere_score: number;
    menu_score: number;
    distance_score: number;
    review_score: number;
    total_score: number;
    match_reason: string;
    recommended_menu: { menu_name: string; price: number; reason: string }[];
}

// 분위기 매칭 (40점)
function scoreAtmosphere(profile: any, cafe: any): { score: number; reason: string } {
    const tags = cafe.atmosphere_tags || [];
    let score = 10; // 기본 점수
    let reason = '';

    if (profile.energy_level === 'low' || profile.mood_color === 'blue' || profile.mood_color === 'gray') {
        if (tags.some((t: string) => ['조용한', '아늑한', '통창있는', '감성적인'].includes(t))) {
            score = 40;
            reason = '오늘 같은 날엔 이런 조용한 공간이 딱이에요 🌿';
        } else if (tags.some((t: string) => ['혼자오기좋은', '재충전하고싶을때'].includes(t))) {
            score = 35;
            reason = '지친 마음을 달래기에 안성맞춤이에요 🫶';
        }
    }
    if (profile.energy_level === 'high' || profile.mood_color === 'yellow') {
        if (tags.some((t: string) => ['트렌디한', '밝고활기찬', '인스타감성'].includes(t))) {
            score = 40;
            reason = '활기찬 에너지와 어울리는 트렌디한 공간이에요 ✨';
        }
    }
    if (profile.purpose === 'work') {
        if (tags.some((t: string) => ['공부하기좋은', '넓은'].includes(t))) {
            score = 38;
            reason = '집중하기 딱 좋은 조용한 공간이에요 💪';
        }
    }
    if (profile.companion === 'couple') {
        if (tags.some((t: string) => ['데이트하기좋은', '감성적인', '아늑한조명'].includes(t))) {
            score = 40;
            reason = '분위기 있는 데이트 장소로 최고예요 💕';
        }
    }
    if (profile.companion === 'solo') {
        if (tags.some((t: string) => ['혼자오기좋은', '조용한'].includes(t))) {
            score = Math.max(score, 35);
            reason = reason || '혼자만의 시간을 보내기 좋은 곳이에요 🧑';
        }
    }
    if (profile.mood_color === 'green') {
        if (tags.some((t: string) => ['아늑한', '재충전하고싶을때', '통창있는'].includes(t))) {
            score = Math.max(score, 36);
            reason = reason || '평온한 마음에 어울리는 잔잔한 공간이에요 🌿';
        }
    }
    if (profile.mood_color === 'purple') {
        if (tags.some((t: string) => ['감성적인', '아늑한조명', '야경카페'].includes(t))) {
            score = Math.max(score, 37);
            reason = reason || '감성적인 분위기가 물씬 풍기는 곳이에요 💜';
        }
    }

    if (!reason) {
        reason = '분위기 좋은 카페에서 여유를 즐겨보세요 ☕';
    }

    return { score: Math.min(score, 40), reason };
}

// 메뉴 매칭 (30점)
function scoreMenu(profile: any, cafe: any): { score: number; recommended: { menu_name: string; price: number; reason: string }[] } {
    const menus = cafe.menu || [];
    const pref = profile.drink_preference || { temperature: 'any', taste: 'any' };
    const recommended: { menu_name: string; price: number; reason: string }[] = [];
    let maxScore = 10;

    for (const menu of menus) {
        let menuScore = 0;
        let reason = '';

        const tempMatch = pref.temperature === 'any' ||
            (pref.temperature === 'hot' && menu.category === 'hot') ||
            (pref.temperature === 'cold' && menu.category === 'cold');
        const tasteMatch = pref.taste === 'any' || pref.taste === menu.taste;

        if (tempMatch && tasteMatch) {
            menuScore = 30;
            reason = '오늘 기분과 딱 맞는 맛이에요';
        } else if (tempMatch || tasteMatch) {
            menuScore = 20;
            reason = '이 메뉴도 추천해요';
        } else if (menu.category === 'dessert' && menu.taste === 'sweet') {
            menuScore = 15;
            reason = '달콤한 디저트로 기분 전환!';
        }

        if (menuScore > 0) {
            recommended.push({ menu_name: menu.name, price: menu.price, reason });
        }
        maxScore = Math.max(maxScore, menuScore);
    }

    return { score: Math.min(maxScore, 30), recommended: recommended.slice(0, 2) };
}

// 거리 점수 (20점)
function scoreDistance(distance_m: number): number {
    if (distance_m <= 100) return 20;
    if (distance_m <= 200) return 15;
    if (distance_m <= 300) return 10;
    if (distance_m <= 500) return 5;
    return 0;
}

// 리뷰 태그 매칭 (10점)
function scoreReviews(profile: any, cafe: any, reviews: any[]): number {
    if (reviews.length === 0) return 5; // 리뷰 없으면 중간
    const moodTags = profile.mood_tag || [];
    let matches = 0;
    for (const review of reviews) {
        const reviewTags = review.atmosphere_tags || [];
        for (const tag of moodTags) {
            if (reviewTags.some((rt: string) => rt.includes(tag))) matches++;
        }
    }
    return Math.min(matches * 2 + 3, 10);
}

export function generateRecommendations(profile: any, cafes: any[], reviews: any[] = []): any[] {
    const scored: ScoringResult[] = cafes.map(cafe => {
        const cafeReviews = reviews.filter((r: any) => r.cafe_id === cafe.cafe_id);
        const atm = scoreAtmosphere(profile, cafe);
        const menu = scoreMenu(profile, cafe);
        const dist = scoreDistance(cafe.distance_m);
        const rev = scoreReviews(profile, cafe, cafeReviews);
        const total = atm.score + menu.score + dist + rev;

        return {
            cafe,
            atmosphere_score: atm.score,
            menu_score: menu.score,
            distance_score: dist,
            review_score: rev,
            total_score: total,
            match_reason: atm.reason,
            recommended_menu: menu.recommended.length > 0 ? menu.recommended : [
                { menu_name: cafe.menu[0]?.name || '아메리카노', price: cafe.menu[0]?.price || 4500, reason: '이 카페의 인기 메뉴예요' },
            ],
        };
    });

    // 총점순 정렬, 최대 6곳
    scored.sort((a, b) => b.total_score - a.total_score);
    const top6 = scored.slice(0, 6);

    return top6.map((s, idx) => ({
        rank: idx + 1,
        cafe_id: s.cafe.cafe_id,
        cafe_name: s.cafe.name,
        distance_m: s.cafe.distance_m,
        match_score: s.total_score,
        match_reason: s.match_reason,
        atmosphere_tags: s.cafe.atmosphere_tags,
        recommended_menu: s.recommended_menu,
        photo_url: s.cafe.photo_url,
        is_open: s.cafe.is_open,
        closing_time: s.cafe.opening_hours.split(' - ')[1] || '22:00',
        address: s.cafe.address,
        lat: s.cafe.lat,
        lng: s.cafe.lng,
    }));
}
