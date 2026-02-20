import { useState } from 'react';
import { MapPin, Navigation, Heart, Star } from 'lucide-react';
import type { Recommendation, Favorite } from '../types';
import NavigationModal from '../components/NavigationModal';
import MumuAvatar from '../components/MumuAvatar';

interface Props {
    recommendations: Recommendation[];
    counselingSummary: string;
    weatherDisplay: string | null;
    favorites: Favorite[];
    onToggleFavorite: (cafeData: any) => void;
    onStartReview: (cafe: any) => void;
    userId?: string;
}

const cafeEmojis = ['🏡', '🌅', '📚', '🌙', '🌿', '🌸', '☕', '🍰'];

export default function RecommendPage({
    recommendations, counselingSummary, weatherDisplay, favorites,
    onToggleFavorite, onStartReview
}: Props) {
    const [navModal, setNavModal] = useState<Recommendation | null>(null);

    const isFavorite = (cafeId: string) => favorites.some(f => f.cafe_id === cafeId);

    if (recommendations.length === 0) {
        return (
            <div className="recommend-page">
                <div className="loading-screen">
                    <MumuAvatar state="THINKING" size={72} animate />
                    <p className="loading-text">무무가 감성에 맞는 카페를 찾고 있어요...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recommend-page">
            <div className="recommend-header">
                <MumuAvatar state="EXCITED" size={64} animate />
                <h1>✨ 오늘의 추천</h1>
                <p className="recommend-summary">{counselingSummary}</p>
                {weatherDisplay && (
                    <span className="recommend-weather-ctx">{weatherDisplay}</span>
                )}
            </div>

            <div className="recommend-grid">
                {recommendations.map((rec, idx) => (
                    <div key={rec.cafe_id} className="cafe-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                        {/* 사진 영역 */}
                        <div className="cafe-card-photo">
                            <span className="cafe-card-photo-emoji">{cafeEmojis[idx % cafeEmojis.length]}</span>
                            <div className="cafe-card-rank">{rec.rank}</div>
                            <div className="cafe-card-score">
                                <Star size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                                {rec.match_score}점
                            </div>
                            <div className="cafe-card-status">
                                <span className="status-dot" />
                                <span>영업중</span>
                            </div>
                        </div>

                        {/* 정보 */}
                        <div className="cafe-card-body">
                            <h3 className="cafe-card-name">{rec.cafe_name}</h3>
                            <div className="cafe-card-distance">
                                <MapPin size={14} />
                                <span>{rec.distance_m}m · 도보 {Math.max(1, Math.round(rec.distance_m / 67))}분</span>
                            </div>

                            {/* 분위기 태그 */}
                            <div className="cafe-card-tags">
                                {rec.atmosphere_tags.slice(0, 4).map((tag, i) => (
                                    <span key={i} className="cafe-tag">#{tag}</span>
                                ))}
                            </div>

                            {/* 추천 메뉴 */}
                            <div className="cafe-card-menu">
                                <div className="cafe-card-menu-title">🍰 오늘의 추천 메뉴</div>
                                {rec.recommended_menu.map((menu, i) => (
                                    <div key={i} className="cafe-menu-item">
                                        <div>
                                            <div className="cafe-menu-item-name">
                                                <span>→</span>
                                                <span>{menu.menu_name}</span>
                                            </div>
                                            <div className="cafe-menu-item-reason">{menu.reason}</div>
                                        </div>
                                        <span className="cafe-menu-item-price">{menu.price.toLocaleString()}원</span>
                                    </div>
                                ))}
                            </div>

                            {/* 추천 이유 — 무무 코멘트 */}
                            <div className="cafe-card-reason">
                                "{rec.match_reason}"
                            </div>

                            {/* 액션 버튼 */}
                            <div className="cafe-card-actions">
                                <button
                                    className="cafe-action-btn primary"
                                    onClick={() => setNavModal(rec)}
                                >
                                    <Navigation size={16} />
                                    길찾기
                                </button>
                                <button
                                    className={`cafe-action-btn ${isFavorite(rec.cafe_id) ? 'saved' : ''}`}
                                    onClick={() => onToggleFavorite({
                                        cafe_id: rec.cafe_id,
                                        cafe_name: rec.cafe_name,
                                        address: rec.address,
                                        photo_url: rec.photo_url,
                                    })}
                                >
                                    <Heart size={16} fill={isFavorite(rec.cafe_id) ? 'currentColor' : 'none'} />
                                    {isFavorite(rec.cafe_id) ? '저장됨' : '저장'}
                                </button>
                                <button
                                    className="cafe-action-btn"
                                    onClick={() => onStartReview(rec)}
                                >
                                    <Star size={16} />
                                    리뷰
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 길찾기 모달 */}
            {navModal && (
                <NavigationModal
                    cafe={navModal}
                    onClose={() => setNavModal(null)}
                />
            )}
        </div>
    );
}
