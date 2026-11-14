/**
 * Role Benchmarks & Gap Analysis Engine Contracts
 * Matching PRD Section 7.2 and PROJECT.md § Interface Contracts
 */

import { ProficiencyLevel, SkillCategory } from './profile';

export type ImportanceTier = 1 | 2 | 3 | 'nice_to_have' | 'important' | 'critical';

export interface BenchmarkSkill {
  id?: string;
  name: string;
  category: SkillCategory | string;
  requiredProficiency?: ProficiencyLevel;
  minProficiency: ProficiencyLevel; // Required for backwards compatibility with existing analyzers
  importanceTier?: ImportanceTier;
  description?: string;
  weight: number; // Required for backwards compatibility with existing analyzers
}

export type RequiredSkill = BenchmarkSkill;
export type BenchmarkCompetency = BenchmarkSkill;

export interface RoleBenchmark {
  id: string;
  title: string;
  roleName?: string; // Backwards compatibility
  category?: string;
  description: string;
  marketDemand?: 'high' | 'very_high' | 'critical';
  averageSalaryBand?: string;
  requiredSkills: BenchmarkSkill[];
}

export interface AnalyzedSkill {
  skillId?: string;
  skillName?: string;
  name: string; // Compatible with both name and skillName
  category: SkillCategory | string;
  currentProficiency?: ProficiencyLevel | null;
  requiredProficiency?: ProficiencyLevel;
  deficit?: number;
  importanceTier?: ImportanceTier;
  gapType?: 'missing' | 'depth'; // Backwards compatibility
  weight?: number; // Backwards compatibility
  proficiency?: ProficiencyLevel; // Backwards compatibility for strength items
}

export type SkillGapItem = AnalyzedSkill;
export type SkillGap = AnalyzedSkill;

export interface GapAnalysisReport {
  roleId?: string;
  roleTitle?: string;
  userId: string;
  targetRoleId?: string; // Backwards compatibility
  targetRoleName?: string; // Backwards compatibility
  readinessScore: number; // 0 - 100
  strengths: AnalyzedSkill[];
  weaknesses: AnalyzedSkill[];
  missingGaps: AnalyzedSkill[];
  missingSkills: AnalyzedSkill[]; // Backwards compatibility
  recommendations: string[];
  generatedAt?: string;
  analyzedAt?: string; // Backwards compatibility
}
