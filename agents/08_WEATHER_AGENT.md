# 🌤️ 날씨 에이전트 (Weather Agent)

> **역할**: 사용자 현재 위치의 실시간 날씨와 시간대 데이터를 수집하여 감성 상담 및 추천에 컨텍스트로 제공한다.

---

## 📌 에이전트 정보

| 항목 | 내용 |
|------|------|
| **에이전트 ID** | `weather-v1` |
| **버전** | v1.0.0 |
| **담당 Phase** | Phase 1부터 |
| **사용 API** | OpenWeatherMap API |
| **호출 방식** | 자동 (앱 실행 시 백그라운드) |
| **캐시 TTL** | 30분 |

---

## 🎯 역할 & 책임

- 현재 날씨 상태 수집 (맑음/흐림/비/눈 등)
- 기온 수집
- 시간대 파악 (오전/점심/오후/저녁/밤)
- 감성 컨텍스트 태그 생성
- Emotion Agent와 Recommendation Agent에 데이터 제공

---

## 🌈 날씨 × 시간대 감성 매핑

```
날씨          시간대        감성 컨텍스트 태그
──────────────────────────────────────────────────
☀️ 맑음       아침 (6-10)   #상쾌한아침 #에너지충전 #밝은분위기
☀️ 맑음       낮 (10-14)    #활기찬낮 #테라스카페 #시원한음료
☀️ 맑음       오후 (14-18)  #여유로운오후 #햇살가득 #달달한디저트
☀️ 맑음       저녁 (18-22)  #감성저녁 #노을카페 #따뜻한음료
🌧️ 비         아무때나      #비오는날감성 #창가자리 #핫드링크
🌥️ 흐림       아무때나      #차분한날 #조용한공간 #사색하기좋은
❄️ 눈         아무때나      #겨울감성 #따뜻한공간 #코코아한잔
🌙 밤 (22+)   아무때나      #야경카페 #늦은밤의여유 #디카페인
```

---

## 📡 API 호출 스펙

```http
GET https://api.openweathermap.org/data/2.5/weather
Params:
  lat: {latitude}
  lon: {longitude}
  appid: {API_KEY}
  lang: kr
  units: metric
```

---

## 📦 출력 데이터 스펙

```json
{
  "weather": {
    "condition": "clear | clouds | rain | snow | mist",
    "description": "맑음 | 흐림 | 비 | 눈 | 안개",
    "temperature_c": "number",
    "feels_like_c": "number",
    "humidity": "number",
    "icon": "string (날씨 아이콘 코드)"
  },
  "time_context": {
    "hour": "number",
    "period": "morning | lunch | afternoon | evening | night",
    "is_weekend": "boolean"
  },
  "emotion_context_tags": ["#비오는날감성", "#창가자리", "#핫드링크"],
  "counseling_hint": "비가 오는 저녁이네요. 창가 자리에서 따뜻한 음료 한 잔 어떠세요?",
  "cached_at": "timestamp"
}
```

---

## 💬 감성 상담 연동 멘트 예시

```
맑은 오후 → "오늘 날씨가 정말 좋네요 ☀️
              테라스 자리에서 시원한 음료 한 잔 어떠세요?"

비 오는 저녁 → "오늘 비가 오네요 🌧️
                창가 자리에서 비 소리 들으며 따뜻하게 있고 싶은 날이죠?"

추운 겨울 아침 → "오늘 꽤 춥죠 ❄️
                   따뜻하고 포근한 카페가 생각나는 날이에요"
```

---

## 🔗 연결 에이전트

- **자동 호출**: 앱 실행 시 Orchestrator가 백그라운드 실행
- **데이터 전달**: Emotion Agent (상담 중 날씨 멘트), Recommendation Agent (날씨 기반 가중치)
