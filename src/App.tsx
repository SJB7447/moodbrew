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

    // 장바구니 상태
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);

    // 초기 로드: 날씨 + 게스트 현황
    useEffect(() => {
        api.getWeather().then(setWeatherCtx).catch(() => { });
        api.getGuestStatus().then(setGuestStatus).catch(() => { });
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
                    />
                )}
                {page === 'chat' && sessionId && (
                    <ChatPage
                        sessionId={sessionId}
                        onComplete={handleChatComplete}
                    />
                )}
                {page === 'menu' && (
                    <MenuPage onSelectMenu={handleSelectMenu} />
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
            <Navigation currentPage={page} onNavigate={setPage} cartCount={cartCount} />
            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
