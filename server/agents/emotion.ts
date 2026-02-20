// ===== 감성 상담 에이전트 =====
// 사용자와 5~10회 문답을 통해 감성 프로파일을 생성합니다.

interface QuestionStep {
    step: number;
    question: string;
    options?: string[];
    analyzeKey: string;
}

const questionFlow: QuestionStep[] = [
    {
        step: 1,
        question: '안녕하세요 😊 오늘 하루 어떠셨어요?\n바쁘셨나요, 아니면 좀 여유로우셨나요?',
        options: ['엄청 바빴어요 😵', '적당히 바빴어요', '여유로웠어요 ☺️', '그냥 무기력해요...'],
        analyzeKey: 'energy_level',
    },
    {
        step: 2,
        question: '지금 기분을 색깔로 표현한다면 어떤 색이에요?\n(예: 파란색, 회색, 노란색, 빨간색...)',
        options: ['🔵 파란색 (차분, 사색적)', '⚪ 회색 (피로, 무기력)', '🟡 노란색 (설렘, 활기)', '🔴 빨간색 (열정, 스트레스)', '🟢 초록색 (안정, 평온)', '🟣 보라색 (감성, 몽환)'],
        analyzeKey: 'mood_color',
    },
    {
        step: 3,
        question: '오늘 카페, 혼자 가실 건가요?\n아니면 누군가와 함께인가요?',
        options: ['혼자요 🧑', '연인과 💑', '친구와 👫', '가족과 👨‍👩‍👧'],
        analyzeKey: 'companion',
    },
    {
        step: 4,
        question: '카페에서 주로 뭘 하실 것 같아요?',
        options: ['그냥 쉬기 😌', '공부/작업 💻', '대화 💬', '혼자 생각 정리 🤔'],
        analyzeKey: 'purpose',
    },
    {
        step: 5,
        question: '오늘은 어떤 맛이 당기세요?\n달달한 것? 쌉싸름한 것?',
        options: ['달달 + 따뜻 🍫', '달달 + 시원 🍓', '쌉싸름 + 따뜻 ☕', '쌉싸름 + 시원 🧊', '상관없어요~'],
        analyzeKey: 'drink_preference',
    },
];

const conditionalQuestions: QuestionStep[] = [
    {
        step: 6,
        question: '조용하고 아늑한 곳이 좋으세요,\n아니면 약간 활기찬 분위기도 괜찮으세요?',
        options: ['조용하고 아늑한 곳 🤫', '약간 활기찬 곳 🎵', '상관없어요'],
        analyzeKey: 'atmosphere',
    },
    {
        step: 7,
        question: '오늘 예산은 어느 정도로 생각하세요?',
        options: ['1만원 이내 💰', '1~2만원 💵', '상관없음'],
        analyzeKey: 'budget',
    },
    {
        step: 8,
        question: '주차가 필요하신가요?',
        options: ['네, 주차 필요해요 🚗', '아니요, 걸어갈게요 🚶'],
        analyzeKey: 'need_parking',
    },
];

const summaryTemplates = [
    { condition: (p: any) => p.energy_level === 'low' && p.mood_color === 'blue', text: '오늘은 혼자만의 시간이 필요한 날이네요.\n조용하고 따뜻한 공간에서 핫초코 한 잔 어떠세요? ☕' },
    { condition: (p: any) => p.energy_level === 'low' && p.mood_color === 'gray', text: '좀 지치셨나봐요. 괜찮아요.\n아늑한 카페에서 잠깐 숨 돌려보는 건 어떨까요? 🌿' },
    { condition: (p: any) => p.energy_level === 'high' && p.mood_color === 'yellow', text: '활기찬 에너지가 느껴지네요! ✨\n트렌디하고 힙한 분위기의 카페를 찾아드릴게요!' },
    { condition: (p: any) => p.energy_level === 'high' && p.mood_color === 'red', text: '열정이 넘치시는 날이네요! 🔥\n넓은 공간에서 에너지를 발산해보세요!' },
    { condition: (p: any) => p.mood_color === 'green', text: '평온한 하루를 보내고 계시네요 🌿\n자연광이 들어오는 잔잔한 카페를 찾아드릴게요.' },
    { condition: (p: any) => p.mood_color === 'purple', text: '감성적인 하루네요 💜\n분위기 좋은 카페에서 몽환적인 시간을 보내보세요.' },
    { condition: (p: any) => p.companion === 'couple', text: '사랑하는 사람과 함께하는 시간이네요 💕\n분위기 있는 카페를 찾아드릴게요!' },
    { condition: (p: any) => p.purpose === 'work', text: '생산적인 하루를 보내실 건가요! 💪\n와이파이 빵빵하고 넓은 카페를 찾아드릴게요.' },
];

