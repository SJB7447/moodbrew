const API_BASE = '/api';

async function request(url: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    return res.json();
}

// User / Guest / Member
export const registerGuest = () => request('/user/guest-register', { method: 'POST' });
export const registerMember = (data: any) => request('/user/register', { method: 'POST', body: JSON.stringify(data) });
export const loginMember = (data: any) => request('/user/login', { method: 'POST', body: JSON.stringify(data) });
export const googleLogin = (data: any) => request('/user/google-auth', { method: 'POST', body: JSON.stringify(data) });
export const getGuestStatus = () => request('/user/guest-status');
export const getFavorites = (userId: string) => request(`/user/${userId}/favorites`);
export const addFavorite = (userId: string, data: any) =>
    request(`/user/${userId}/favorites`, { method: 'POST', body: JSON.stringify(data) });
export const removeFavorite = (userId: string, favId: string) =>
    request(`/user/${userId}/favorites/${favId}`, { method: 'DELETE' });

// Chat
export const startChat = (userId: string) =>
    request('/chat/start', { method: 'POST', body: JSON.stringify({ user_id: userId }) });
export const getChatSession = (sessionId: string) => request(`/chat/session/${sessionId}`);
export const getChatHistory = (userId: string) => request(`/chat/history/${userId}`);
export const sendChatMessage = (sessionId: string, message: string) =>
    request('/chat/message', { method: 'POST', body: JSON.stringify({ session_id: sessionId, message }) });

// Cafe
export const searchCafes = (lat: number, lng: number, emotionProfile?: any) =>
    request('/cafe/search', { method: 'POST', body: JSON.stringify({ lat, lng, emotion_profile: emotionProfile }) });
export const getRecommendations = (lat: number, lng: number, emotionProfile: any) =>
    request('/cafe/recommend', { method: 'POST', body: JSON.stringify({ lat, lng, emotion_profile: emotionProfile, include_weather: true }) });
export const getNavigation = (cafeId: string, params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/cafe/${cafeId}/navigate?${qs}`);
};

// Weather (Phase 1)
export const getWeather = (lat?: number, lng?: number) => {
    const params = new URLSearchParams();
    if (lat) params.set('lat', String(lat));
    if (lng) params.set('lng', String(lng));
    return request(`/weather?${params}`);
};

// Review (Phase 1)
export const submitReview = (data: any) =>
    request('/review', { method: 'POST', body: JSON.stringify(data) });
export const getCafeReviews = (cafeId: string) => request(`/review/cafe/${cafeId}`);
