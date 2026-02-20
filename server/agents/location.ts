// ===== 위치 탐색 에이전트 =====
// 사용자 위치 기반 300m 이내 카페 목록을 수집합니다.
// 카카오 로컬 API 또는 모크 데이터 사용.

const MOCK_CAFES = [
    {
        cafe_id: 'cafe_001',
        name: '숲 속의 아틀리에',
        address: '서울시 강남구 역삼로 123',
        distance_m: 85,
        lat: 37.4967,
        lng: 127.0282,
        is_open: true,
        opening_hours: '09:00 - 22:00',
        phone: '02-1234-5678',
        category_tags: ['카페', '디저트'],
        has_wifi: true,
        has_parking: false,
        photo_url: '',
        atmosphere_tags: ['조용한', '아늑한', '통창있는', '감성적인'],
        menu: [
            { menu_id: 'm001', name: '바닐라 라떼', price: 5500, category: 'hot', taste: 'sweet' },
            { menu_id: 'm002', name: '아이스 아메리카노', price: 4500, category: 'cold', taste: 'bitter' },
            { menu_id: 'm003', name: '딸기 케이크', price: 6000, category: 'dessert', taste: 'sweet' },
        ],
    },
    {
        cafe_id: 'cafe_002',
        name: '노을빛 창가',
        address: '서울시 강남구 테헤란로 456',
        distance_m: 150,
        lat: 37.4971,
        lng: 127.0292,
        is_open: true,
        opening_hours: '08:00 - 23:00',
        phone: '02-2345-6789',
        category_tags: ['카페', '브런치'],
        has_wifi: true,
        has_parking: true,
        photo_url: '',
        atmosphere_tags: ['밝고활기찬', '트렌디한', '인스타감성'],
        menu: [
            { menu_id: 'm004', name: '캐러멜 마키아토', price: 5800, category: 'hot', taste: 'sweet' },
            { menu_id: 'm005', name: '콜드브루', price: 5000, category: 'cold', taste: 'bitter' },
            { menu_id: 'm006', name: '크로플', price: 4000, category: 'dessert', taste: 'sweet' },
        ],
    },
    {
        cafe_id: 'cafe_003',
        name: '마음쉼 서재',
        address: '서울시 강남구 선릉로 789',
        distance_m: 200,
        lat: 37.4958,
        lng: 127.0305,
        is_open: true,
        opening_hours: '10:00 - 21:00',
        phone: '02-3456-7890',
        category_tags: ['카페', '독립서점'],
        has_wifi: true,
        has_parking: false,
        photo_url: '',
        atmosphere_tags: ['조용한', '넓은', '공부하기좋은', '빈티지한'],
        menu: [
            { menu_id: 'm007', name: '핫초코', price: 5000, category: 'hot', taste: 'sweet' },
            { menu_id: 'm008', name: '아인슈페너', price: 5500, category: 'cold', taste: 'bitter' },
            { menu_id: 'm009', name: '레몬 타르트', price: 5500, category: 'dessert', taste: 'sour' },
        ],
    },
    {
        cafe_id: 'cafe_004',
        name: '별빛 뜨락',
        address: '서울시 강남구 논현로 101',
        distance_m: 120,
        lat: 37.4975,
        lng: 127.0270,
        is_open: true,
        opening_hours: '11:00 - 00:00',
        phone: '02-4567-8901',
        category_tags: ['카페', '야경'],
        has_wifi: true,
        has_parking: true,
        photo_url: '',
        atmosphere_tags: ['감성적인', '아늑한조명', '데이트하기좋은', '야경카페'],
        menu: [
            { menu_id: 'm010', name: '라벤더 라떼', price: 6000, category: 'hot', taste: 'sweet' },
            { menu_id: 'm011', name: '자몽 에이드', price: 5500, category: 'cold', taste: 'sour' },
            { menu_id: 'm012', name: '티라미수', price: 6500, category: 'dessert', taste: 'sweet' },
        ],
    },
    {
        cafe_id: 'cafe_005',
        name: '그린웨이브',
        address: '서울시 강남구 도산대로 202',
        distance_m: 250,
        lat: 37.4952,
        lng: 127.0315,
        is_open: true,
        opening_hours: '07:00 - 22:00',
        phone: '02-5678-9012',
        category_tags: ['카페', '베이커리'],
        has_wifi: true,
        has_parking: false,
        photo_url: '',
        atmosphere_tags: ['밝고활기찬', '넓은', '트렌디한'],
        menu: [
            { menu_id: 'm013', name: '말차 라떼', price: 5500, category: 'hot', taste: 'bitter' },
            { menu_id: 'm014', name: '망고 스무디', price: 6000, category: 'cold', taste: 'sweet' },
            { menu_id: 'm015', name: '소금빵', price: 3500, category: 'dessert', taste: 'neutral' },
        ],
    },
    {
        cafe_id: 'cafe_006',
        name: '달빛 정원',
        address: '서울시 강남구 삼성로 303',
        distance_m: 180,
        lat: 37.4963,
        lng: 127.0298,
        is_open: true,
        opening_hours: '09:00 - 23:00',
        phone: '02-6789-0123',
        category_tags: ['카페', '가든'],
        has_wifi: true,
        has_parking: true,
        photo_url: '',
        atmosphere_tags: ['아늑한', '통창있는', '혼자오기좋은', '재충전하고싶을때'],
        menu: [
            { menu_id: 'm016', name: '얼그레이 밀크티', price: 5800, category: 'hot', taste: 'sweet' },
            { menu_id: 'm017', name: '아이스 바닐라 라떼', price: 5500, category: 'cold', taste: 'sweet' },
            { menu_id: 'm018', name: '당근 케이크', price: 5500, category: 'dessert', taste: 'sweet' },
        ],
    },
    {
        cafe_id: 'cafe_007',
        name: '웜데이 로스터스',
        address: '서울시 강남구 봉은사로 404',
        distance_m: 290,
        lat: 37.4948,
        lng: 127.0325,
        is_open: true,
        opening_hours: '08:00 - 20:00',
        phone: '02-7890-1234',
        category_tags: ['카페', '로스터리'],
        has_wifi: true,
        has_parking: false,
        photo_url: '',
        atmosphere_tags: ['빈티지한', '조용한', '공부하기좋은'],
        menu: [
            { menu_id: 'm019', name: '드립 커피', price: 5000, category: 'hot', taste: 'bitter' },
            { menu_id: 'm020', name: '더치 커피', price: 5500, category: 'cold', taste: 'bitter' },
            { menu_id: 'm021', name: '브라우니', price: 4500, category: 'dessert', taste: 'sweet' },
        ],
    },
    {
        cafe_id: 'cafe_008',
        name: '마카롱 드림',
        address: '서울시 강남구 학동로 505',
        distance_m: 210,
        lat: 37.4960,
        lng: 127.0288,
        is_open: true,
        opening_hours: '10:00 - 22:00',
        phone: '02-8901-2345',
        category_tags: ['카페', '디저트'],
        has_wifi: true,
        has_parking: false,
        photo_url: '',
        atmosphere_tags: ['인스타감성', '트렌디한', '대화하기좋은'],
        menu: [
            { menu_id: 'm022', name: '로즈 라떼', price: 6000, category: 'hot', taste: 'sweet' },
            { menu_id: 'm023', name: '딸기 라떼', price: 6000, category: 'cold', taste: 'sweet' },
            { menu_id: 'm024', name: '마카롱 세트', price: 8000, category: 'dessert', taste: 'sweet' },
        ],
    },
];

