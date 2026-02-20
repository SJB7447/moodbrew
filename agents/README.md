# ☕ 감성 카페 추천 서비스 — 서브 에이전트 전체 구조

> 이 문서는 서비스의 모든 서브 에이전트를 정의하고, 연결 관계와 단계별 활성화 계획을 설명합니다.

---

## 🗺️ 전체 에이전트 맵

```
                    ┌─────────────────────────┐
                    │   00. ORCHESTRATOR       │
                    │   (전체 조율 / 라우팅)    │
                    └────────────┬────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
   [사용자 플로우]          [지원 에이전트]         [관리 플로우]
          │                      │                      │
  ┌───────┴────────┐    ┌────────┴───────┐    ┌────────┴───────┐
  │ 01. EMOTION    │    │ 08. WEATHER    │    │ 10. ADMIN      │
  │ (감성 상담)    │    │ (날씨/시간대)  │    │ (서비스 관리자) │
  └───────┬────────┘    └────────────────┘    └────────────────┘
          │                                            │
  ┌───────┴────────┐                         ┌────────┴───────┐
  │ 02. LOCATION   │                         │ 11. OWNER      │
  │ (위치 탐색)    │                         │ (카페 대표)     │
  └───────┬────────┘                         └────────────────┘
          │
  ┌───────┴────────┐
  │ 03. RECOMMEND  │
  │ (추천 엔진)    │
  └───┬────────┬───┘
      │        │
┌─────┴──┐  ┌──┴──────┐
│04.PAY  │  │05.NAVI  │
│(결제)  │  │(길찾기)  │
└─────┬──┘  └──┬──────┘
      │        │
      └────┬───┘
           │
  ┌────────┴───────┐     ┌─────────────────┐
  │ 06. USER DATA  │     │ 09. NOTIFICATION │
  │ (사용자 데이터) │────▶│ (알림 발송)      │
  └────────┬───────┘     └─────────────────┘
           │
  ┌────────┴───────┐
  │ 07. REVIEW     │
  │ (감성 리뷰)    │
  └────────────────┘
```

---

## 📋 에이전트 목록 및 담당 Phase

| # | 파일명 | 에이전트 이름 | Phase | 우선순위 |
|---|--------|-------------|-------|---------|
| 00 | `00_ORCHESTRATOR_AGENT.md` | 오케스트레이터 | 0~ | 🔴 필수 |
| 01 | `01_EMOTION_AGENT.md` | 감성 상담 | 0~ | 🔴 필수 |
| 02 | `02_LOCATION_AGENT.md` | 위치 탐색 | 0~ | 🔴 필수 |
| 03 | `03_RECOMMENDATION_AGENT.md` | 추천 엔진 | 0~ | 🔴 필수 |
| 04 | `04_PAYMENT_AGENT.md` | 결제 | 0~ | 🔴 필수 |
| 05 | `05_NAVIGATION_AGENT.md` | 길찾기 | 0~ | 🔴 필수 |
| 06 | `06_USER_DATA_AGENT.md` | 사용자 데이터 | 0~ | 🔴 필수 |
| 07 | `07_REVIEW_AGENT.md` | 감성 리뷰 | 1~ | 🟡 Phase 1 |
| 08 | `08_WEATHER_AGENT.md` | 날씨 | 1~ | 🟡 Phase 1 |
| 09 | `09_NOTIFICATION_AGENT.md` | 알림 | 0~ | 🔴 필수 |
| 10 | `10_ADMIN_AGENT.md` | 관리자 | 0~ | 🔴 필수 |
| 11 | `11_OWNER_AGENT.md` | 카페 대표 | 2~ | 🔵 Phase 2 |

---

## 🔄 핵심 사용자 플로우 (Phase 0)

```
1. 사용자 앱 실행
        ↓
2. [Orchestrator] 사용자 유형 확인 (게스트/회원)
        ↓
3. [User Data] 게스트 카운터 확인 (50명 제한)
        ↓
4. [Emotion] 감성 상담 시작 (5~10 문답)
        ↓
5. [Location] 300m 이내 영업 중 카페 탐색
        ↓
6. [Recommendation] 감성 매칭 스코어링 → 최대 6곳 추천
        ↓
7. 사용자 카페 선택
        ↓
8-A. [Navigation] 길찾기 실행
8-B. [Payment] 미리 결제 → QR 픽업코드 발급
        ↓
9. [Notification] 결제 완료 / 도착 알림
        ↓
10. [Review] 방문 후 감성 태그 리뷰 (Phase 1)
        ↓
11. [User Data] 즐겨찾기 저장 / 방문 이력 기록
```

---

## 📅 Phase별 에이전트 활성화 계획

### Phase 0 (베타 출시) — 즉시 구현
```
✅ Orchestrator   ✅ Emotion      ✅ Location
✅ Recommendation ✅ Payment      ✅ Navigation
✅ User Data      ✅ Notification ✅ Admin
```

### Phase 1 (3개월차) — 날씨 + 리뷰 추가
```
✅ Weather Agent 활성화
✅ Review Agent 활성화
✅ Notification Agent 마케팅 알림 확장
✅ User Data Agent 무드 트래킹 추가
```

### Phase 2 (5개월차) — 대표 페이지 + 스탬프
```
✅ Owner Agent 활성화 (베이직 플랜)
✅ 스탬프 시스템 통합
✅ 시즌 메뉴 등록 기능
✅ Admin Agent CRM 기능 추가
```

### Phase 3 (7개월차) — AI 고급 분석 + 수익화
```
✅ Owner Agent AI 운영 진단 (스탠다드/프로)
✅ AI 원가 계산 / 재무제표 / 재고 관리
✅ 광고 입점 클라이언트 페이지
✅ 구독 요금제 본격 수익화
```

---

## 🔗 에이전트 간 데이터 흐름

```
Emotion → Location → Recommendation
   ↑           ↑            ↓
Weather    [카카오/      Payment → Notification
           네이버API]       ↓
                       Navigation
                            ↓
                    User Data ← Review
                        ↓
                   Admin / Owner
```

---

## 🛠️ 기술 스택 요약

| 레이어 | 기술 |
|--------|------|
| AI 엔진 | Claude API (감성 상담, 추천 이유 생성, 운영 진단) |
| 위치/지도 | 카카오 로컬 API, 네이버 지도 API, 구글 Places API |
| 날씨 | OpenWeatherMap API |
| 결제 | 포트원 (아임포트) |
| 알림 | FCM, 카카오 알림톡 |
| DB | PostgreSQL (메인), Redis (캐시/세션) |
| 백엔드 | Node.js + Express 또는 FastAPI |
| 프론트 | React Native (앱), Next.js (웹 대시보드) |

---

*최종 수정: Phase 0 기준 v1.0.0*
*추후 업데이트 시 각 에이전트 파일 버전 함께 관리*
