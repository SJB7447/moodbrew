import MumuAvatar from '../components/MumuAvatar';

export default function SettingsPage() {
    return (
        <div className="favorites-page">
            <h1>⚙️ 설정</h1>
            <div className="favorites-empty">
                <div className="favorites-empty-icon">
                    <MumuAvatar state="FOCUSED" size={72} animate />
                </div>
                <h3>설정 기능 준비 중이에요</h3>
                <p>곧 알림 설정, 테마 변경 등<br />다양한 기능이 추가될 예정이에요 ☕</p>
            </div>
        </div>
    );
}
