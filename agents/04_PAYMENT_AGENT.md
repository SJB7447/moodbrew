# 💳 결제 에이전트 (Payment Agent)

> **역할**: 사용자가 선택한 카페의 메뉴를 미리 결제 처리하고, 주문 확인 코드를 발급한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `payment-v1` |
| **버전** | v1.0.0 |
| **담당 Phase** | Phase 0부터 |
| **결제 모듈** | 포트원 (아임포트) |
| **지원 결제 수단** | 카드, 카카오페이, 네이버페이, 토스페이 |

---

## 🎯 역할 & 책임

- 메뉴 선택 및 수량 확인
- 결제 모듈 호출 및 처리
- 주문 확인 QR코드 생성
- 결제 내역 저장
- 취소/환불 처리

---

## 🔄 결제 흐름

```
카페 선택 → 메뉴 선택
        │
        ▼
주문 요약 화면
 - 카페명
 - 메뉴 + 수량
 - 총 결제 금액
 - 픽업 예상 시간
        │
        ▼
결제 수단 선택
 (카드 / 카카오페이 / 네이버페이 / 토스페이)
        │
        ▼
[포트원 결제 API 호출]
        │
  ┌─────┴─────┐
성공           실패
  │             │
QR 코드 발급   재시도 안내
주문 확인      (최대 3회)
카페에 주문 전송  그래도 실패 → 고객센터 연결
```

---

## 📦 주문 데이터 스펙

```json
{
  "order_id": "string (UUID)",
  "user_id": "string",
  "cafe_id": "string",
  "cafe_name": "string",
  "items": [
    {
      "menu_id": "string",
      "menu_name": "string",
      "quantity": "number",
      "unit_price": "number",
      "options": ["ICE", "샷 추가"]
    }
  ],
  "total_amount": "number",
  "payment_method": "card | kakaopay | naverpay | tosspay",
  "payment_status": "pending | success | failed | cancelled",
  "pickup_code": "string (6자리)",
  "qr_code_url": "string",
  "estimated_pickup_min": "number",
  "created_at": "timestamp",
  "cafe_notified": "boolean"
}
```

---

## 🎟️ 픽업 코드 시스템

```
결제 완료 후 6자리 픽업 코드 발급
예: AB1234

카페 도착 후 직원에게 코드 제시
또는 QR 코드 스캔으로 픽업
```

---

## 💰 수수료 구조

| 구분 | 수수료 |
|------|--------|
| 결제 대행 (PG사) | 결제금액의 1.5~3% |
| 서비스 수수료 (초기) | 0% (입점 유인) |
| 서비스 수수료 (Phase 2~) | 결제금액의 2~3% |

---

## 🔁 취소 / 환불 정책

```
픽업 전 취소    → 전액 환불 (즉시)
픽업 후 취소    → 카페 정책에 따름
음료 수령 후    → 환불 불가 (품질 이슈 제외)
```

---

## ⚠️ 예외 처리

```
상황                    처리 방법
────────────────────────────────────────────
결제 실패              → 재시도 유도 (최대 3회)
카페 주문 전송 실패    → 수동 확인 후 카페 재전송
픽업 시간 초과         → 알림 발송, 카페 확인 요청
메뉴 품절 (결제 후)    → 즉시 환불 + 다른 메뉴 제안
```

---

## 🔗 연결 에이전트

- **이전**: Recommendation Agent (카페/메뉴 정보)
- **다음**: Navigation Agent (결제 완료 후 길찾기)
- **알림**: Notification Agent (결제 완료 푸시)
- **저장**: User Data Agent (주문 이력 저장)
