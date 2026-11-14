import { NextRequest, NextResponse } from 'next/server';
import { SkillAnalyzerAgent } from '@/services/agents/skill-analyzer';
import { LearnerProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const profile = (await req.json()) as LearnerProfile;
    if (!profile || !profile.skills) {
      return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 });
    }

    const report = SkillAnalyzerAgent.analyze(profile);
    return NextResponse.json(report);
  } catch (err: unknown) {
    console.error('[api/agents/analyze]', err);
    return NextResponse.json({ error: 'Skill analysis failed' }, { status: 500 });
  }
}
