// ===== 감성 프로파일 =====
export interface EmotionProfile {
    energy_level: 'low' | 'mid' | 'high';
    mood_color: 'blue' | 'gray' | 'yellow' | 'red' | 'green' | 'purple';
    mood_tag: string[];
    companion: 'solo' | 'couple' | 'friends' | 'family';
    purpose: 'rest' | 'work' | 'talk' | 'thinking';
    drink_preference: {
        temperature: 'hot' | 'cold' | 'any';
        taste: 'sweet' | 'bitter' | 'sour' | 'any';
    };
    atmosphere: 'quiet' | 'lively' | 'any';
    budget: 'under10k' | '10k-20k' | 'any';
    need_parking: boolean;
    max_walk_minutes: number;
}

// ===== 챗봇 =====
export interface ChatMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: number;
    options?: string[];  // 선택지가 있는 경우
}

export interface ChatSession {
    session_id: string;
    user_id: string;
    messages: ChatMessage[];
    step: number;
    emotion_profile: Partial<EmotionProfile>;
    is_complete: boolean;
}

// ===== 카페 =====
export interface Cafe {
    cafe_id: string;
    name: string;
    address: string;
    distance_m: number;
    lat: number;
    lng: number;
    is_open: boolean;
    opening_hours: string;
    phone: string;
    category_tags: string[];
    has_wifi: boolean;
    has_parking: boolean;
    photo_url: string;
    atmosphere_tags: string[];
    menu: MenuItem[];
}

export interface MenuItem {
    menu_id: string;
    name: string;
    price: number;
    category: 'hot' | 'cold' | 'dessert';
    taste: 'sweet' | 'bitter' | 'sour' | 'neutral';
}

// ===== 추천 =====
export interface Recommendation {
    rank: number;
    cafe_id: string;
    cafe_name: string;
    distance_m: number;
    match_score: number;
    match_reason: string;
    atmosphere_tags: string[];
    recommended_menu: {
        menu_name: string;
        price: number;
        reason: string;
    }[];
    photo_url: string;
    is_open: boolean;
    closing_time: string;
    address: string;
    lat: number;
    lng: number;
}

// ===== 즐겨찾기 =====
export interface Favorite {
    favorite_id: string;
    user_id: string;
    cafe_id: string;
    cafe_name: string;
    address: string;
    photo_url: string;
    saved_at: number;
    memo: string;
}

// ===== 날씨 (Phase 1) =====
export interface WeatherData {
    condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'mist';
    description: string;
    temperature_c: number;
    feels_like_c: number;
    humidity: number;
    icon: string;
}

export interface WeatherContext {
    weather: WeatherData;
    time_context: {
        hour: number;
        period: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';
        is_weekend: boolean;
    };
    emotion_context_tags: string[];
    counseling_hint: string;
}

// ===== 리뷰 (Phase 1) =====
export interface Review {
    review_id: string;
    user_id: string;
    cafe_id: string;
    cafe_name: string;
    atmosphere_tags: string[];
    menu_satisfaction: 'love' | 'good' | 'okay' | 'bad';
    one_line: string;
    will_revisit: boolean;
    created_at: number;
}

// ===== 사용자 =====
export interface User {
    user_id: string;
    user_type: 'guest' | 'member' | 'owner' | 'admin';
    nickname: string;
    created_at: number;
    last_active: number;
}

// ===== 길찾기 =====
export interface NavigationLinks {
    kakao: string;
    naver: string;
    google: string;
}

// ===== 앱 상태 =====
export type AppPage = 'home' | 'chat' | 'recommend' | 'favorites' | 'review' | 'settings';

export interface AppState {
    currentPage: AppPage;
    user: User | null;
    chatSession: ChatSession | null;
    recommendations: Recommendation[];
    favorites: Favorite[];
    weatherContext: WeatherContext | null;
    isLoading: boolean;
}
