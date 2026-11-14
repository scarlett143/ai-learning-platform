/**
 * Learning Roadmap & Adaptive Remediation Contracts
 * Matching PRD Section 7.4 and PROJECT.md § Interface Contracts
 */

import { SkillCategory } from './profile';

export type ModuleStatus =
  | 'locked'
  | 'ready'
  | 'in-progress'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'remedial'
  | 'remediated_and_passed';

export interface CodeSnippet {
  language: string;
  code: string;
  filename?: string;
  title?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  contentMarkdown?: string;
  codeSnippets?: CodeSnippet[];
  completed?: boolean;
}

export interface PracticalExercise {
  id: string;
  title?: string;
  prompt: string;
  starterCode?: string;
  solutionCode?: string;
  solutionHint?: string;
  instructionsMarkdown?: string;
}

export type Exercise = PracticalExercise;

export interface RoadmapModule {
  id: string;
  order: number;
  title: string;
  targetSkill?: string;
  description?: string;
  category: SkillCategory | string;
  estimatedHours: number;
  status: ModuleStatus;
  isRemediation?: boolean;
  isRemedial?: boolean; // Backwards compatibility
  remediationTriggeredByModuleId?: string;
  remedialForSkill?: string; // Backwards compatibility
  remedialForModuleId?: string; // Backwards compatibility
  remedialAttemptCount?: number;
  lessons: Lesson[];
  practicalExercise?: PracticalExercise;
  exercises?: PracticalExercise[]; // Backwards compatibility
  codeSnippets?: CodeSnippet[]; // Backwards compatibility
  assessmentId?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  roleId?: string;
  roleTitle?: string;
  targetRoleId?: string; // Backwards compatibility
  targetRoleName?: string; // Backwards compatibility
  totalEstimatedHours?: number;
  totalHours?: number; // Backwards compatibility
  completedHours?: number; // Backwards compatibility
  modules: RoadmapModule[];
  createdAt?: string;
  updatedAt?: string;
  generatedAt?: string; // Backwards compatibility
  readinessScore?: number; // Backwards compatibility
}
