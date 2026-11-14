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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Skill analysis failed' }, { status: 500 });
  }
}
