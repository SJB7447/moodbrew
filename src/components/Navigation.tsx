import { Home, MessageCircle, Star, Heart, Settings } from 'lucide-react';
import type { AppPage } from '../types';

interface Props {
    currentPage: AppPage;
    onNavigate: (page: AppPage) => void;
}

export default function Navigation({ currentPage, onNavigate }: Props) {
    const items: { page: AppPage; icon: typeof Home; label: string }[] = [
        { page: 'home', icon: Home, label: '홈' },
        { page: 'chat', icon: MessageCircle, label: '상담' },
        { page: 'recommend', icon: Star, label: '추천' },
        { page: 'favorites', icon: Heart, label: '즐겨찾기' },
        { page: 'settings', icon: Settings, label: '설정' },
    ];

    return (
        <nav className="nav-bar">
            {items.map(item => (
                <button
                    key={item.page}
                    className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                    onClick={() => onNavigate(item.page)}
                >
                    <item.icon className="nav-icon" size={22} />
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
