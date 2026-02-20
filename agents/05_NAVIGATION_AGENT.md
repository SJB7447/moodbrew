# 🗺️ 길찾기 에이전트 (Navigation Agent)

> **역할**: 사용자가 선택한 카페까지의 경로를 카카오맵, 네이버맵, 구글맵과 연동하여 안내한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `navigation-v1` |
| **버전** | v1.0.0 |
| **담당 Phase** | Phase 0부터 |
| **지원 지도** | 카카오맵, 네이버맵, 구글맵 |
| **기본 이동 수단** | 도보 (300m 이내이므로) |

---

## 🎯 역할 & 책임

- 선택된 카페의 좌표 수신
- 사용자 현재 위치 → 카페까지 경로 계산
- 지도 앱 딥링크 생성 및 실행
- 인앱 지도 미리보기 제공
- 도착 감지 및 알림

---

## 🔄 길찾기 흐름

```
카페 선택 (추천 카드에서)
        │
        ▼
[길찾기 버튼 탭]
        │
        ▼
지도 앱 선택 팝업
 ① 카카오맵으로 보기
 ② 네이버맵으로 보기
 ③ 구글맵으로 보기
 ④ 앱 내 지도 보기
        │
        ▼
선택된 지도 앱 딥링크 실행
또는
인앱 지도 표시
        │
        ▼
[도착 감지] → Notification Agent 호출
"도착하셨나요? 즐거운 시간 되세요 ☕"
```

---

## 🔗 딥링크 스펙

### 카카오맵
```
kakaomap://route?
  sp={출발lat},{출발lng}
  &ep={도착lat},{도착lng}
  &by=FOOT
```

### 네이버맵
```
nmap://route/walk?
  slat={출발lat}
  &slng={출발lng}
  &dlat={도착lat}
  &dlng={도착lng}
  &dname={카페명}
```

### 구글맵
```
https://www.google.com/maps/dir/
  ?api=1
  &origin={출발lat},{출발lng}
  &destination={도착lat},{도착lng}
  &travelmode=walking
```

---

## 📍 인앱 지도 미리보기

앱 내에서 간단한 경로 미리보기 제공:

```
┌──────────────────────────────┐
│         🗺️ 미니 지도          │
│   [현재위치 📍] ──→ [카페 ☕] │
│                               │
│  도보 약 3분 (250m)           │
│                               │
│  [카카오맵] [네이버맵] [구글]  │
└──────────────────────────────┘
```

---

## 📦 입력 / 출력 스펙

### 입력
```json
{
  "origin": { "lat": "number", "lng": "number" },
  "destination": {
    "cafe_id": "string",
    "cafe_name": "string",
    "lat": "number",
    "lng": "number",
    "address": "string"
  },
  "travel_mode": "walk | car | transit"
}
```

### 출력
```json
{
  "estimated_minutes": "number",
  "distance_m": "number",
  "deeplinks": {
    "kakao": "string",
    "naver": "string",
    "google": "string"
  },
  "route_preview_url": "string"
}
```

---

## 🚶 도착 감지 로직 (Phase 1 추가)

```
결제 완료 후 백그라운드에서 위치 추적 시작
        │
목적지 100m 이내 진입 감지
        │
        ▼
푸시 알림: "카페에 거의 다 오셨네요! 
           픽업 코드: AB1234 준비해 주세요 ☕"
        │
        ▼
방문 후 리뷰 요청 (Notification Agent → Review Agent)
```

---

## 🔗 연결 에이전트

- **이전**: Recommendation Agent / Payment Agent
- **다음**: Notification Agent (도착 알림)
- **연동**: Review Agent (방문 완료 후 리뷰 요청)
