# 👤 사용자 데이터 에이전트 (User Data Agent)

> **역할**: 사용자의 즐겨찾기, 방문 이력, 감성 트래킹 데이터, 회원 정보를 관리한다. 게스트 50명 제한 로직도 담당한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `user-data-v1` |
| **버전** | v1.0.0 |
| **담당 Phase** | Phase 0부터 |
| **DB** | PostgreSQL |
| **캐시** | Redis |

---

## 🎯 역할 & 책임

- 게스트 / 회원 사용자 구분 및 관리
- 즐겨찾기 카페 저장 / 조회 / 삭제
- 방문 이력 기록
- 감성 일기 & 무드 트래킹 데이터 저장 (Phase 1)
- 나만의 카페 지도 데이터 관리 (Phase 2)
- 스탬프 통합 관리 (Phase 2)

---

## 👥 사용자 등급 로직

```
앱 첫 실행
    │
    ▼
[게스트 카운터 조회] → Redis: guest_count
    │
게스트 수 < 50      게스트 수 >= 50
    │                    │
게스트로 이용 허용   회원가입 페이지로 이동
(기능 제한 없음)     "더 많은 사용자를 위해
                      회원가입이 필요해요 🙏"
```

### 게스트 제한 사항
- 즐겨찾기: 최대 3개 (회원은 무제한)
- 감성 일기: 저장 불가
- 나만의 카페 지도: 제공 안 함
- 스탬프: 적립 불가

---

## 🗃️ 데이터 스키마

### users 테이블
```sql
CREATE TABLE users (
  user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type     VARCHAR(10) DEFAULT 'guest', -- guest | member | owner | admin
  nickname      VARCHAR(50),
  email         VARCHAR(100) UNIQUE,
  phone         VARCHAR(20),
  login_method  VARCHAR(20), -- kakao | naver | apple | email
  created_at    TIMESTAMP DEFAULT NOW(),
  last_active   TIMESTAMP,
  is_active     BOOLEAN DEFAULT TRUE
);
```

### favorites 테이블
```sql
CREATE TABLE favorites (
  favorite_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(user_id),
  cafe_id       VARCHAR(100),
  cafe_name     VARCHAR(100),
  saved_at      TIMESTAMP DEFAULT NOW(),
  memo          TEXT -- 사용자가 남긴 메모
);
```

### visit_history 테이블
```sql
CREATE TABLE visit_history (
  visit_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(user_id),
  cafe_id       VARCHAR(100),
  cafe_name     VARCHAR(100),
  visited_at    TIMESTAMP DEFAULT NOW(),
  menu_ordered  JSONB,
  emotion_tags  TEXT[],
  order_id      UUID -- 결제 연동
);
```

### mood_diary 테이블 (Phase 1)
```sql
CREATE TABLE mood_diary (
  diary_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(user_id),
  visit_id      UUID REFERENCES visit_history(visit_id),
  mood_color    VARCHAR(20),
  mood_tags     TEXT[],
  short_note    TEXT,
  ai_summary    TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 📤 주요 API 엔드포인트

```
POST   /api/user/guest-register      게스트 등록 (카운터 증가)
POST   /api/user/signup              회원가입
GET    /api/user/{id}/favorites      즐겨찾기 목록 조회
POST   /api/user/{id}/favorites      즐겨찾기 추가
DELETE /api/user/{id}/favorites/{fav_id}  즐겨찾기 삭제
GET    /api/user/{id}/visits         방문 이력 조회
POST   /api/user/{id}/visits         방문 이력 저장
GET    /api/user/{id}/mood-report    감성 주간/월간 리포트 (Phase 1)
```

---

## 📊 무드 트래킹 리포트 (Phase 1)

```
주간 리포트 예시:
─────────────────────────────────────
이번 주 당신의 감성 색깔은 💙 파란색이 많았어요.
방문한 카페: 3곳
가장 많이 선택한 음료: 따뜻한 아메리카노
즐겨찾기 추가: 2곳

"요즘 조용한 시간이 필요하신 것 같아요.
 다음엔 자연광이 드는 카페를 추천해 드릴게요 🌿"
─────────────────────────────────────
```

---

## 🔗 연결 에이전트

- **이전**: Orchestrator (모든 에이전트에서 저장 요청 수신)
- **출력**: Recommendation Agent (즐겨찾기 기반 개인화), Owner Agent (방문 통계)
- **Phase 1**: Notification Agent (무드 리포트 주간 발송)
