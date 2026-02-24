import { Search } from 'lucide-react';
import type { MenuProduct } from '../types';
import MumuAvatar from '../components/MumuAvatar';
import { useState } from 'react';

// 더미 메뉴 데이터
const menuProducts: MenuProduct[] = [
    {
        id: 'menu_1', name: '시그니처 라떼', nameEn: 'Signature Latte',
        price: 13900, image: '/mumu/happy.png',
        description: '무무 브루의 시그니처! 부드러운 라떼 위에 무무 아트가 올라간 특별한 한 잔',
        category: 'coffee',
        options: { temperatures: ['HOT', 'ICE'], sizes: ['S', 'M', 'L'] },
        reviews: {
            rating: 4.8, count: 124, items: [
                { user: '카페러버', rating: 5, text: '정말 부드럽고 맛있어요!', date: '2026.02.20' },
                { user: '무무팬', rating: 5, text: '아트가 너무 귀여워요 ☕', date: '2026.02.18' }
            ]
        }
    },
    {
        id: 'menu_2', name: '크림라떼 허니', nameEn: 'Cream Latte Honey',
        price: 11900, image: '/mumu/thinking.png',
        description: '달콤한 허니와 부드러운 크림이 조화로운 라떼. 고민이 많은 날 추천!',
        category: 'coffee',
        options: { temperatures: ['HOT', 'ICE'], sizes: ['S', 'M', 'L'] },
        reviews: {
            rating: 4.6, count: 89, items: [
                { user: '단맛좋아', rating: 5, text: '꿀 향이 은은해서 좋아요', date: '2026.02.19' }
            ]
        }
    },
    {
        id: 'menu_3', name: '크림 라떼', nameEn: 'Coffee Latte',
        price: 17500, image: '/mumu/excited.png',
        description: '깊은 에스프레소와 풍성한 크림의 만남. 기분 좋은 하루의 시작!',
        category: 'coffee',
        options: { temperatures: ['HOT', 'ICE'], sizes: ['S', 'M', 'L'] },
        reviews: {
            rating: 4.9, count: 203, items: [
                { user: '커피마니아', rating: 5, text: '크림이 정말 풍성해요', date: '2026.02.21' }
            ]
        }
    },
    {
        id: 'menu_4', name: '카라멜 마끼아또', nameEn: 'Coffee Macchiato',
        price: 13900, image: '/mumu/celebrate.png',
        description: '달콤한 카라멜과 부드러운 우유 거품의 완벽한 조화',
        category: 'coffee',
        options: { temperatures: ['HOT', 'ICE'], sizes: ['S', 'M', 'L'] },
        reviews: { rating: 4.7, count: 156, items: [] }
    },
    {
        id: 'menu_5', name: '푸딩 아이스티', nameEn: 'Tea with Coffee',
        price: 12500, image: '/mumu/sleepy.png',
        description: '상큼한 아이스티 위에 부드러운 푸딩이 올라간 특별한 음료',
        category: 'tea',
        options: { temperatures: ['ICE'], sizes: ['M', 'L'] },
        reviews: { rating: 4.5, count: 67, items: [] }
    },
    {
        id: 'menu_6', name: '시나몬 다쿠아즈 디저트', nameEn: 'Ube Dacquoise Joy',
        price: 17900, image: '/mumu/focused.png',
        description: '바삭한 다쿠아즈에 시나몬 크림을 듬뿍. 집중할 때 에너지 충전!',
        category: 'dessert',
        options: { temperatures: ['HOT'], sizes: ['S'] },
        reviews: { rating: 4.8, count: 92, items: [] }
    },
    {
        id: 'menu_7', name: '디저트 트리오', nameEn: 'Coffee Tea Harmony',
        price: 12900, image: '/mumu/rainy.png',
        description: '비 오는 날 어울리는 세 가지 미니 디저트 세트',
        category: 'dessert',
        options: { temperatures: ['HOT'], sizes: ['S'] },
        reviews: { rating: 4.4, count: 45, items: [] }
    },
    {
        id: 'menu_8', name: '무화과 차', nameEn: 'Sunset Tea',
        price: 12500, image: '/mumu/empathy.png',
        description: '은은한 무화과 향의 따뜻한 차. 마음이 편안해지는 한 잔',
        category: 'tea',
        options: { temperatures: ['HOT'], sizes: ['S', 'M'] },
        reviews: { rating: 4.6, count: 78, items: [] }
    },
    {
        id: 'menu_9', name: '타르트 딸 장미', nameEn: 'Flamingo pink dahllia',
        price: 17900, image: '/mumu/celebrate.png',
        description: '장미 크림을 올린 프리미엄 타르트. 특별한 날을 위한 디저트',
        category: 'dessert',
        options: { temperatures: ['HOT'], sizes: ['S'] },
        reviews: { rating: 4.9, count: 34, items: [] }
    },
];

interface Props {
    onSelectMenu: (product: MenuProduct) => void;
}

export default function MenuPage({ onSelectMenu }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = menuProducts.filter(p =>
        p.name.includes(searchQuery) || p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="menu-page">
            {/* 상단 헤더 */}
            <div className="menu-header">
                <div className="menu-header-logo">
                    <MumuAvatar state="HAPPY" size={36} animate={false} />
                </div>
                <h1>메뉴</h1>
            </div>

            {/* 검색바 */}
            <div className="menu-search-bar">
                <Search size={18} className="menu-search-icon" />
                <input
                    type="text"
                    placeholder="무무와 함께 메뉴 찾기"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="menu-search-input"
                />
                {searchQuery && (
                    <button className="menu-search-clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
            </div>

            {/* 메뉴 그리드 */}
            <div className="menu-grid">
                {filteredProducts.map((product, idx) => (
                    <button
                        key={product.id}
                        className="menu-grid-item"
                        onClick={() => onSelectMenu(product)}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                        <div className="menu-grid-item-img">
                            <img src={product.image} alt={product.name} draggable={false} />
                        </div>
                        <div className="menu-grid-item-info">
                            <span className="menu-grid-item-name">{product.name}</span>
                            <span className="menu-grid-item-name-en">{product.nameEn}</span>
                            <span className="menu-grid-item-price">
                                {product.price.toLocaleString()}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export { menuProducts };
