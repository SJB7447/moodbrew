# 📍 위치 탐색 에이전트 (Location Search Agent)

> **역할**: 사용자의 현재 위치를 기반으로 300m 이내 영업 중인 카페 목록을 수집하고, 감성 프로파일에 맞는 후보군을 필터링한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `location-search-v1` |
| **버전** | v1.0.0 |
| **담당 Phase** | Phase 0부터 |
| **사용 API** | 카카오 로컬 API, 네이버 지도 API, Google Places API |
| **기본 탐색 반경** | 300m |
| **최대 탐색 반경** | 1km (결과 없을 시 자동 확장) |

---

## 🎯 역할 & 책임

- GPS 또는 사용자 입력 주소로 현재 위치 확보
- 300m 이내 카페 목록 API 조회
- **실시간 영업 여부** 필터링 (영업 중인 곳만)
- 카페 기본 정보 수집 및 정규화
- 감성 프로파일 기반 1차 필터링

---

## 🔄 처리 흐름

```
위치 데이터 수신 (GPS / 주소 입력)
        │
        ▼
[카카오 로컬 API 호출]
 - keyword: "카페"
 - x, y: 사용자 좌표
 - radius: 300
        │
        ▼
[영업 여부 실시간 확인]
 - 구글 플레이스 opening_hours 체크
 - 카카오 영업시간 데이터 크로스 체크
        │
        ▼
[결과 0개일 경우]
 - 반경 500m로 자동 확장
 - 여전히 없으면 1km 확장
 - 사용자에게 "조금 더 넓게 찾아볼게요" 안내
        │
        ▼
[카페 후보 목록 생성] → 추천 에이전트 전달
```

---

## 📡 API 호출 스펙

### 카카오 로컬 API
```http
GET https://dapi.kakao.com/v2/local/search/keyword.json
Headers:
  Authorization: KakaoAK {REST_API_KEY}
Params:
  query: "카페"
  x: {longitude}
  y: {latitude}
  radius: 300
  sort: distance
  size: 15
```

### 구글 Places API (영업시간 확인)
```http
GET https://maps.googleapis.com/maps/api/place/details/json
Params:
  place_id: {place_id}
  fields: opening_hours,business_status
  key: {API_KEY}
```

---

## 📦 수집 데이터 항목

```json
{
  "cafe_list": [
    {
      "cafe_id": "string",
      "name": "string",
      "address": "string",
      "distance_m": "number",
      "lat": "number",
      "lng": "number",
      "is_open": "boolean",
      "opening_hours": "string",
      "phone": "string",
      "kakao_place_id": "string",
      "naver_place_id": "string",
      "google_place_id": "string",
      "category_tags": ["카페", "디저트", "베이커리"],
      "has_wifi": "boolean | unknown",
      "has_parking": "boolean | unknown",
      "indoor_seating": "boolean | unknown",
      "photo_url": "string"
    }
  ],
  "search_radius_used": "number",
  "total_found": "number",
  "location_used": {
    "lat": "number",
    "lng": "number",
    "source": "gps | manual_input"
  }
}
```

---

## 🔍 1차 필터링 기준 (감성 프로파일 기반)

| 프로파일 항목 | 필터링 조건 |
|-------------|-----------|
| `need_parking: true` | 주차 가능 카페만 |
| `purpose: work` | 와이파이 있는 카페 우선 |
| `max_walk_minutes: 5` | 도보 5분 = 약 400m 이내 |
| `companion: solo` | 1인석 있는 카페 우선 |

---

## ⚠️ 예외 처리

```
상황                          처리 방법
────────────────────────────────────────────────
GPS 권한 없음                → 동네/주소 직접 입력 요청
영업 중인 카페 0곳           → 반경 자동 확장 (300 → 500 → 1000m)
API 타임아웃 (3초 초과)      → 캐시된 데이터 사용 (최대 30분 전)
카페 정보 불완전             → 부족한 필드는 "정보 없음" 처리
```

---

## 🔗 연결 에이전트

- **이전**: Emotion Agent (감성 프로파일 수신)
- **다음**: Recommendation Agent (카페 후보 전달)
- **보조**: Weather Agent (날씨 데이터 공유)
