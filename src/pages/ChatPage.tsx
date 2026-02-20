import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
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
    sessionId: string;
    onComplete: (profile: any) => void;
}

// 상담 단계에 따라 무무 표정 변경
function getMumuState(step: number, isComplete: boolean): MumuState {
    if (isComplete) return 'CELEBRATE';
    if (step <= 1) return 'HAPPY';
    if (step <= 3) return 'THINKING';
    if (step <= 5) return 'EXCITED';
    return 'FOCUSED';
}

export default function ChatPage({ sessionId, onComplete }: Props) {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState(0);
    const [totalSteps] = useState(8);
    const [isComplete, setIsComplete] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 초기 메시지 로드
    useEffect(() => {
        api.startChat('current_user').then(data => {
            if (data.message) {
                setMessages([data.message]);
            }
        });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async (text: string) => {
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

        // 타이핑 애니메이션 딜레이
        await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

        try {
            const res = await api.sendChatMessage(sessionId, text.trim());
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

    const handleOptionClick = (option: string) => {
        sendMessage(option);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const progressPercent = Math.round(((step + 1) / totalSteps) * 100);
    const mumuState = getMumuState(step, isComplete);

    return (
        <div className="chat-page">
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
    );
}
