// ===== 무무 (MuMu) 캐릭터 컴포넌트 =====
// 8가지 감정 상태를 가진 3D 렌더 커피잔 마스코트 이미지

export type MumuState = 'HAPPY' | 'THINKING' | 'SAD_EMPATHY' | 'SLEEPY' | 'EXCITED' | 'RAINY' | 'CELEBRATE' | 'FOCUSED';

const MUMU_IMAGES: Record<MumuState, string> = {
    HAPPY: '/mood/mumu/excited.jpeg',
    THINKING: '/mood/mumu/happy.jpeg',
    SAD_EMPATHY: '/mood/mumu/empathy.jpeg',
    SLEEPY: '/mood/mumu/sleepy.jpeg',
    EXCITED: '/mood/mumu/focused.jpeg',
    RAINY: '/mood/mumu/rainy.jpeg',
    CELEBRATE: '/mood/mumu/thinking.jpeg',
    FOCUSED: '/mood/mumu/celebrate.jpeg',
};

const MUMU_LABELS: Record<MumuState, string> = {
    HAPPY: 'Happy',
    THINKING: 'Thinking',
    SAD_EMPATHY: 'Empathy',
    SLEEPY: 'Sleepy',
    EXCITED: 'Excited',
    RAINY: 'Rainy',
    CELEBRATE: 'Celebrate',
    FOCUSED: 'Focused',
};

interface Props {
    state?: MumuState;
    size?: number;
    animate?: boolean;
    className?: string;
    showLabel?: boolean;
}

export default function MumuAvatar({ state = 'HAPPY', size = 64, animate = true, className = '', showLabel = false }: Props) {
    const wrapperStyle: React.CSSProperties = {
        width: size,
        height: size,
        display: 'inline-block',
        animation: animate ? 'mumuFloat 3s ease-in-out infinite' : 'none',
        flexShrink: 0,
    };

    return (
        <div className={`mumu-avatar ${className}`} style={wrapperStyle}>
            <img
                src={MUMU_IMAGES[state]}
                alt={`무무 - ${MUMU_LABELS[state]}`}
                className="mumu-avatar-img"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '20%',
                }}
                draggable={false}
            />
            {showLabel && (
                <span className="mumu-avatar-label">{MUMU_LABELS[state]}</span>
            )}
        </div>
    );
}

// Export image map and labels for use in mood selector
export { MUMU_IMAGES, MUMU_LABELS };
