import type { WeatherContext } from '../types';
import MumuAvatar from '../components/MumuAvatar';
import type { MumuState } from '../components/MumuAvatar';
import { MUMU_IMAGES, MUMU_LABELS } from '../components/MumuAvatar';

interface Props {
    onStart: () => void;
    weatherCtx: WeatherContext | null;
    guestStatus: { guest_count: number; remaining: number };
}

// 인사말 by 시간대
function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour < 6) return { text: '이 밤, 무무와 함께 따뜻한 한 잔 어때요?', emoji: '🌙' };
    if (hour < 11) return { text: '좋은 아침이에요! 오늘 기분은 어때요?', emoji: '☀️' };
    if (hour < 14) return { text: '점심 식사 후 달콤한 디저트 카페 어때요?', emoji: '🍰' };
    if (hour < 18) return { text: '나른한 오후, 기분 전환해볼까요?', emoji: '☕' };
    return { text: '수고한 오늘, 따뜻한 한 잔으로 마무리해요!', emoji: '✨' };
}

function getTimeLabel(): string {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

// 무드 셀렉터 데이터
const moodOptions: { state: MumuState; emoji: string; label: string; labelKr: string }[] = [
    { state: 'HAPPY', emoji: '😊', label: 'Happy', labelKr: '행복해요' },
    { state: 'THINKING', emoji: '🤔', label: 'Thinking', labelKr: '고민이 있어요' },
    { state: 'SAD_EMPATHY', emoji: '🥺', label: 'Empathy', labelKr: '위로가 필요해요' },
    { state: 'SLEEPY', emoji: '😴', label: 'Sleepy', labelKr: '졸려요' },
    { state: 'EXCITED', emoji: '✨', label: 'Excited', labelKr: '신나요' },
    { state: 'RAINY', emoji: '🌧️', label: 'Rainy', labelKr: '우울해요' },
    { state: 'CELEBRATE', emoji: '🎉', label: 'Celebrate', labelKr: '축하하고 싶어요' },
    { state: 'FOCUSED', emoji: '🔍', label: 'Focused', labelKr: '집중하고 싶어요' },
];

// 카페 프리뷰 데이터
const cafePreviews = [
    { emoji: '🏡', name: '코지 브루어리', desc: '아늑한 분위기 · 150m' },
    { emoji: '🌸', name: '블로썸 카페', desc: '꽃향기 가득 · 230m' },
    { emoji: '📚', name: '북카페 숲속', desc: '조용한 독서 · 310m' },
];

export default function HomePage({ onStart, weatherCtx, guestStatus }: Props) {
    const greeting = getGreeting();

    return (
        <div className="home-page">
            {/* 상단 헤더 */}
            <div className="home-header">
                <div className="home-logo">
                    <span className="home-logo-icon">☕</span>
                    <span className="home-logo-text">MUMU</span>
                    <span className="home-logo-sub">BREW</span>
                </div>
                <button className="home-profile-btn" aria-label="프로필">
                    👤
                </button>
            </div>

            {/* 히어로 영역 */}
            <div className="home-hero">
                <div className="home-mumu">
                    <MumuAvatar state="HAPPY" size={160} animate />
                </div>

                {/* 말풍선 */}
                <div className="home-speech-bubble">
                    <div className="home-speech-mumu-name">
                        <span>☕</span>
                        <span>무무</span>
                    </div>
                    <p className="home-speech-text">
                        {greeting.emoji} {greeting.text}
                    </p>
                    <div className="home-speech-time">{getTimeLabel()}</div>
                </div>
            </div>

            {/* 무드 셀렉터 그리드 */}
            <div className="home-mood-section">
                <h2 className="home-mood-title">
                    🎨 지금 기분은 어때요?
                </h2>
                <div className="home-mood-grid">
                    {moodOptions.map((mood, i) => (
                        <button
                            key={mood.state}
                            className="home-mood-card"
                            onClick={onStart}
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            <div className="home-mood-card-img">
                                <img
                                    src={MUMU_IMAGES[mood.state]}
                                    alt={mood.label}
                                    draggable={false}
                                />
                            </div>
                            <span className="home-mood-card-label">{mood.labelKr}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 날씨 배너 */}
            {weatherCtx && (
                <div className="weather-banner">
                    <div className="weather-banner-top">
                        <span className="weather-icon">{weatherCtx.weather.icon}</span>
                        <div className="weather-info">
                            <h3>{weatherCtx.weather.description} · {weatherCtx.weather.temperature_c}°C</h3>
                            <p>체감 {weatherCtx.weather.feels_like_c}°C · 습도 {weatherCtx.weather.humidity}%</p>
                        </div>
                    </div>
                    <div className="weather-tags">
                        {weatherCtx.emotion_context_tags.map((tag, i) => (
                            <span key={i} className="weather-tag">{tag}</span>
                        ))}
                    </div>
                    <p className="weather-hint">{weatherCtx.counseling_hint}</p>
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="home-actions">
                <button className="home-action-btn secondary" onClick={onStart}>
                    💬 무드 체크인
                </button>
                <button className="home-action-btn secondary" onClick={onStart}>
                    ☕ 카페 추천
                </button>
                <button className="home-action-btn primary" onClick={onStart}>
                    무무 브루잉
                </button>
            </div>

            {/* 게스트 현황 */}
            <div className="guest-banner">
                <span>👥</span>
                <span>
                    현재 <span className="guest-count">{guestStatus.guest_count}/50</span>명 이용 중
                    {guestStatus.remaining > 0
                        ? ` · ${guestStatus.remaining}명 남았어요!`
                        : ' · 가득 찼어요!'}
                </span>
            </div>

            {/* 추천 카페 프리뷰 */}
            <div className="home-cafe-section">
                <div className="home-cafe-section-header">
                    <h2 className="home-cafe-section-title">
                        ☕ 주변 카페
                    </h2>
                    <button className="home-cafe-section-more" onClick={onStart}>
                        더보기 →
                    </button>
                </div>
                <div className="home-cafe-scroll">
                    {cafePreviews.map((cafe, i) => (
                        <div key={i} className="home-cafe-card" onClick={onStart}>
                            <div className="home-cafe-card-img">
                                {cafe.emoji}
                            </div>
                            <div className="home-cafe-card-body">
                                <div className="home-cafe-card-name">{cafe.name}</div>
                                <div className="home-cafe-card-desc">{cafe.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
