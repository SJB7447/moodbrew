import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';
import MumuAvatar from '../components/MumuAvatar';

interface Props {
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
}

export default function CartPage({ items, onUpdateQuantity, onRemoveItem }: Props) {
    const totalPrice = items.reduce((sum, item) => {
        const sizePrice = item.size === 'L' ? 500 : item.size === 'S' ? -500 : 0;
        return sum + (item.product.price + sizePrice) * item.quantity;
    }, 0);

    return (
        <div className="cart-page">
            {/* 헤더 */}
            <div className="cart-header">
                <MumuAvatar state="HAPPY" size={36} animate={false} />
                <h1>장바구니</h1>
            </div>

            {items.length === 0 ? (
                <div className="cart-empty">
                    <MumuAvatar state="SAD_EMPATHY" size={80} animate />
                    <h3>장바구니가 비어있어요</h3>
                    <p>무무의 추천 메뉴를 담아보세요!</p>
                </div>
            ) : (
                <>
                    {/* 아이템 리스트 */}
                    <div className="cart-list">
                        {items.map(item => {
                            const sizePrice = item.size === 'L' ? 500 : item.size === 'S' ? -500 : 0;
                            const itemTotal = (item.product.price + sizePrice) * item.quantity;
                            return (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-img">
                                        <img src={item.product.image} alt={item.product.name} draggable={false} />
                                    </div>
                                    <div className="cart-item-info">
                                        <div className="cart-item-top">
                                            <span className="cart-item-name">{item.product.name}</span>
                                            <button className="cart-item-remove" onClick={() => onRemoveItem(item.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <span className="cart-item-option">
                                            {item.temperature} · {item.size} 사이즈
                                        </span>
                                        <div className="cart-item-bottom">
                                            <span className="cart-item-price">
                                                {itemTotal.toLocaleString()}원
                                            </span>
                                            <div className="cart-item-qty">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 결제 영역 */}
                    <div className="cart-checkout">
                        <div className="cart-total">
                            <span>총 주문 금액</span>
                            <span className="cart-total-price">{totalPrice.toLocaleString()}원</span>
                        </div>
                        <button className="cart-checkout-btn">
                            결제하기
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
