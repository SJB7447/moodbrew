import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import * as api from '../services/api';

interface Props {
    cafe: any;
    userId: string;
    onComplete: () => void;
    onBack: () => void;
}

const atmosphereTags = [
    '#조용한', '#아늑한', '#넓은', '#통창있는', '#주차편한',
    '#감성적인', '#트렌디한', '#빈티지한', '#밝고활기찬', '#아늑한조명',
    '#혼자오기좋은', '#데이트하기좋은', '#공부하기좋은', '#대화하기좋은',
    '#비오는날생각나는', '#재충전하고싶을때',
];

const oneLineOptions = [
    '다음에 또 오고 싶어요',
    '특별한 날에 오면 좋겠어요',
    '혼자 집중하고 싶을 때 생각날 것 같아요',
    '친구를 데려오고 싶어요',
];

export default function ReviewPage({ cafe, userId, onComplete, onBack }: Props) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [satisfaction, setSatisfaction] = useState<string>('');
    const [oneLine, setOneLine] = useState<string>('');
    const [willRevisit, setWillRevisit] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else if (selectedTags.length < 3) {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const canSubmit = selectedTags.length > 0 && satisfaction && willRevisit !== null;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        await api.submitReview({
            user_id: userId,
            cafe_id: cafe.cafe_id,
            cafe_name: cafe.cafe_name,
            atmosphere_tags: selectedTags,
            menu_satisfaction: satisfaction,
            one_line: oneLine,
            will_revisit: willRevisit,
        });
        setSubmitted(true);
        setTimeout(onComplete, 2000);
    };

    if (submitted) {
        return (
            <div className="review-page">
                <div className="review-success">
                    <div className="review-success-icon">🎉</div>
                    <h2>감사합니다!</h2>
                    <p>소중한 리뷰가 등록되었어요.<br />다른 분들의 카페 선택에 도움이 될 거예요 ☕</p>
                </div>
            </div>
        );
    }

    return (
        <div className="review-page">
            <button className="cafe-action-btn" onClick={onBack} style={{ width: 'auto', marginBottom: 16 }}>
                <ArrowLeft size={16} /> 돌아가기
            </button>

            <h1>✍️ 감성 리뷰</h1>
            <p className="review-subtitle">
                <strong>{cafe.cafe_name}</strong>는 어떠셨어요? 30초면 끝나요!
            </p>

            {/* STEP 1: 분위기 태그 */}
            <div className="review-section">
                <h3>1. 분위기 태그 선택 (최대 3개)</h3>
                <div className="review-tags">
                    {atmosphereTags.map(tag => (
                        <button
                            key={tag}
                            className={`review-tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                            onClick={() => toggleTag(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* STEP 2: 메뉴 만족도 */}
            <div className="review-section">
                <h3>2. 메뉴는 어떠셨어요?</h3>
                <div className="review-emoji-row">
                    {[
                        { value: 'love', emoji: '😍', label: '최고예요!' },
                        { value: 'good', emoji: '😊', label: '맛있어요' },
                        { value: 'okay', emoji: '😐', label: '보통이에요' },
                        { value: 'bad', emoji: '😕', label: '별로예요' },
                    ].map(opt => (
                        <button
                            key={opt.value}
                            className={`review-emoji-btn ${satisfaction === opt.value ? 'selected' : ''}`}
                            onClick={() => setSatisfaction(opt.value)}
                        >
                            <span className="emoji">{opt.emoji}</span>
                            <span className="label">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* STEP 3: 한 줄 감상 */}
            <div className="review-section">
                <h3>3. 한 줄 감상 (선택)</h3>
                <div className="review-oneline-list">
                    {oneLineOptions.map(opt => (
                        <button
                            key={opt}
                            className={`review-oneline-btn ${oneLine === opt ? 'selected' : ''}`}
                            onClick={() => setOneLine(oneLine === opt ? '' : opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* STEP 4: 재방문 의향 */}
            <div className="review-section">
                <h3>4. 다시 올 것 같아요?</h3>
                <div className="review-revisit-row">
                    <button
                        className={`review-revisit-btn ${willRevisit === true ? 'selected' : ''}`}
                        onClick={() => setWillRevisit(true)}
                    >
                        👍 네, 또 올래요!
                    </button>
                    <button
                        className={`review-revisit-btn ${willRevisit === false ? 'selected' : ''}`}
                        onClick={() => setWillRevisit(false)}
                    >
                        👎 글쎄요...
                    </button>
                </div>
            </div>

            <button
                className="review-submit-btn"
                onClick={handleSubmit}
                disabled={!canSubmit}
            >
                리뷰 등록하기 ✨
            </button>
        </div>
    );
}
