import { Trash2 } from 'lucide-react';
import type { Favorite } from '../types';
import MumuAvatar from '../components/MumuAvatar';

interface Props {
    favorites: Favorite[];
    onRemove: (favoriteId: string) => void;
}

export default function FavoritesPage({ favorites, onRemove }: Props) {
    return (
        <div className="favorites-page">
            <h1>♡ 즐겨찾기</h1>

            {favorites.length === 0 ? (
                <div className="favorites-empty">
                    <div className="favorites-empty-icon">
                        <MumuAvatar state="SAD_EMPATHY" size={72} animate />
                    </div>
                    <h3>아직 저장된 카페가 없어요</h3>
                    <p>마음에 드는 카페를 발견하면<br />♡ 버튼으로 저장해보세요</p>
                </div>
            ) : (
                <div className="favorites-list">
                    {favorites.map(fav => (
                        <div key={fav.favorite_id} className="favorite-item">
                            <div className="favorite-info">
                                <h3>{fav.cafe_name}</h3>
                                <p>{fav.address}</p>
                                {fav.memo && <p className="favorite-memo">"{fav.memo}"</p>}
                            </div>
                            <button
                                className="favorite-remove-btn"
                                onClick={() => onRemove(fav.favorite_id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