export function searchCafes(lat: number, lng: number, radius: number = 300): any {
    // 모크 데이터 - 반경 내 카페 필터링 시뮬레이션
    let filtered = MOCK_CAFES.filter(c => c.distance_m <= radius);

    // 반경 자동 확장
    let usedRadius = radius;
    if (filtered.length === 0 && radius < 500) {
        filtered = MOCK_CAFES.filter(c => c.distance_m <= 500);
        usedRadius = 500;
    }
    if (filtered.length === 0 && usedRadius < 1000) {
        filtered = MOCK_CAFES.filter(c => c.distance_m <= 1000);
        usedRadius = 1000;
    }

    return {
        cafe_list: filtered.sort((a, b) => a.distance_m - b.distance_m),
        search_radius_used: usedRadius,
        total_found: filtered.length,
        location_used: { lat, lng, source: 'gps' },
    };
}

export function filterByProfile(cafes: any[], profile: any): any[] {
    return cafes.map(cafe => {
        let priority = 0;
        if (profile.need_parking && cafe.has_parking) priority += 5;
        if (profile.purpose === 'work' && cafe.has_wifi) priority += 5;
        if (profile.companion === 'solo' && cafe.atmosphere_tags.includes('혼자오기좋은')) priority += 3;
        if (profile.companion === 'couple' && cafe.atmosphere_tags.includes('데이트하기좋은')) priority += 3;
        return { ...cafe, filter_priority: priority };
    }).sort((a: any, b: any) => b.filter_priority - a.filter_priority);
}
