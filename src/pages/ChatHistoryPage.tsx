import { useEffect, useState } from 'react';
import * as api from '../services/api';
import MumuAvatar, { MumuState } from '../components/MumuAvatar';
import { Calendar, MessageCircle, ArrowRight } from 'lucide-react';

interface Props {
    userId: string;
    onSelectSession: (sessionId: string) => void;
    onNavigateHome: () => void;
}

export default function ChatHistoryPage({ userId, onSelectSession, onNavigateHome }: Props) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getChatHistory(userId).then(data => {
            if (Array.isArray(data)) {
                // 완료된 상담만 표시하거나 진행 중인 것도 표시. (완료된 것만 표시 시 filter 추가 가능)
                setSessions(data.filter(s => s.is_complete));
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to load chat history:', err);
            setLoading(false);
        });
    }, [userId]);

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    };

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MumuAvatar state="THINKING" size={60} animate={true} />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '20px', textAlign: 'center' }}>
                <MumuAvatar state="SLEEPY" size={80} animate={false} />
                <p style={{ color: 'var(--mocha)', fontSize: '1rem', margin: 0 }}>
                    아직 완료된 상담 기록이 없어요.
                </p>
                <button
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, var(--mocha), var(--espresso))',
                        color: 'var(--cream)',
                        border: 'none',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-soft)'
                    }}
                    onClick={onNavigateHome}
                >
                    홈으로 가서 상담 시작하기
                </button>
            </div>
        );
    }

    return (
        <div className="chat-page" style={{ padding: '24px' }}>
            <div className="chat-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={24} color="var(--mocha)" />
                    <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--espresso)' }}>상담 기록</h1>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map(session => {
                    const profile = session.emotion_profile || {};
                    const primaryMood = profile.primary_mood || '분석 중';

                    // 기분에 따른 귀여운 아바타 상태 결정
                    let mumuState: MumuState = 'HAPPY';
                    if (primaryMood.includes('피곤')) mumuState = 'SLEEPY';
                    else if (primaryMood.includes('신남') || primaryMood.includes('행복')) mumuState = 'EXCITED';
                    else if (primaryMood.includes('고민')) mumuState = 'THINKING';

                    return (
                        <div
                            key={session.session_id}
                            className="cafe-card"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer'
                            }}
                            onClick={() => onSelectSession(session.session_id)}
                        >
                            <div style={{
                                background: 'var(--cream)',
                                padding: '8px',
                                borderRadius: '50%',
                                boxShadow: 'var(--shadow-soft)'
                            }}>
                                <MumuAvatar state={mumuState} size={40} animate={false} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Calendar size={14} color="var(--latte)" />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--latte)', fontWeight: 500 }}>
                                        {formatDate(session.created_at)}
                                    </span>
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--espresso)' }}>
                                    {primaryMood} 무드
                                </h3>
                                {/* 태그 형식으로 간략히 */}
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {Object.values(profile)
                                        .filter(v => typeof v === 'string')
                                        .slice(0, 2)
                                        .map((val: any, idx) => (
                                            <span key={idx} className="cafe-tag" style={{ background: 'var(--cream)' }}>
                                                {val}
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>

                            <ArrowRight size={20} color="var(--mocha)" style={{ opacity: 0.5 }} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
