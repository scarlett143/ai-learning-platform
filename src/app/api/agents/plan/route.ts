import { NextRequest, NextResponse } from 'next/server';
import { CurriculumPlannerAgent } from '@/services/agents/curriculum-planner';
import { GapAnalysisReport } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const report = (await req.json()) as GapAnalysisReport;
    if (!report || !report.missingSkills) {
      return NextResponse.json({ error: 'Invalid gap analysis report' }, { status: 400 });
    }

    const roadmap = CurriculumPlannerAgent.planRoadmap(report);
    return NextResponse.json(roadmap);
  } catch (err: unknown) {
    console.error('[api/agents/plan]', err);
    return NextResponse.json({ error: 'Roadmap planning failed' }, { status: 500 });
  }
}
