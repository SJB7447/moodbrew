import { Home, Coffee, MessageCircle, Star, Heart, ShoppingBag, User, Settings } from 'lucide-react';
import type { AppPage } from '../types';

interface Props {
    currentPage: AppPage;
    onNavigate: (page: AppPage) => void;
    cartCount?: number;
}

export default function Navigation({ currentPage, onNavigate, cartCount = 0 }: Props) {
    const items: { page: AppPage; icon: typeof Home; label: string }[] = [
        { page: 'home', icon: Home, label: '홈' },
        { page: 'chat', icon: MessageCircle, label: '상담' },
        { page: 'recommend', icon: Star, label: '추천' },
        { page: 'favorites', icon: Heart, label: '즐겨찾기' },
    ];

    return (
        <nav className="nav-bar">
            {items.map(item => (
                <button
                    key={item.page}
                    className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                    onClick={() => onNavigate(item.page)}
                >
                    <div className="nav-icon-wrap">
                        <item.icon className="nav-icon" size={22} />
                        {item.page === 'cart' && cartCount > 0 && (
                            <span className="nav-badge">{cartCount}</span>
                        )}
                    </div>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
