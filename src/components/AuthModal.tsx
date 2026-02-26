import { useState } from 'react';
import { Mail, Lock, User, X } from 'lucide-react';
import * as api from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
    currentGuestId: string | null;
}

export default function AuthModal({ isOpen, onClose, onSuccess, currentGuestId }: Props) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                // 백엔드 데모 로직: access_token만 전달해도 무방 (데모 모드)
                const res = await api.googleLogin({
                    access_token: tokenResponse.access_token,
                    guest_id: currentGuestId
                });
                if (res.error) {
                    setError(res.message);
                } else {
                    onSuccess(res.user);
                    onClose();
                }
            } catch (err) {
                setError('구글 로그인 중 문제가 발생했어요. 😢');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('구글 로그인에 실패했습니다.'),
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'register') {
                const res = await api.registerMember({
                    email,
                    password,
                    nickname,
                    guest_id: currentGuestId, // 기존 게스트 데이터 유지
                });
                if (res.error) {
                    setError(res.message);
                } else {
                    onSuccess(res.user);
                    onClose();
                }
            } else {
                const res = await api.loginMember({ email, password });
                if (res.error) {
                    setError(res.message);
                } else {
                    onSuccess(res.user);
                    onClose();
                }
            }
        } catch (err) {
            setError('서버와 통신하는 중 문제가 발생했어요. 😢');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setEmail('');
        setPassword('');
        setNickname('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} strokeWidth={1.5} />
                </button>

                <div className="auth-header">
                    <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
                    <p>
                        {mode === 'login'
                            ? '다시 만나서 반가워요! ☕'
                            : '무무브루의 회원이 되어주세요! 즐겨찾기 제한이 풀려요 ✨'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === 'register' && (
                        <div className="auth-input-group">
                            <User size={20} strokeWidth={1.5} className="auth-input-icon" />
                            <input
                                type="text"
                                placeholder="닉네임"
                                value={nickname}
                                onChange={e => setNickname(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <Mail size={20} strokeWidth={1.5} className="auth-input-icon" />
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <Lock size={20} strokeWidth={1.5} className="auth-input-icon" />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button
                        type="submit"
                        className="home-action-btn primary auth-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? '처리 중...'
                            : (mode === 'login' ? '로그인' : '가입하기')}
                    </button>

                    <div className="auth-divider">
                        <span>또는</span>
                    </div>

                    <button
                        type="button"
                        className="auth-google-btn"
                        onClick={() => googleLogin()}
                        disabled={isLoading}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        Google 계정으로 계속하기
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        {mode === 'login' ? '아직 회원이 아니신가요?' : '이미 회원이신가요?'}
                    </span>
                    <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
                        {mode === 'login' ? '회원가입' : '로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
}
