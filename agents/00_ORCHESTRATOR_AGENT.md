# 🎯 오케스트레이터 에이전트 (Orchestrator Agent)

> **역할**: 전체 서비스의 두뇌. 사용자 요청을 분석하고 적절한 서브 에이전트에게 작업을 위임하며 결과를 통합한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `orchestrator-main` |
| **버전** | v1.0.0 |
| **담당 Phase** | All (Phase 0 ~ Phase 3) |
| **우선순위** | 최상위 |

---

## 🧠 역할 & 책임

- 사용자 입력을 분석하여 어떤 서브 에이전트를 호출할지 결정
- 여러 에이전트의 결과를 취합하여 최종 응답 생성
- 에이전트 간 데이터 흐름 및 컨텍스트 유지
- 오류 발생 시 폴백(fallback) 처리
- 전체 파이프라인 모니터링

---

## 🔄 에이전트 라우팅 로직

```
사용자 입력
    │
    ▼
[의도 분류]
    │
    ├─ "카페 찾아줘" / "추천해줘"
    │       └─▶ emotion_agent → location_agent → recommendation_agent
    │
    ├─ "결제할게요" / "주문"
    │       └─▶ payment_agent
    │
    ├─ "길 알려줘" / "어떻게 가?"
    │       └─▶ navigation_agent
    │
    ├─ "즐겨찾기" / "저장"
    │       └─▶ user_data_agent
    │
    ├─ "리뷰" / "후기"
    │       └─▶ review_agent
    │
    ├─ [관리자 접근]
    │       └─▶ admin_agent
    │
    └─ [카페 대표 접근]
            └─▶ owner_agent
```

---

## 📥 입력 스펙

```json
{
  "user_id": "string | guest_id",
  "session_id": "string",
  "user_type": "guest | member | owner | admin",
  "message": "string",
  "location": {
    "lat": "number",
    "lng": "number"
  },
  "context": {
    "current_phase": "counseling | recommendation | payment | navigation",
    "conversation_history": []
  }
}
```

---

## 📤 출력 스펙

```json
{
  "agent_called": "string",
  "response": "object",
  "next_action": "string",
  "session_context": "object"
}
```

---

## 🔗 연결된 서브 에이전트 목록

| 에이전트 | 파일 | 호출 조건 |
|---------|------|----------|
| 감성 상담 | `01_EMOTION_AGENT.md` | 챗봇 시작 시 |
| 위치 탐색 | `02_LOCATION_AGENT.md` | 상담 완료 후 |
| 추천 엔진 | `03_RECOMMENDATION_AGENT.md` | 위치 데이터 수신 후 |
| 결제 | `04_PAYMENT_AGENT.md` | 결제 요청 시 |
| 길찾기 | `05_NAVIGATION_AGENT.md` | 카페 선택 후 |
| 사용자 데이터 | `06_USER_DATA_AGENT.md` | 저장/조회 요청 시 |
| 리뷰 | `07_REVIEW_AGENT.md` | 방문 후 |
| 날씨 | `08_WEATHER_AGENT.md` | 추천 시 자동 호출 |
| 알림 | `09_NOTIFICATION_AGENT.md` | 이벤트 트리거 시 |
| 관리자 | `10_ADMIN_AGENT.md` | 관리자 로그인 시 |
| 카페 대표 | `11_OWNER_AGENT.md` | 대표 로그인 시 |

---

## ⚠️ 오류 처리

```
에러 유형               처리 방법
─────────────────────────────────────────
위치 권한 거부         → "위치를 입력해 주세요" 메시지
API 타임아웃           → 캐시된 데이터로 폴백
카페 정보 없음         → 반경 500m로 자동 확장
결제 실패             → 재시도 안내 후 고객센터 연결
에이전트 응답 없음     → 30초 후 재시도, 3회 실패 시 사람 상담 연결
```

---

## 📊 모니터링 지표

- 평균 응답 시간 (목표: 2초 이내)
- 에이전트 호출 성공률
- 사용자 세션 완료율
- 추천 → 결제 전환율
