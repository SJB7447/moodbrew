import { useState, useEffect, useCallback } from 'react';
import type { AppPage, User, Favorite, Recommendation, WeatherContext } from './types';
import * as api from './services/api';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import RecommendPage from './pages/RecommendPage';
import FavoritesPage from './pages/FavoritesPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import Navigation from './components/Navigation';

export default function App() {
    const [page, setPage] = useState<AppPage>('home');
    const [user, setUser] = useState<User | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [emotionProfile, setEmotionProfile] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [weatherCtx, setWeatherCtx] = useState<WeatherContext | null>(null);
    const [weatherDisplay, setWeatherDisplay] = useState<string | null>(null);
    const [counselingSummary, setCounselingSummary] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [reviewCafe, setReviewCafe] = useState<any>(null);
    const [guestStatus, setGuestStatus] = useState({ guest_count: 0, remaining: 50 });

    // 초기 로드: 날씨 + 게스트 현황
    useEffect(() => {
        api.getWeather().then(setWeatherCtx).catch(() => { });
        api.getGuestStatus().then(setGuestStatus).catch(() => { });
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    // 게스트 등록 + 상담 시작
    const handleStartChat = useCallback(async () => {
        try {
            let userId = user?.user_id;
            if (!userId) {
                const reg = await api.registerGuest();
                if (reg.error) {
                    showToast(reg.message);
                    return;
                }
                setUser({ user_id: reg.user_id, user_type: 'guest', nickname: `게스트${reg.guest_number}`, created_at: Date.now(), last_active: Date.now() });
                userId = reg.user_id;
                setGuestStatus({ guest_count: reg.guest_count, remaining: 50 - reg.guest_count });
            }
            const result = await api.startChat(userId!);
            setSessionId(result.session_id);
            setPage('chat');
        } catch (e) {
            showToast('서버 연결에 실패했어요 😢');
        }
    }, [user, showToast]);

    // 상담 완료 → 추천 로드
    const handleChatComplete = useCallback(async (profile: any) => {
        setEmotionProfile(profile);
        try {
            const result = await api.getRecommendations(37.4967, 127.0282, profile);
            setRecommendations(result.recommendations || []);
            setCounselingSummary(result.counseling_summary || '');
            setWeatherDisplay(result.weather_context || null);
            setPage('recommend');
        } catch (e) {
            showToast('추천을 불러오지 못했어요 😢');
        }
    }, [showToast]);

    // 즐겨찾기 토글
    const handleToggleFavorite = useCallback(async (cafeData: any) => {
        if (!user) return;
        const existing = favorites.find(f => f.cafe_id === cafeData.cafe_id);
        if (existing) {
            await api.removeFavorite(user.user_id, existing.favorite_id);
            setFavorites(prev => prev.filter(f => f.favorite_id !== existing.favorite_id));
            showToast('즐겨찾기에서 삭제했어요');
        } else {
            const result = await api.addFavorite(user.user_id, cafeData);
            if (result.error) {
                showToast(result.message);
            } else {
                setFavorites(prev => [...prev, result.favorite]);
                showToast('즐겨찾기에 저장했어요 ♡');
            }
        }
    }, [user, favorites, showToast]);

    // 즐겨찾기 삭제
    const handleRemoveFavorite = useCallback(async (favId: string) => {
        if (!user) return;
        await api.removeFavorite(user.user_id, favId);
        setFavorites(prev => prev.filter(f => f.favorite_id !== favId));
        showToast('즐겨찾기에서 삭제했어요');
    }, [user, showToast]);

    // 리뷰 작성 시작
    const handleStartReview = useCallback((cafe: any) => {
        setReviewCafe(cafe);
        setPage('review');
    }, []);

    // 리뷰 완료
    const handleReviewComplete = useCallback(() => {
        setReviewCafe(null);
        showToast('리뷰가 등록되었어요! 감사합니다 😊');
        setPage('recommend');
    }, [showToast]);

    // 즐겨찾기 목록 로드
    useEffect(() => {
        if (user && page === 'favorites') {
            api.getFavorites(user.user_id).then(r => setFavorites(r.favorites || [])).catch(() => { });
        }
    }, [user, page]);

    return (
        <div className="app">
            <div className="app-content">
                {page === 'home' && (
                    <HomePage
                        onStart={handleStartChat}
                        weatherCtx={weatherCtx}
                        guestStatus={guestStatus}
                    />
                )}
                {page === 'chat' && sessionId && (
                    <ChatPage
                        sessionId={sessionId}
                        onComplete={handleChatComplete}
                    />
                )}
                {page === 'recommend' && (
                    <RecommendPage
                        recommendations={recommendations}
                        counselingSummary={counselingSummary}
                        weatherDisplay={weatherDisplay}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onStartReview={handleStartReview}
                        userId={user?.user_id}
                    />
                )}
                {page === 'favorites' && (
                    <FavoritesPage
                        favorites={favorites}
                        onRemove={handleRemoveFavorite}
                    />
                )}
                {page === 'review' && reviewCafe && (
                    <ReviewPage
                        cafe={reviewCafe}
                        userId={user?.user_id || ''}
                        onComplete={handleReviewComplete}
                        onBack={() => setPage('recommend')}
                    />
                )}
                {page === 'settings' && (
                    <SettingsPage />
                )}
            </div>
            <Navigation currentPage={page} onNavigate={setPage} />
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
