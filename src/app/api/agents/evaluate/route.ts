import { NextRequest, NextResponse } from 'next/server';
import { AssessmentEvaluatorAgent } from '@/services/agents/assessment-evaluator';
import { QuizQuestion } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, moduleId, moduleTitle, userId, questions, selectedAnswers } = body;

    if (action === 'generate') {
      const quiz = AssessmentEvaluatorAgent.generateQuiz(moduleId, moduleTitle || 'Module Assessment');
      return NextResponse.json({ questions: quiz });
    }

    if (action === 'evaluate') {
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Assessment evaluation failed' }, { status: 500 });
  }
}
