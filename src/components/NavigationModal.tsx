import type { Recommendation } from '../types';

interface Props {
    cafe: Recommendation;
    onClose: () => void;
}

export default function NavigationModal({ cafe, onClose }: Props) {
    const { cafe_name, lat, lng } = cafe;

    const openKakaoMap = () => {
        window.open(`https://map.kakao.com/link/to/${cafe_name},${lat},${lng}`, '_blank');
    };

    const openNaverMap = () => {
        window.open(`https://map.naver.com/v5/directions/-/-/-/transit?c=${lng},${lat},15,0,0,0,dh`, '_blank');
    };

    const openGoogleMap = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>🗺️ {cafe_name}</h3>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#C8A882', marginBottom: 20 }}>
                    어떤 지도 앱으로 길을 안내할까요?
                </p>
                <div className="modal-options">
                    <button className="modal-option-btn" onClick={openKakaoMap}>
                        <span className="modal-option-icon">🗺️</span>
                        카카오맵
                    </button>
                    <button className="modal-option-btn" onClick={openNaverMap}>
                        <span className="modal-option-icon">🧭</span>
                        네이버 지도
                    </button>
                    <button className="modal-option-btn" onClick={openGoogleMap}>
                        <span className="modal-option-icon">📍</span>
                        구글 맵
                    </button>
                </div>
                <button className="modal-close-btn" onClick={onClose}>
                    닫기
                </button>
            </div>
        </div>
    );
}
