import { NextRequest, NextResponse } from 'next/server';
import { CurriculumPlannerAgent } from '@/services/agents/curriculum-planner';
import { GapAnalysisReport } from '@/types';
import { rateLimited, tooLarge } from '@/lib/rate-limit';

const MAX_GAPS = 200;

export async function POST(req: NextRequest) {
  if (rateLimited(req, 'plan')) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (tooLarge(req)) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  try {
    const report = (await req.json().catch(() => null)) as GapAnalysisReport | null;
    if (!report || !Array.isArray(report.missingSkills) || report.missingSkills.length > MAX_GAPS) {
      return NextResponse.json({ error: 'Invalid gap analysis report' }, { status: 400 });
    }

    return NextResponse.json(CurriculumPlannerAgent.planRoadmap(report));
  } catch (err: unknown) {
    console.error('[api/agents/plan]', err);
    return NextResponse.json({ error: 'Roadmap planning failed' }, { status: 500 });
  }
}
