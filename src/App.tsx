import { useState, useEffect, useCallback } from 'react';
import type { AppPage, User, Favorite, Recommendation, WeatherContext, CartItem, MenuProduct } from './types';
import * as api from './services/api';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import RecommendPage from './pages/RecommendPage';
import FavoritesPage from './pages/FavoritesPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import MenuPage from './pages/MenuPage';
import MenuDetailPage from './pages/MenuDetailPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import MumuAvatar from './components/MumuAvatar';
import ChatHistoryPage from './pages/ChatHistoryPage';

export default function App() {
    const [page, setPage] = useState<AppPage>('home');
    const [user, setUser] = useState<User | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [historySessionId, setHistorySessionId] = useState<string | null>(null);

    const handleNavigation = useCallback((p: AppPage) => {
        setHistorySessionId(null);
        setPage(p);
    }, []);

    const [emotionProfile, setEmotionProfile] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [weatherCtx, setWeatherCtx] = useState<WeatherContext | null>(null);
    const [weatherDisplay, setWeatherDisplay] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [counselingSummary, setCounselingSummary] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [reviewCafe, setReviewCafe] = useState<any>(null);
    const [menuCafe, setMenuCafe] = useState<any>(null);
    const [guestStatus, setGuestStatus] = useState({ guest_count: 0, remaining: 50 });

    // 장바구니 상태
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);

    // 초기 로드: 게스트 현황 + 위치 정보 기반 날씨 조회
    useEffect(() => {
        api.getGuestStatus().then(setGuestStatus).catch(() => { });

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    api.getWeather(latitude, longitude).then(setWeatherCtx).catch(() => { });
                },
                (error) => {
                    console.warn('Geolocation failed, falling back to IP/default location.', error);
                    api.getWeather().then(setWeatherCtx).catch(() => { });
                },
                { timeout: 10000, enableHighAccuracy: false }
            );
        } else {
            api.getWeather().then(setWeatherCtx).catch(() => { });
        }
    }, []);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }, []);

    // 게스트 등록 + 세션 시작 (HomePage에서 호출)
    const handleUserRegister = useCallback(async (): Promise<{ userId: string; sessionId: string } | null> => {
        try {
            let currentUserId = user?.user_id;
            if (!currentUserId) {
                const reg = await api.registerGuest();
                if (reg.error) {
                    showToast(reg.message);
                    return null;
                }
                setUser({
                    user_id: reg.user_id,
                    user_type: 'guest',
                    nickname: `게스트${reg.guest_number}`,
                    created_at: Date.now(),
                    last_active: Date.now()
                });
                currentUserId = reg.user_id;
                setGuestStatus({ guest_count: reg.guest_count, remaining: 50 - reg.guest_count });
            }
            const result = await api.startChat(currentUserId!);
            setSessionId(result.session_id);
            return { userId: currentUserId!, sessionId: result.session_id };
        } catch (e) {
            showToast('서버 연결에 실패했어요 😢');
            return null;
        }
    }, [user, showToast]);

    // 상담 완료 → 추천 로드
    const handleChatComplete = useCallback(async (profile: any) => {
        setEmotionProfile(profile);
        try {
            // 위치 정보가 없으면 기본값 강남역(37.4967, 127.0282) 사용
            const lat = location?.lat || 37.4967;
            const lng = location?.lng || 127.0282;
            const result = await api.getRecommendations(lat, lng, profile);
            setRecommendations(result.recommendations || []);
            setCounselingSummary(result.counseling_summary || '');
            setWeatherDisplay(result.weather_context || null);
            // 상담 완료 후 세션 ID 초기화하여 다음 번 채팅 탭 접근 시 히스토리 목록이 나오게 함
            setSessionId(null);
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

    // 리뷰
    const handleStartReview = useCallback((cafe: any) => {
        setReviewCafe(cafe);
        setPage('review');
    }, []);

    const handleReviewComplete = useCallback(() => {
        setReviewCafe(null);
        showToast('리뷰가 등록되었어요! 감사합니다 😊');
        setPage('recommend');
    }, [showToast]);

    // 메뉴 보기
    const handleStartMenu = useCallback((cafe: any) => {
        setMenuCafe(cafe);
        setPage('menu');
    }, []);

    // 장바구니
    const handleAddToCart = useCallback((item: Omit<CartItem, 'id'>) => {
        const newItem: CartItem = {
            ...item,
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        setCartItems(prev => [...prev, newItem]);
        showToast('장바구니에 담았어요 ☕');
        setPage('cart');
    }, [showToast]);

    const handleUpdateCartQuantity = useCallback((id: string, delta: number) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    }, []);

    const handleRemoveCartItem = useCallback((id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        showToast('삭제했어요');
    }, [showToast]);

    // 메뉴 선택
    const handleSelectMenu = useCallback((product: MenuProduct) => {
        setSelectedProduct(product);
        setPage('menu-detail');
    }, []);

    // 즐겨찾기 목록 로드
    useEffect(() => {
        if (user && page === 'favorites') {
            api.getFavorites(user.user_id).then(r => setFavorites(r.favorites || [])).catch(() => { });
        }
    }, [user, page]);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="app">
            <div className="app-content">
                {page === 'home' && (
                    <HomePage
                        onComplete={handleChatComplete}
                        weatherCtx={weatherCtx}
                        guestStatus={guestStatus}
                        userId={user?.user_id || null}
                        onUserRegister={handleUserRegister}
                        onNavigate={setPage}
                    />
                )}
                {page === 'chat' && sessionId && !historySessionId && (
                    <ChatPage
                        sessionId={sessionId}
                        onComplete={handleChatComplete}
                    />
                )}
                {page === 'chat' && historySessionId && (
                    <ChatPage
                        sessionId={historySessionId}
                        onComplete={handleChatComplete}
                        onBack={() => setHistorySessionId(null)}
                    />
                )}
                {page === 'chat' && !sessionId && !historySessionId && user && (
                    <ChatHistoryPage
                        userId={user.user_id}
                        onSelectSession={setHistorySessionId}
                        onNavigateHome={() => handleNavigation('home')}
                    />
                )}
                {page === 'chat' && !sessionId && !historySessionId && !user && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '20px', textAlign: 'center' }}>
                        <MumuAvatar state="SLEEPY" size={80} animate={false} />
                        <p style={{ color: 'var(--mocha)', fontSize: '1rem', margin: 0 }}>
                            아직 진행 중인 상담 내역이 없어요.
                        </p>
                        <button
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, var(--mocha), var(--espresso))',
                                color: 'var(--cream)',
                                border: 'none',
                                borderRadius: 'var(--radius-pill)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-soft)'
                            }}
                            onClick={() => setPage('home')}
                        >
                            홈으로 가서 상담 시작하기
                        </button>
                    </div>
                )}
                {page === 'menu' && (
                    <MenuPage
                        cafe={menuCafe}
                        onSelectMenu={handleSelectMenu}
                        cartCount={cartCount}
                        onNavigate={setPage}
                        onBack={() => setPage('recommend')}
                    />
                )}
                {page === 'menu-detail' && selectedProduct && (
                    <MenuDetailPage
                        product={selectedProduct}
                        onBack={() => setPage('menu')}
                        onAddToCart={handleAddToCart}
                    />
                )}
                {page === 'cart' && (
                    <CartPage
                        items={cartItems}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveCartItem}
                    />
                )}
                {page === 'profile' && (
                    <ProfilePage onNavigate={(p) => setPage(p as AppPage)} />
                )}
                {page === 'recommend' && (
                    <RecommendPage
                        recommendations={recommendations}
                        counselingSummary={counselingSummary}
                        weatherDisplay={weatherDisplay}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onStartReview={handleStartReview}
                        onStartMenu={handleStartMenu}
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
                {page === 'settings' && <SettingsPage />}
            </div>
            <Navigation currentPage={page} onNavigate={handleNavigation} cartCount={cartCount} />
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
