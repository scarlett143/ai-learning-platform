/**
 * Learner Profile & Competency Models
 * Matching PRD Section 7.1 and PROJECT.md § Interface Contracts
 */

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | (string & {});

export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'ai_ml'
  | 'cloud'
  | 'security'
  | 'mobile'
  | 'fundamentals';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory | string;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number;
  verified?: boolean;
}

export type LearnerSkill = Skill;

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export type LearnerCertification = Certification;

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  url?: string;
}

export type ProjectPortfolio = Project;
export type LearnerProject = Project;

export interface LearnerProfile {
  id: string;
  name: string;
  email?: string;
  targetRole?: string; // PRD Section 7.1: 'full-stack' | 'ai-ml-engineer' | 'cloud-devops'
  targetRoleId: string; // UI & Header compatibility
  weeklyCommitmentHours?: number;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
