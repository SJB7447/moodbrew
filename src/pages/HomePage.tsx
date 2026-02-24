import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import type { WeatherContext } from '../types';
import * as api from '../services/api';
import MumuAvatar from '../components/MumuAvatar';
import type { MumuState } from '../components/MumuAvatar';

interface ChatMsg {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: number;
    options?: string[];
}

interface Props {
    onComplete: (profile: any) => void;
    weatherCtx: WeatherContext | null;
    guestStatus: { guest_count: number; remaining: number };
    userId: string | null;
    onUserRegister: () => Promise<{ userId: string; sessionId: string } | null>;
}

// 무드 옵션
const moodOptions = [
    { state: 'happy', emoji: '😊', label: '행복해요' },
    { state: 'sad', emoji: '😢', label: '우울해요' },
    { state: 'tired', emoji: '😴', label: '피곤해요' },
    { state: 'excited', emoji: '🥰', label: '설레요' },
    { state: 'angry', emoji: '😤', label: '짜증나요' },
    { state: 'anxious', emoji: '😰', label: '불안해요' },
    { state: 'peaceful', emoji: '😌', label: '평온해요' },
    { state: 'lonely', emoji: '🥺', label: '외로워요' },
];

// 인사말 by 시간대
function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '이 밤, 무무와 함께 따뜻한 한 잔 어때요? 🌙';
    if (hour < 11) return '좋은 아침이에요! 오늘 기분은 어때요? ☀️';
    if (hour < 14) return '점심 식사 후 달콤한 디저트 카페 어때요? 🍰';
    if (hour < 18) return '나른한 오후, 기분 전환해볼까요? ☕';
    return '수고한 오늘, 따뜻한 한 잔으로 마무리해요! ✨';
}

function getMumuState(step: number, isComplete: boolean, chatStarted: boolean): MumuState {
    if (!chatStarted) return 'HAPPY';
    if (isComplete) return 'CELEBRATE';
    if (step <= 1) return 'HAPPY';
    if (step <= 3) return 'THINKING';
    if (step <= 5) return 'EXCITED';
    return 'FOCUSED';
}

