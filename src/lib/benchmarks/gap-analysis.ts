import {
  LearnerProfile,
  RoleBenchmark,
  GapAnalysisReport,
  AnalyzedSkill,
  ProficiencyLevel,
  ImportanceTier,
  Skill,
} from '@/types';
import { getBenchmark } from './index';

export interface ComprehensiveGapAnalysisReport extends GapAnalysisReport {
  roleId: string;
  roleTitle: string;
  weaknesses: AnalyzedSkill[];
  missingGaps: AnalyzedSkill[];
  generatedAt: string;
}

export const PROFICIENCY_WEIGHTS: Record<string, number> = {
  beginner: 0.25,
  intermediate: 0.50,
  advanced: 0.75,
  expert: 1.00,
};

export const IMPORTANCE_MULTIPLIERS: Record<string | number, number> = {
  3: 1.0,
  critical: 1.0,
  2: 0.7,
  important: 0.7,
  1: 0.4,
  nice_to_have: 0.4,
};

export function getProficiencyWeight(level?: ProficiencyLevel | string | null): number {
  if (!level) return 0.0;
  const key = String(level).toLowerCase().trim();
  return PROFICIENCY_WEIGHTS[key] ?? 0.0;
}

export function getImportanceMultiplier(tier?: ImportanceTier | null): number {
  if (tier === undefined || tier === null) return 1.0;
  return IMPORTANCE_MULTIPLIERS[tier] ?? 1.0;
}

/**
 * Normalizes and checks if a user skill matches a benchmark requirement
 */
export function isSkillMatch(userSkillName: string, reqSkillName: string): boolean {
  const u = userSkillName.toLowerCase().trim();
  const r = reqSkillName.toLowerCase().trim();

  if (u === r) return true;
  if (r.includes(u) || u.includes(r)) return true;

  // Domain synonym checks
  const synonyms: Array<[RegExp, RegExp]> = [
    [/^js$|^javascript/i, /^javascript/i],
    [/^html$|^css$|^html\/css$/i, /^html(\/css)?$/i],
    [/^node(\.js)?$|^express$/i, /^node(\.js)?/i],
    [/^sql$|^databases?$/i, /^sql(\/databases?)?$/i],
    [/^python$/i, /^python(\/backend)?$/i],
    [/^git$/i, /^git(\s*&\s*version\s*control)?$/i],
    [/^k8s$|^kubernetes$/i, /^kubernetes$/i],
    [/^pytorch$/i, /^pytorch(\/tensorflow)?$/i],
    [/^aws$/i, /^aws(\/cloud\s*fundamentals)?$/i],
  ];

  for (const [patternA, patternB] of synonyms) {
    if ((patternA.test(u) && patternB.test(r)) || (patternB.test(u) && patternA.test(r))) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates competency gaps between a learner profile and a role benchmark.
 */
export function calculateSkillGaps(
  profile: LearnerProfile,
  roleId: string,
  customBenchmark?: RoleBenchmark
): ComprehensiveGapAnalysisReport {
  const benchmark =
    customBenchmark ||
    getBenchmark(roleId) ||
    getBenchmark(profile.targetRoleId || profile.targetRole) ||
    getBenchmark('full-stack');

  if (!benchmark) {
    throw new Error(`Benchmark not found for role ID: "${roleId}"`);
  }

  const userSkills = profile.skills || [];
  const matchedUserSkills = new Set<Skill>();

  const strengths: AnalyzedSkill[] = [];
  const weaknesses: AnalyzedSkill[] = [];
  const missingGaps: AnalyzedSkill[] = [];

  let weightedSatisfiedSum = 0;
  let weightedRequiredSum = 0;

  for (const req of benchmark.requiredSkills) {
    const requiredWeight = getProficiencyWeight(req.requiredProficiency || req.minProficiency);
    const importance = getImportanceMultiplier(req.importanceTier);
    const effectiveReqWeight = requiredWeight * importance;
    weightedRequiredSum += effectiveReqWeight;

    // Find best match in user skills
    const match = userSkills.find(s => isSkillMatch(s.name, req.name));

    if (match) {
      matchedUserSkills.add(match);
      const userWeight = getProficiencyWeight(match.proficiency);
      const satisfied = Math.min(userWeight, requiredWeight);
      weightedSatisfiedSum += satisfied * importance;

      const deficit = Math.max(0, Number((requiredWeight - userWeight).toFixed(2)));

      const analyzedItem: AnalyzedSkill = {
        skillId: req.id || `skill-${req.name.toLowerCase().replace(/\s+/g, '-')}`,
        skillName: req.name,
        name: req.name,
        category: req.category,
        currentProficiency: match.proficiency,
        requiredProficiency: req.requiredProficiency || req.minProficiency || 'intermediate',
        deficit,
        importanceTier: req.importanceTier || 2,
        gapType: deficit > 0 ? 'depth' : undefined,
        weight: req.weight,
        proficiency: match.proficiency,
      };

      if (userWeight >= requiredWeight) {
        strengths.push(analyzedItem);
      } else {
        weaknesses.push(analyzedItem);
      }
    } else {
      // User has zero proficiency for this required benchmark skill
      const deficit = Number(requiredWeight.toFixed(2));
      const missingItem: AnalyzedSkill = {
        skillId: req.id || `skill-${req.name.toLowerCase().replace(/\s+/g, '-')}`,
        skillName: req.name,
        name: req.name,
        category: req.category,
        currentProficiency: null,
        requiredProficiency: req.requiredProficiency || req.minProficiency || 'intermediate',
        deficit,
        importanceTier: req.importanceTier || 2,
        gapType: 'missing',
        weight: req.weight,
      };
      missingGaps.push(missingItem);
    }
  }

  // Add supplementary user skills that were not required in the benchmark as bonus strengths
  for (const userSkill of userSkills) {
    if (!matchedUserSkills.has(userSkill)) {
      strengths.push({
        skillId: userSkill.id,
        skillName: userSkill.name,
        name: userSkill.name,
        category: userSkill.category || 'fundamentals',
        currentProficiency: userSkill.proficiency,
        requiredProficiency: userSkill.proficiency,
        deficit: 0,
        importanceTier: 1,
        proficiency: userSkill.proficiency,
      });
    }
  }

  // Calculate readiness score
  const readinessScore =
    weightedRequiredSum > 0
      ? Math.min(100, Math.max(0, Math.round((weightedSatisfiedSum / weightedRequiredSum) * 100)))
      : 100;

  // Generate actionable recommendations
  const recommendations: string[] = [];
  for (const gap of missingGaps) {
    recommendations.push(
      `Acquire ${gap.name} (${gap.requiredProficiency}): Critical missing competency for ${benchmark.title}.`
    );
  }
  for (const weak of weaknesses) {
    recommendations.push(
      `Deepen ${weak.name}: Current proficiency (${weak.currentProficiency}) is below target (${weak.requiredProficiency}).`
    );
  }

  const now = new Date().toISOString();

  return {
    roleId: benchmark.id,
    roleTitle: benchmark.title,
    userId: profile.id,
    targetRoleId: benchmark.id,
    targetRoleName: benchmark.title,
    readinessScore,
    strengths,
    weaknesses,
    missingGaps,
    missingSkills: [...missingGaps, ...weaknesses],
    recommendations,
    generatedAt: now,
    analyzedAt: now,
  };
}
