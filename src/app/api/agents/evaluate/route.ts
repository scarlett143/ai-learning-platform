import { NextRequest, NextResponse } from 'next/server';
import { AssessmentEvaluatorAgent } from '@/services/agents/assessment-evaluator';
import { QuizQuestion } from '@/types';
import { rateLimited, tooLarge } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (rateLimited(req, 'evaluate')) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (tooLarge(req)) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { action, moduleId, moduleTitle, userId, questions, selectedAnswers } = body;

    if (typeof moduleId !== 'string' || !moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    if (action === 'generate') {
      const quiz = AssessmentEvaluatorAgent.generateQuiz(moduleId, moduleTitle || 'Module Assessment');
      return NextResponse.json({ questions: quiz });
    }

    if (action === 'evaluate') {
      if (
        !Array.isArray(questions) || !Array.isArray(selectedAnswers) ||
        questions.length === 0 || questions.length > 50 ||
        selectedAnswers.length !== questions.length ||
        !selectedAnswers.every((a: unknown) => Number.isInteger(a))
      ) {
        return NextResponse.json({ error: 'questions and selectedAnswers must be equal-length arrays' }, { status: 400 });
      }
      const result = AssessmentEvaluatorAgent.evaluateQuiz(
        userId || 'guest-learner',
        moduleId,
        moduleTitle,
        questions as QuizQuestion[],
        selectedAnswers as number[]
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown assessment action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[api/agents/evaluate]', err);
    return NextResponse.json({ error: 'Assessment evaluation failed' }, { status: 500 });
  }
}
