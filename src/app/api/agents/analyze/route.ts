import { NextRequest, NextResponse } from 'next/server';
import { SkillAnalyzerAgent } from '@/services/agents/skill-analyzer';
import { LearnerProfile } from '@/types';
import { rateLimited, tooLarge } from '@/lib/rate-limit';

const MAX_SKILLS = 200;

export async function POST(req: NextRequest) {
  if (rateLimited(req, 'analyze')) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  if (tooLarge(req)) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  try {
    const profile = (await req.json().catch(() => null)) as LearnerProfile | null;
    if (!profile || !Array.isArray(profile.skills) || profile.skills.length > MAX_SKILLS) {
      return NextResponse.json({ error: 'Invalid profile payload' }, { status: 400 });
    }

    return NextResponse.json(SkillAnalyzerAgent.analyze(profile));
  } catch (err: unknown) {
    console.error('[api/agents/analyze]', err);
    return NextResponse.json({ error: 'Skill analysis failed' }, { status: 500 });
  }
}