const colorMap: Record<string, string> = {
    '파란': 'blue', '파랑': 'blue', '블루': 'blue', '파란색': 'blue',
    '회색': 'gray', '그레이': 'gray', '잿빛': 'gray',
    '노란': 'yellow', '노랑': 'yellow', '옐로': 'yellow', '노란색': 'yellow',
    '빨간': 'red', '빨강': 'red', '레드': 'red', '빨간색': 'red',
    '초록': 'green', '그린': 'green', '녹색': 'green', '초록색': 'green',
    '보라': 'purple', '퍼플': 'purple', '보라색': 'purple',
};

function analyzeResponse(key: string, response: string): Record<string, any> {
    const r = response.toLowerCase();

    switch (key) {
        case 'energy_level':
            if (r.includes('바빴') || r.includes('엄청')) return { energy_level: 'low' };
            if (r.includes('적당') || r.includes('보통')) return { energy_level: 'mid' };
            if (r.includes('여유') || r.includes('좋았')) return { energy_level: 'high' };
            if (r.includes('무기력') || r.includes('힘들')) return { energy_level: 'low' };
            return { energy_level: 'mid' };

        case 'mood_color':
            for (const [keyword, color] of Object.entries(colorMap)) {
                if (r.includes(keyword)) return { mood_color: color };
            }
            if (r.includes('🔵')) return { mood_color: 'blue' };
            if (r.includes('⚪')) return { mood_color: 'gray' };
            if (r.includes('🟡')) return { mood_color: 'yellow' };
            if (r.includes('🔴')) return { mood_color: 'red' };
            if (r.includes('🟢')) return { mood_color: 'green' };
            if (r.includes('🟣')) return { mood_color: 'purple' };
            return { mood_color: 'blue' };

        case 'companion':
            if (r.includes('혼자') || r.includes('🧑')) return { companion: 'solo' };
            if (r.includes('연인') || r.includes('💑')) return { companion: 'couple' };
            if (r.includes('친구') || r.includes('👫')) return { companion: 'friends' };
            if (r.includes('가족') || r.includes('👨')) return { companion: 'family' };
            return { companion: 'solo' };

        case 'purpose':
            if (r.includes('쉬') || r.includes('😌')) return { purpose: 'rest' };
            if (r.includes('공부') || r.includes('작업') || r.includes('💻')) return { purpose: 'work' };
            if (r.includes('대화') || r.includes('💬')) return { purpose: 'talk' };
            if (r.includes('생각') || r.includes('🤔')) return { purpose: 'thinking' };
            return { purpose: 'rest' };

        case 'drink_preference':
            if (r.includes('달달') && r.includes('따뜻')) return { drink_preference: { temperature: 'hot', taste: 'sweet' } };
            if (r.includes('달달') && r.includes('시원')) return { drink_preference: { temperature: 'cold', taste: 'sweet' } };
            if (r.includes('쌉싸름') && r.includes('따뜻')) return { drink_preference: { temperature: 'hot', taste: 'bitter' } };
            if (r.includes('쌉싸름') && r.includes('시원')) return { drink_preference: { temperature: 'cold', taste: 'bitter' } };
            if (r.includes('🍫')) return { drink_preference: { temperature: 'hot', taste: 'sweet' } };
            if (r.includes('🍓')) return { drink_preference: { temperature: 'cold', taste: 'sweet' } };
            if (r.includes('☕')) return { drink_preference: { temperature: 'hot', taste: 'bitter' } };
            if (r.includes('🧊')) return { drink_preference: { temperature: 'cold', taste: 'bitter' } };
            return { drink_preference: { temperature: 'any', taste: 'any' } };

        case 'atmosphere':
            if (r.includes('조용') || r.includes('아늑') || r.includes('🤫')) return { atmosphere: 'quiet' };
            if (r.includes('활기') || r.includes('🎵')) return { atmosphere: 'lively' };
            return { atmosphere: 'any' };

        case 'budget':
            if (r.includes('1만원 이내') || r.includes('💰')) return { budget: 'under10k' };
            if (r.includes('1~2만원') || r.includes('💵')) return { budget: '10k-20k' };
            return { budget: 'any' };

        case 'need_parking':
            if (r.includes('주차') && (r.includes('네') || r.includes('필요') || r.includes('🚗'))) return { need_parking: true };
            return { need_parking: false };

        default:
            return {};
    }
}

