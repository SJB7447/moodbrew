import { Router } from 'express';
import * as store from '../store.js';
import { getNextQuestion, processResponse, getEmpathyResponse } from '../agents/emotion.js';
import { generateEmpathyResponse, generateCounselingSummary, isGeminiAvailable } from '../services/gemini.js';

const router = Router();

// 상담 세션 조회 (로그 남기기)
router.get('/session/:id', (req, res) => {
    const session = store.getSession(req.params.id);
    if (!session) {
        return res.status(404).json({ error: true, message: '세션을 찾을 수 없어요' });
    }
    res.json(session);
});

// 유저별 과거 상담 내역 리스트 조회
router.get('/history/:userId', (req, res) => {
    const sessions = store.getSessionsByUser(req.params.userId);
    // 상태 파악을 위해 목록 형태만 반환할 수도 있지만, 우선 세션 배열 째로 전달
    res.json(sessions);
});

// 상담 세션 시작
router.post('/start', (req, res) => {
    const { user_id } = req.body;
    const session = store.createSession(user_id || 'anonymous');
    const firstQ = getNextQuestion(session);

    const botMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: firstQ.question,
        timestamp: Date.now(),
        options: firstQ.options,
    };

    session.messages = [botMessage];
    session.step = 0;
    store.updateSession(session.session_id, session);

    store.trackEvent({ type: 'chat_start', user_id, session_id: session.session_id });

    res.json({
        session_id: session.session_id,
        message: botMessage,
        ai_powered: isGeminiAvailable(),
    });
});

// 메시지 교환
router.post('/message', async (req, res) => {
    const { session_id, message } = req.body;
    const session = store.getSession(session_id);

    if (!session) {
        return res.status(404).json({ error: true, message: '세션을 찾을 수 없어요' });
    }

    if (session.is_complete) {
        return res.json({
            is_complete: true,
            message: { id: `msg_${Date.now()}`, role: 'assistant', content: '상담이 이미 완료되었어요! 추천 결과를 확인해주세요 😊', timestamp: Date.now() },
            emotion_profile: session.emotion_profile,
        });
    }

    // 사용자 메시지 저장
    const userMsg = {
        id: `msg_${Date.now()}_u`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
    };
    session.messages.push(userMsg);

    // 응답 분석
    const result = processResponse(session, message);
    session.emotion_profile = { ...session.emotion_profile, ...result.profile_update };
    session.step += 1;

    const responses: any[] = [];

    // ★ Gemini AI 공감 메시지 (우선) / 룰 기반 폴백
    let empathy: string | null = null;
    if (isGeminiAvailable()) {
        empathy = await generateEmpathyResponse(session.emotion_profile, session.step, message);
    }
    if (!empathy) {
        empathy = getEmpathyResponse(session.emotion_profile, session.step);
    }

    if (empathy) {
        responses.push({
            id: `msg_${Date.now()}_e`,
            role: 'assistant',
            content: empathy,
            timestamp: Date.now(),
        });
    }

    if (result.is_complete) {
        // ★ Gemini AI 상담 요약 (우선) / 룰 기반 폴백
        let summary: string | null = null;
        if (isGeminiAvailable()) {
            summary = await generateCounselingSummary(session.emotion_profile);
        }
        if (!summary) {
            summary = result.summary || '오늘의 기분에 맞는 카페를 찾아드릴게요 ☕';
        }

        session.is_complete = true;
        responses.push({
            id: `msg_${Date.now()}_c`,
            role: 'assistant',
            content: `${summary}\n\n지금부터 주변 카페를 찾아볼게요! 잠시만 기다려주세요... 🔍`,
            timestamp: Date.now(),
        });
        session.messages.push(...responses);
        store.updateSession(session_id, session);

        store.trackEvent({ type: 'chat_complete', user_id: session.user_id, session_id, emotion_profile: session.emotion_profile });

        return res.json({
            is_complete: true,
            messages: responses,
            emotion_profile: session.emotion_profile,
            counseling_summary: summary,
        });
    }

    // 다음 질문
    const nextQ = getNextQuestion(session);
    responses.push({
        id: `msg_${Date.now()}_q`,
        role: 'assistant',
        content: nextQ.question,
        timestamp: Date.now(),
        options: nextQ.options,
    });

    session.messages.push(...responses);
    store.updateSession(session_id, session);

    res.json({
        is_complete: false,
        messages: responses,
        step: session.step,
        total_steps: 8,
    });
});

export default router;
