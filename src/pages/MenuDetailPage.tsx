import { useState } from 'react';
import { ChevronLeft, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import type { MenuProduct, CartItem } from '../types';

interface Props {
    product: MenuProduct;
    onBack: () => void;
    onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

export default function MenuDetailPage({ product, onBack, onAddToCart }: Props) {
    const [temperature, setTemperature] = useState<'HOT' | 'ICE'>(product.options.temperatures[0]);
    const [size, setSize] = useState<'S' | 'M' | 'L'>(product.options.sizes.includes('M') ? 'M' : product.options.sizes[0]);
    const [quantity, setQuantity] = useState(1);

    const sizePrice = size === 'L' ? 500 : size === 'S' ? -500 : 0;
    const totalPrice = (product.price + sizePrice) * quantity;

    const handleAddToCart = () => {
        onAddToCart({
            product,
            temperature,
            size,
            quantity,
        });
    };

    return (
        <div className="detail-page">
            {/* 히어로 이미지 */}
            <div className="detail-hero">
                <button className="detail-back-btn" onClick={onBack}>
                    <ChevronLeft size={24} />
                </button>
                <div className="detail-hero-img">
                    <img src={product.image} alt={product.name} draggable={false} />
                </div>
            </div>

            {/* 메뉴 정보 */}
            <div className="detail-body">
                <div className="detail-info">
                    <h1 className="detail-name">{product.name}</h1>
                    <p className="detail-desc">{product.description}</p>
                </div>

                {/* 옵션 선택 */}
                <div className="detail-options">
                    {/* 온도 */}
                    {product.options.temperatures.length > 1 && (
                        <div className="detail-option-group">
                            <span className="detail-option-label">온도</span>
                            <div className="detail-option-btns">
                                {product.options.temperatures.map(t => (
                                    <button
                                        key={t}
                                        className={`detail-option-btn ${temperature === t ? 'active' : ''}`}
                                        onClick={() => setTemperature(t)}
                                    >
                                        {t === 'HOT' ? '🔥 HOT' : '🧊 ICE'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 사이즈 */}
                    {product.options.sizes.length > 1 && (
                        <div className="detail-option-group">
                            <span className="detail-option-label">사이즈</span>
                            <div className="detail-option-btns">
                                {product.options.sizes.map(s => (
                                    <button
                                        key={s}
                                        className={`detail-option-btn ${size === s ? 'active' : ''}`}
                                        onClick={() => setSize(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 수량 */}
                    <div className="detail-option-group">
                        <span className="detail-option-label">수량</span>
                        <div className="detail-quantity">
                            <button
                                className="detail-qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="detail-qty-num">{quantity}</span>
                            <button
                                className="detail-qty-btn"
                                onClick={() => setQuantity(q => q + 1)}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="detail-actions">
                    <button className="detail-cart-btn" onClick={handleAddToCart}>
                        <ShoppingBag size={18} />
                        장바구니 담기
                    </button>
                    <button className="detail-buy-btn" onClick={handleAddToCart}>
                        바로 구매하기 · {totalPrice.toLocaleString()}원
                    </button>
                </div>

                {/* 리뷰 섹션 */}
                <div className="detail-reviews">
                    <div className="detail-reviews-header">
                        <h3>리뷰</h3>
                        <div className="detail-reviews-rating">
                            <Star size={16} fill="var(--mood-yellow)" stroke="var(--mood-yellow)" />
                            <span>{product.reviews.rating}</span>
                            <span className="detail-reviews-count">({product.reviews.count})</span>
                        </div>
                    </div>
                    {product.reviews.items.length > 0 ? (
                        <div className="detail-reviews-list">
                            {product.reviews.items.map((review, i) => (
                                <div key={i} className="detail-review-item">
                                    <div className="detail-review-top">
                                        <span className="detail-review-user">{review.user}</span>
                                        <div className="detail-review-stars">
                                            {Array.from({ length: 5 }).map((_, si) => (
                                                <Star key={si} size={12}
                                                    fill={si < review.rating ? 'var(--mood-yellow)' : 'none'}
                                                    stroke="var(--mood-yellow)"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="detail-review-text">{review.text}</p>
                                    <span className="detail-review-date">{review.date}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="detail-reviews-empty">아직 리뷰가 없어요</p>
                    )}
                </div>
            </div>
        </div>
    );
}
