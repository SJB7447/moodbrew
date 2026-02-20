// ===== 날씨 에이전트 (Phase 1) =====
// 현재 날씨 + 시간대 → 감성 컨텍스트 태그 생성

interface WeatherResponse {
    weather: {
        condition: string;
        description: string;
        temperature_c: number;
        feels_like_c: number;
        humidity: number;
        icon: string;
    };
    time_context: {
        hour: number;
        period: string;
        is_weekend: boolean;
    };
    emotion_context_tags: string[];
    counseling_hint: string;
}

function getTimePeriod(hour: number): string {
    if (hour >= 6 && hour < 10) return 'morning';
    if (hour >= 10 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
}

function isWeekend(): boolean {
    const day = new Date().getDay();
    return day === 0 || day === 6;
}

const weatherEmotionMap: Record<string, Record<string, { tags: string[]; hint: string }>> = {
    clear: {
        morning: { tags: ['#상쾌한아침', '#에너지충전', '#밝은분위기'], hint: '상쾌한 아침이에요 ☀️ 활기찬 하루의 시작, 밝은 카페에서 시작해볼까요?' },
        lunch: { tags: ['#활기찬낮', '#테라스카페', '#시원한음료'], hint: '화창한 낮이네요! ☀️ 테라스 자리에서 시원한 음료 한 잔 어떠세요?' },
        afternoon: { tags: ['#여유로운오후', '#햇살가득', '#달달한디저트'], hint: '따스한 오후 햇살이 좋은 날이에요 ☀️ 디저트와 함께 여유를 즐겨보세요~' },
        evening: { tags: ['#감성저녁', '#노을카페', '#따뜻한음료'], hint: '노을이 예쁜 저녁이에요 🌅 따뜻한 음료와 함께 감성 충전하세요~' },
        night: { tags: ['#야경카페', '#늦은밤의여유', '#디카페인'], hint: '고요한 밤이에요 🌙 야경이 보이는 카페에서 하루를 마무리해보세요~' },
    },
    rain: {
        morning: { tags: ['#비오는날감성', '#창가자리', '#핫드링크'], hint: '비 오는 아침이에요 🌧️ 따뜻한 카페에서 여유롭게 시작해볼까요?' },
        lunch: { tags: ['#비오는날감성', '#아늑한공간', '#핫드링크'], hint: '비 오는 점심이네요 🌧️ 빗소리 들으며 아늑한 카페 어때요?' },
        afternoon: { tags: ['#비오는날감성', '#창가자리', '#핫드링크'], hint: '비 오는 오후예요 🌧️ 창가 자리에서 비 소리 들으며 커피 한 잔 어때요?' },
        evening: { tags: ['#비오는날감성', '#아늑한카페', '#따뜻한위로'], hint: '비 오는 저녁이네요 🌧️ 따뜻한 공간에서 마음까지 녹여보세요~' },
        night: { tags: ['#비오는밤', '#감성충전', '#핫초코'], hint: '비 오는 밤이에요 🌧️ 핫초코 한 잔과 함께 잔잔한 시간 보내세요~' },
    },
    clouds: {
        morning: { tags: ['#차분한날', '#조용한공간', '#사색하기좋은'], hint: '흐린 아침이에요 🌥️ 차분한 분위기의 카페에서 생각에 잠겨볼까요?' },
        lunch: { tags: ['#차분한하루', '#아늑한카페', '#따뜻한음료'], hint: '흐린 날이에요 🌥️ 아늑한 카페에서 따뜻한 한 잔 어떠세요?' },
        afternoon: { tags: ['#조용한오후', '#감성적인', '#차한잔'], hint: '잔잔한 오후네요 🌥️ 감성적인 카페에서 여유를 즐겨보세요~' },
        evening: { tags: ['#차분한저녁', '#아늑한조명', '#위로의시간'], hint: '흐린 저녁이에요 🌥️ 조명 좋은 카페에서 마음을 달래보세요~' },
        night: { tags: ['#고요한밤', '#따뜻한공간', '#디카페인'], hint: '구름 낀 밤이에요 🌥️ 따뜻한 공간에서 하루를 정리해보세요~' },
    },
    snow: {
        morning: { tags: ['#겨울감성', '#따뜻한공간', '#코코아한잔'], hint: '눈이 와요! ❄️ 따뜻한 카페에서 코코아 한 잔 어떠세요?' },
        lunch: { tags: ['#눈오는날', '#포근한카페', '#핫초코'], hint: '눈 오는 점심이에요 ❄️ 포근한 카페에서 따뜻한 식사 어때요?' },
        afternoon: { tags: ['#겨울감성', '#창밖풍경', '#따뜻한라떼'], hint: '눈 내리는 오후예요 ❄️ 창밖 눈을 보며 라떼 한 잔 어때요?' },
        evening: { tags: ['#겨울밤', '#아늑한카페', '#따뜻한위로'], hint: '눈 오는 저녁이에요 ❄️ 따뜻한 카페에서 몸과 마음을 녹여보세요~' },
        night: { tags: ['#설경', '#감성충전', '#따뜻한마무리'], hint: '눈 오는 밤이에요 ❄️ 하얀 세상을 바라보며 감성 충전하세요~' },
    },
    mist: {
        morning: { tags: ['#안개낀아침', '#몽환적인', '#조용한시간'], hint: '안개 낀 아침이에요 🌫️ 몽환적인 분위기의 카페는 어때요?' },
        lunch: { tags: ['#차분한낮', '#감성적인', '#사색하기좋은'], hint: '안개 낀 날이에요 🌫️ 감성적인 카페에서 사색에 잠겨볼까요?' },
        afternoon: { tags: ['#몽환적인오후', '#감성충전', '#조용한카페'], hint: '안개 낀 오후예요 🌫️ 조용한 카페에서 여유를 즐겨보세요~' },
        evening: { tags: ['#안개낀저녁', '#아늑한', '#따뜻한음료'], hint: '안개 낀 저녁이에요 🌫️ 아늑한 카페에서 따뜻한 음료 한 잔 어때요?' },
        night: { tags: ['#안개낀밤', '#차분한시간', '#감성적인'], hint: '안개 낀 밤이에요 🌫️ 조용한 카페에서 감성 충전하세요~' },
    },
};

// 모크 날씨 데이터 (시간대별 자동 변경)
function getMockWeather(): { condition: string; temperature: number } {
    const hour = new Date().getHours();
    const conditions = ['clear', 'clouds', 'rain'];
    const condIdx = Math.floor(hour / 8) % conditions.length;
    const temps: Record<string, number> = { clear: 18, clouds: 14, rain: 12 };
    return { condition: conditions[condIdx], temperature: temps[conditions[condIdx]] };
}

export function getWeatherContext(lat?: number, lng?: number): WeatherResponse {
    const mock = getMockWeather();
    const hour = new Date().getHours();
    const period = getTimePeriod(hour);
    const condition = mock.condition;

    const emotionData = weatherEmotionMap[condition]?.[period] || weatherEmotionMap.clouds![period]!;

    const descMap: Record<string, string> = {
        clear: '맑음', clouds: '흐림', rain: '비', snow: '눈', mist: '안개',
    };

    return {
        weather: {
            condition,
            description: descMap[condition] || '흐림',
            temperature_c: mock.temperature,
            feels_like_c: mock.temperature - 2,
            humidity: 65,
            icon: condition === 'clear' ? '☀️' : condition === 'rain' ? '🌧️' : condition === 'snow' ? '❄️' : '🌥️',
        },
        time_context: {
            hour,
            period,
            is_weekend: isWeekend(),
        },
        emotion_context_tags: emotionData.tags,
        counseling_hint: emotionData.hint,
    };
}

// 날씨 기반 추천 가중치 적용
export function applyWeatherBoost(recommendations: any[], weatherCtx: WeatherResponse): any[] {
    const tags = weatherCtx.emotion_context_tags;
    return recommendations.map(rec => {
        let boost = 0;
        // 비 올 때 아늑한/통창 카페 가중치
        if (tags.some(t => t.includes('비') || t.includes('아늑'))) {
            if (rec.atmosphere_tags?.some((t: string) => ['아늑한', '통창있는', '감성적인'].includes(t))) {
                boost += 5;
            }
        }
        // 맑은 날 밝은/테라스 카페 가중치
        if (tags.some(t => t.includes('활기') || t.includes('테라스'))) {
            if (rec.atmosphere_tags?.some((t: string) => ['밝고활기찬', '트렌디한'].includes(t))) {
                boost += 5;
            }
        }
        return { ...rec, match_score: rec.match_score + boost, weather_boost: boost };
    });
}