export default function HomePage({ onComplete, weatherCtx, guestStatus, userId, onUserRegister }: Props) {
    const [chatStarted, setChatStarted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState(0);
    const [totalSteps] = useState(8);
    const [isComplete, setIsComplete] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // 상담 시작
    const startChat = async (moodLabel?: string) => {
        try {
            const regResult = await onUserRegister();
            if (!regResult) return;

            setSessionId(regResult.sessionId);

            // 초기 메시지 로드
            const data = await api.startChat(regResult.userId);
            if (data.message) {
                setMessages([data.message]);
            }
            setChatStarted(true);

            // 기분을 선택했으면 자동으로 첫 메시지 전송
            if (moodLabel) {
                setTimeout(() => {
                    sendMessageDirect(regResult.sessionId, `오늘 기분이 ${moodLabel}`);
                }, 800);
            }

            setTimeout(() => inputRef.current?.focus(), 300);
        } catch (e) {
            console.error('Chat start failed:', e);
        }
    };

    // 메시지 전송 (sessionId를 직접 받는 버전)
    const sendMessageDirect = async (sid: string, text: string) => {
        if (!text.trim() || isTyping || isComplete) return;

        const userMsg: ChatMsg = {
            id: `u_${Date.now()}`,
            role: 'user',
            content: text.trim(),
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

        try {
            const res = await api.sendChatMessage(sid, text.trim());
            setIsTyping(false);

            if (res.messages) {
                for (let i = 0; i < res.messages.length; i++) {
                    if (i > 0) {
                        setIsTyping(true);
                        await new Promise(r => setTimeout(r, 600));
                        setIsTyping(false);
                    }
                    setMessages(prev => [...prev, res.messages[i]]);
                }
            }

            if (res.step !== undefined) setStep(res.step);

            if (res.is_complete) {
                setIsComplete(true);
                setTimeout(() => {
                    onComplete(res.emotion_profile);
                }, 2000);
            }
        } catch (e) {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: `err_${Date.now()}`,
                role: 'assistant',
                content: '앗, 잠시 문제가 생겼어요 😅 다시 말해주시겠어요?',
                timestamp: Date.now(),
            }]);
        }
    };

    const sendMessage = (text: string) => {
        if (sessionId) sendMessageDirect(sessionId, text);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleOptionClick = (option: string) => {
        sendMessage(option);
    };

    const progressPercent = Math.round(((step + 1) / totalSteps) * 100);
    const mumuState = getMumuState(step, isComplete, chatStarted);

    return (
        <div className="home-page">
            {/* ===== 상담 시작 전: 히어로 + 기분 선택 ===== */}
            {!chatStarted && (
                <>
                    {/* 상단 헤더 */}
                    <div className="home-header">
                        <div className="home-logo">
                            <span className="home-logo-icon">☕</span>
                            <div>
                                <span className="home-logo-text">MUOU</span>
                                <span className="home-logo-sub">BREW</span>
                            </div>
                        </div>
                        <div className="home-guest-info">
                            {guestStatus.remaining > 0 ? (
                                <span>오늘 {guestStatus.remaining}명 남음</span>
                            ) : (
                                <span>오늘 상담 마감</span>
                            )}
                        </div>
                    </div>

                    {/* 히어로 카드 */}
                    <div className="home-hero">
                        <div className="home-hero-card">
                            <div className="home-hero-bg" />
                            <div className="home-mumu">
                                <MumuAvatar state="HAPPY" size={180} animate />
                            </div>
                            <div className="home-hero-speech">
                                <p>{getGreeting()}</p>
                            </div>
                        </div>
                    </div>

                    {/* 날씨 배너 */}
                    {weatherCtx && (
                        <div className="home-weather-card">
                            <span className="weather-icon">{weatherCtx.weather.icon}</span>
                            <div className="weather-info">
                                <h3>{weatherCtx.weather.description} · {weatherCtx.weather.temperature_c}°C</h3>
                                <p>{weatherCtx.counseling_hint}</p>
                            </div>
                        </div>
                    )}

                    {/* 기분 셀렉터 */}
                    <div className="home-section">
                        <h2 className="home-section-title">🎨 지금 기분은 어때요?</h2>
                        <div className="home-mood-grid">
                            {moodOptions.map((mood, i) => (
                                <button
                                    key={mood.state}
                                    className="home-mood-card"
                                    onClick={() => startChat(mood.label)}
                                    style={{ animationDelay: `${i * 0.06}s` }}
                                >
                                    <span className="home-mood-emoji">{mood.emoji}</span>
                                    <span className="home-mood-label">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 바로 상담 시작 버튼 */}
                    <div className="home-section" style={{ paddingBottom: 24 }}>
                        <button className="home-action-btn primary" onClick={() => startChat()} style={{ width: '100%' }}>
                            💬 무무와 상담 시작하기
                        </button>
                    </div>
                </>
            )}

            {/* ===== 상담 시작 후: 채팅 인터페이스 ===== */}
            {chatStarted && (
                <div className="home-chat-container">
                    {/* 채팅 헤더 */}
                    <div className="chat-header">
                        <div className="chat-header-avatar">
                            <MumuAvatar state={mumuState} size={48} animate />
                        </div>
                        <div className="chat-header-info">
                            <h2>무무 감성 큐레이터</h2>
                            <p>오늘의 기분을 들려주세요</p>
                        </div>
                    </div>

                    {/* 커피잔 진행 바 */}
                    <div className="chat-progress">
                        <span className="chat-progress-icon">☕</span>
                        <div className="chat-progress-track">
                            <div className="chat-progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="chat-progress-label">{step + 1} / {totalSteps}</span>
                    </div>

                    {/* 메시지 영역 */}
                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id}>
                                {msg.role === 'assistant' ? (
                                    <div className="chat-msg-row assistant">
                                        <div className="chat-msg-avatar">
                                            <MumuAvatar state={mumuState} size={32} animate={false} />
                                        </div>
                                        <div className="chat-msg-content">
                                            <div className={`chat-bubble ${msg.role}`}>
                                                {msg.content}
                                            </div>
                                            {msg.options && (
                                                <div className="chat-options">
                                                    {msg.options.map((opt, i) => (
                                                        <button
                                                            key={i}
                                                            className="chat-option-btn"
                                                            onClick={() => handleOptionClick(opt)}
                                                            disabled={isTyping || isComplete}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`chat-bubble ${msg.role}`}>
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-msg-row assistant">
                                <div className="chat-msg-avatar">
                                    <MumuAvatar state={mumuState} size={32} animate={false} />
                                </div>
                                <div className="typing-indicator">
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <form className="chat-input-area" onSubmit={handleSubmit}>
                        <input
                            ref={inputRef}
                            className="chat-input"
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isComplete ? '상담이 완료되었어요! ☕' : '자유롭게 입력하세요...'}
                            disabled={isTyping || isComplete}
                        />
                        <button
                            className="chat-send-btn"
                            type="submit"
                            disabled={!input.trim() || isTyping || isComplete}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
