// ===== Gemini AI 서비스 =====
// Google Gemini API를 활용한 AI 감성 상담 엔진

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI 연결됨');
} else {
    console.warn('⚠️  GEMINI_API_KEY가 설정되지 않았습니다. 기본 응답을 사용합니다.');
}

// 감성 상담 시스템 프롬프트
const COUNSELOR_SYSTEM = `너는 "MoodBrew"라는 감성 카페 추천 서비스의 AI 상담사야.
역할: 사용자의 오늘 기분과 감정을 자연스럽게 파악한 뒤, 그에 맞는 카페 분위기를 추천하기 위한 정보를 수집해.

성격:
- 따뜻하고 공감 능력이 뛰어나며, 친구처럼 편안한 어조
- 약간의 이모지를 사용 (너무 많이 쓰지는 않기)
- 한국어로 소통, 존댓말 사용
- 짧고 핵심적인 공감 메시지, 2~3줄 이내

중요 규칙:
- 항상 짧게 (50자 이내) 공감 메시지를 먼저 말하고
- 100자를 절대 넘지 않기
- JSON 형식의 응답은 절대 하지 않기
- 자연스러운 대화체로만 답변하기`;

// 공감 메시지 생성 (Gemini)
export async function generateEmpathyResponse(
    profile: Record<string, any>,
    step: number,
    userMessage: string,
): Promise<string | null> {
    if (!model) return null; // API 키 없으면 룰 기반 폴백

    try {
        const profileSummary = Object.entries(profile)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(', ');

        const prompt = `${COUNSELOR_SYSTEM}

현재 상담 ${step}단계 / 총 8단계.
지금까지 파악한 감성 프로파일: ${profileSummary || '아직 없음'}
방금 사용자가 한 말: "${userMessage}"

위 내용을 토대로, 따뜻한 공감 한마디를 해줘. (50자 이내, 이모지 1~2개 포함)
다음 질문은 묻지 말고 공감만 해.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text || null;
    } catch (err) {
        console.error('Gemini empathy error:', err);
        return null;
    }
}

// 상담 완료 요약 생성 (Gemini)
export async function generateCounselingSummary(
    profile: Record<string, any>,
): Promise<string | null> {
    if (!model) return null;

    try {
        const prompt = `${COUNSELOR_SYSTEM}

사용자의 감성 프로파일 분석이 완료됐어. 아래 프로파일을 기반으로 따뜻한 상담 마무리 멘트를 만들어줘.

프로파일:
- 에너지: ${profile.energy_level || '보통'}
- 기분 색깔: ${profile.mood_color || '파랑'}
- 동행: ${profile.companion || '혼자'}
- 목적: ${profile.purpose || '쉬기'}
- 음료 선호: ${JSON.stringify(profile.drink_preference || {})}
- 분위기: ${profile.atmosphere || '상관없음'}
- 무드태그: ${(profile.mood_tag || []).map((t: string) => '#' + t).join(' ')}

규칙:
- 사용자의 기분을 따뜻하게 요약 (2~3줄)
- "지금부터 딱 맞는 카페를 찾아드릴게요!" 같은 멘트로 마무리
- 최대 100자`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim() || null;
    } catch (err) {
        console.error('Gemini summary error:', err);
        return null;
    }
}

// 추천 카드 매칭 이유 생성 (Gemini)
export async function generateMatchReason(
    profile: Record<string, any>,
    cafeName: string,
    cafeAtmosphere: string[],
    score: number,
): Promise<string | null> {
    if (!model) return null;

    try {
        const moodTags = (profile.mood_tag || []).map((t: string) => '#' + t).join(' ');
        const prompt = `너는 카페 추천 AI야. 사용자 기분(${moodTags})에 "${cafeName}" 카페(분위기: ${cafeAtmosphere.join(', ')}, 매칭점수: ${score}점)를 추천하는 한 줄 이유를 자연스럽게 써줘.
규칙: 30자 이내, 따뜻한 어조, 이모지 1개`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim() || null;
    } catch (err) {
        console.error('Gemini match reason error:', err);
        return null;
    }
}

export function isGeminiAvailable(): boolean {
    return !!model;
}