function generateMoodTags(profile: any): string[] {
    const tags: string[] = [];

    if (profile.energy_level === 'low') tags.push('위로가필요해요');
    if (profile.energy_level === 'high') tags.push('에너지충전');
    if (profile.mood_color === 'blue') tags.push('차분한시간');
    if (profile.mood_color === 'yellow') tags.push('설레는날');
    if (profile.mood_color === 'gray') tags.push('쉬고싶어요');
    if (profile.mood_color === 'green') tags.push('평온한하루');
    if (profile.mood_color === 'purple') tags.push('감성충전');
    if (profile.mood_color === 'red') tags.push('열정가득');
    if (profile.purpose === 'work') tags.push('집중하고싶어요');
    if (profile.purpose === 'rest') tags.push('힐링타임');
    if (profile.purpose === 'talk') tags.push('수다타임');
    if (profile.purpose === 'thinking') tags.push('혼자만의시간');
    if (profile.companion === 'couple') tags.push('데이트');
    if (profile.companion === 'solo') tags.push('혼카');

    return tags.slice(0, 4);
}

function generateSummary(profile: any): string {
    for (const tmpl of summaryTemplates) {
        if (tmpl.condition(profile)) return tmpl.text;
    }
    return '오늘의 기분에 딱 맞는 카페를 찾아드릴게요 ☕✨';
}

export function getNextQuestion(session: any): { question: string; options?: string[]; is_complete: boolean } {
    const step = session.step;

    if (step < questionFlow.length) {
        const q = questionFlow[step];
        return { question: q.question, options: q.options, is_complete: false };
    }

    // 조건부 질문 (에너지 LOW일 때 분위기, 기본적으로 예산/주차)
    const condIdx = step - questionFlow.length;
    if (condIdx < conditionalQuestions.length) {
        const q = conditionalQuestions[condIdx];
        return { question: q.question, options: q.options, is_complete: false };
    }

    return { question: '', is_complete: true };
}

export function processResponse(session: any, response: string): {
    profile_update: Record<string, any>;
    is_complete: boolean;
    summary?: string;
    mood_tags?: string[];
} {
    const step = session.step;
    let analyzeKey = '';

    if (step < questionFlow.length) {
        analyzeKey = questionFlow[step].analyzeKey;
    } else {
        const condIdx = step - questionFlow.length;
        if (condIdx < conditionalQuestions.length) {
            analyzeKey = conditionalQuestions[condIdx].analyzeKey;
        }
    }

    const profileUpdate = analyzeKey ? analyzeResponse(analyzeKey, response) : {};
    const updatedProfile = { ...session.emotion_profile, ...profileUpdate };
    const newStep = step + 1;
    const totalSteps = questionFlow.length + conditionalQuestions.length;
    const isComplete = newStep >= totalSteps;

    if (isComplete) {
        const moodTags = generateMoodTags(updatedProfile);
        const summary = generateSummary(updatedProfile);
        return {
            profile_update: {
                ...profileUpdate,
                mood_tag: moodTags,
                max_walk_minutes: 5,
            },
            is_complete: true,
            summary,
            mood_tags: moodTags,
        };
    }

    return { profile_update: profileUpdate, is_complete: false };
}

// AI 라우팅 응답 (중간 공감 메시지)
export function getEmpathyResponse(profile: any, step: number): string | null {
    if (step === 2 && profile.energy_level === 'low') {
        return '오늘 하루 고생 많으셨어요 🫂 따뜻한 카페에서 잠깐 쉬어가는 건 어때요?';
    }
    if (step === 3 && profile.mood_color === 'gray') {
        return '무기력한 날도 있는 거예요. 괜찮아요 🤗\n분위기 좋은 카페가 기분을 바꿔줄 수 있을 거예요!';
    }
    if (step === 5 && profile.purpose === 'work') {
        return '집중 모드시군요! 💪 와이파이 빵빵하고 콘센트 있는 곳 찾아드릴게요!';
    }
    return null;
}
