import { ChevronRight, Coffee, ClipboardList, Settings } from 'lucide-react';
import MumuAvatar from '../components/MumuAvatar';

interface Props {
    onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: Props) {
    return (
        <div className="profile-page">
            {/* 프로필 헤더 */}
            <div className="profile-header">
                <div className="profile-avatar">
                    <MumuAvatar state="HAPPY" size={100} animate />
                </div>
                <h1 className="profile-name">무무</h1>
                <p className="profile-subtitle">☕ 오늘도 좋은 하루!</p>
            </div>

            {/* 나의 기록 섹션 */}
            <div className="profile-section">
                <h2 className="profile-section-title">무무와 함께하는 나의 기록</h2>

                <div className="profile-menu-list">
                    <button className="profile-menu-item" onClick={() => onNavigate('home')}>
                        <div className="profile-menu-icon">
                            <Coffee size={20} />
                        </div>
                        <div className="profile-menu-info">
                            <span className="profile-menu-label">무무 포인트</span>
                            <span className="profile-menu-value">50 P</span>
                        </div>
                        <ChevronRight size={18} className="profile-menu-arrow" />
                    </button>

                    <button className="profile-menu-item" onClick={() => onNavigate('cart')}>
                        <div className="profile-menu-icon">
                            <ClipboardList size={20} />
                        </div>
                        <div className="profile-menu-info">
                            <span className="profile-menu-label">주문 내역</span>
                        </div>
                        <ChevronRight size={18} className="profile-menu-arrow" />
                    </button>

                    <button className="profile-menu-item" onClick={() => onNavigate('settings')}>
                        <div className="profile-menu-icon">
                            <Settings size={20} />
                        </div>
                        <div className="profile-menu-info">
                            <span className="profile-menu-label">설정</span>
                        </div>
                        <ChevronRight size={18} className="profile-menu-arrow" />
                    </button>
                </div>
            </div>
        </div>
    );
}
