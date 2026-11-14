import { LearnerProfile, RoleBenchmark, GapAnalysisReport, SkillGap, ProficiencyLevel } from '@/types';
import { ROLE_BENCHMARKS } from '@/lib/benchmarks';
import { AgentEventBus } from '@/lib/event-bus';

const PROFICIENCY_RANKS: Record<ProficiencyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export class SkillAnalyzerAgent {
  public static analyze(profile: LearnerProfile, customBenchmark?: RoleBenchmark): GapAnalysisReport {
    const bus = AgentEventBus.getInstance();
    const benchmark = customBenchmark || ROLE_BENCHMARKS[profile.targetRoleId] || ROLE_BENCHMARKS['fullstack-dev'];

    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Skill Analyzer',
      type: 'agent:skill-analyzer:started',
      message: `Analyzing learner profile against benchmark for ${benchmark.roleName}...`,
    });

    const userSkillsMap = new Map<string, { proficiency: ProficiencyLevel; category?: string }>();
    for (const s of profile.skills || []) {
      userSkillsMap.set(s.name.toLowerCase().trim(), { proficiency: s.proficiency, category: s.category });
    }

    const missingSkills: SkillGap[] = [];
    const strengths: Array<{ name: string; proficiency: ProficiencyLevel; category: string }> = [];
    let satisfiedWeight = 0;
    const totalBenchmarkWeight = benchmark.requiredSkills.reduce((sum, r) => sum + r.weight, 0);

    for (const req of benchmark.requiredSkills) {
      const match = userSkillsMap.get(req.name.toLowerCase().trim());
      if (!match) {
        missingSkills.push({
          name: req.name,
          requiredProficiency: req.minProficiency,
          currentProficiency: null,
          gapType: 'missing',
          category: req.category,
          weight: req.weight,
        });
      } else {
        const userRank = PROFICIENCY_RANKS[match.proficiency] || 1;
        const reqRank = PROFICIENCY_RANKS[req.minProficiency] || 1;

        if (userRank >= reqRank) {
          satisfiedWeight += req.weight;
          strengths.push({
            name: req.name,
            proficiency: match.proficiency,
            category: req.category,
          });
        } else {
          // Depth gap
          const partial = req.weight * (userRank / reqRank);
          satisfiedWeight += partial;
          missingSkills.push({
            name: req.name,
            requiredProficiency: req.minProficiency,
            currentProficiency: match.proficiency,
            gapType: 'depth',
            category: req.category,
            weight: req.weight,
          });
        }
      }
    }

    // Add adjacencies / strengths not in benchmark
    for (const s of profile.skills || []) {
      const inReq = benchmark.requiredSkills.some(r => r.name.toLowerCase().trim() === s.name.toLowerCase().trim());
      if (!inReq) {
        strengths.push({
          name: s.name,
          proficiency: s.proficiency,
          category: s.category || 'General',
        });
      }
    }

    const readinessScore = totalBenchmarkWeight > 0
      ? Math.min(100, Math.max(0, Math.round((satisfiedWeight / totalBenchmarkWeight) * 100)))
      : 100;

    const recommendations = missingSkills.map(
      gap => `Prioritize ${gap.name} (${gap.gapType === 'depth' ? 'advance to ' + gap.requiredProficiency : 'learn from fundamentals'})`
    );

    const report: GapAnalysisReport = {
      userId: profile.id,
      targetRoleId: benchmark.id,
      targetRoleName: benchmark.roleName,
      readinessScore,
      missingSkills,
      strengths,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };

    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Skill Analyzer',
      type: 'agent:skill-analyzer:completed',
      message: `Analysis completed: Readiness score is ${readinessScore}%. Identified ${missingSkills.length} target gaps.`,
      payload: report,
    });

    return report;
  }
}
