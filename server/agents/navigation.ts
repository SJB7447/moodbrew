// ===== 길찾기 에이전트 =====
// 카카오맵/네이버맵/구글맵 딥링크 생성

export function generateNavigationLinks(
    origin: { lat: number; lng: number },
    destination: { cafe_id: string; cafe_name: string; lat: number; lng: number; address: string }
): {
    estimated_minutes: number;
    distance_m: number;
    deeplinks: { kakao: string; naver: string; google: string };
} {
    // 거리 계산 (간단한 유클리드 기반 추정)
    const R = 6371e3; // 지구 반지름 (m)
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Math.round(R * c);

    // 도보 속도 약 67m/min
    const walkMinutes = Math.max(1, Math.round(distance / 67));

    const encodedName = encodeURIComponent(destination.cafe_name);

    return {
        estimated_minutes: walkMinutes,
        distance_m: distance,
        deeplinks: {
            kakao: `https://map.kakao.com/link/to/${encodedName},${destination.lat},${destination.lng}`,
            naver: `https://map.naver.com/v5/directions/-/-/${destination.lng},${destination.lat},${encodedName}/-/walk`,
            google: `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=walking`,
        },
    };
}
