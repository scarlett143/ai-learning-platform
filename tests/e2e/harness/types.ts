/**
 * Opaque-Box E2E Testing Harness Domain & Contract Types
 * Directly derived from PRD.md, PROJECT.md, and TEST_INFRA.md specifications.
 */

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearnerSkill {
  id: string;
  name: string;
  proficiency: ProficiencyLevel;
  category?: string;
  verified?: boolean;
}

export interface LearnerCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
}

export interface LearnerProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  url?: string;
}

export interface LearnerProfile {
  id: string;
  name: string;
  targetRoleId: string;
  skills: LearnerSkill[];
  certifications: LearnerCertification[];
  projects: LearnerProject[];
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkCompetency {
  name: string;
  minProficiency: ProficiencyLevel;
  weight: number;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Machine Learning' | 'General';
}

export interface RoleBenchmark {
  id: string;
  roleName: string;
  description: string;
  requiredSkills: BenchmarkCompetency[];
}

export interface SkillGap {
  name: string;
  currentProficiency?: ProficiencyLevel | null;
  requiredProficiency: ProficiencyLevel;
  gapType: 'missing' | 'depth';
  category: string;
  weight: number;
}

export interface GapAnalysisReport {
  roleId?: string;
  roleTitle?: string;
  userId: string;
  targetRoleId: string;
  targetRoleName: string;
  readinessScore: number; // 0 - 100
  missingSkills: SkillGap[];
  weaknesses: SkillGap[];
  missingGaps: SkillGap[];
  strengths: Array<{ name: string; proficiency: ProficiencyLevel; category: string }>;
  recommendations: string[];
  analyzedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  concept: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface RoadmapLesson {
  id: string;
  title: string;
  content?: string;
  durationMinutes?: number;
}

export interface RoadmapCodeSnippet {
  language: string;
  code: string;
  title?: string;
}

export interface RoadmapExercise {
  id: string;
  prompt: string;
  starterCode?: string;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'locked' | 'in_progress' | 'completed' | 'failed' | 'remediated_and_passed';
  isRemedial: boolean;
  estimatedHours: number;
  lessons: RoadmapLesson[];
  codeSnippets: RoadmapCodeSnippet[];
  exercises: RoadmapExercise[];
  quiz?: Quiz;
  order: number;
  remedialForModuleId?: string;
  remedialAttemptCount?: number;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  modules: RoadmapModule[];
  totalHours: number;
  completedHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSubmission {
  userId: string;
  moduleId: string;
  score: number;
  submittedAt: string;
  answers?: Record<string, number>;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  moduleId: string;
  score: number; // 0 - 100
  passed: boolean; // score >= 70
  status: 'passed' | 'failed';
  feedback: string;
  missedConcepts: string[];
  evaluatedAt: string;
}

export interface AgentFeedEvent {
  id: string;
  userId?: string;
  agentName: 'Skill Analyzer' | 'Curriculum Planner' | 'Assessment Evaluator' | 'AI Mentor' | 'System';
  type: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string | number;
}

export interface AgentMessage {
  id: string;
  userId: string;
  sender: 'user' | 'mentor' | 'system';
  content: string;
  timestamp: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  speed?: 'instant' | 'realistic';
}

export interface IStorageAdapter {
  getProfile(userId: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  getRoadmap(userId: string): Promise<Roadmap | null>;
  saveRoadmap(roadmap: Roadmap): Promise<void>;
  getAssessments(userId: string): Promise<AssessmentResult[]>;
  saveAssessmentResult(result: AssessmentResult): Promise<void>;
  getAgentFeed(userId: string): Promise<AgentMessage[]>;
  appendAgentMessage(message: AgentMessage): Promise<void>;
  resetToPreset(presetId: string): Promise<LearnerProfile>;
  isLiveConnected(): boolean;
  getMode(): 'firestore' | 'local_mock';
}

export interface ILLMClient {
  streamText(prompt: string, onToken: (chunk: string) => void, options?: LLMOptions): Promise<string>;
  generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
  getProviderName(): 'openai' | 'anthropic' | 'gemini' | 'mock';
}

export interface IAdaptiveRemediationLoop {
  handleAssessmentSubmission(result: AssessmentResult, currentRoadmap: Roadmap): Promise<{
    updatedRoadmap: Roadmap;
    remedialModuleInserted: boolean;
    remedialModule?: RoadmapModule;
  }>;
  handleCareerGoalChange(newRoleId: string, currentProfile: LearnerProfile, currentRoadmap: Roadmap): Promise<{
    updatedProfile: LearnerProfile;
    updatedRoadmap: Roadmap;
    gapAnalysis: GapAnalysisReport;
  }>;
}

export interface TestContextOptions {
  userId?: string;
  presetId?: 'fullstack-dev' | 'aiml-engineer' | 'devops-engineer' | 'full-stack' | 'ai-ml' | 'devops';
  storageMode?: 'local_mock' | 'firestore';
  llmSpeed?: 'instant' | 'realistic';
}

export interface StreamCaptureResult {
  fullText: string;
  chunks: string[];
  tokenCount: number;
  durationMs: number;
}

export interface AssessmentSubmissionOptions {
  moduleId: string;
  targetScore: number;
  submissionDetails?: Record<string, any>;
}

export interface CareerPivotOptions {
  newRoleId: string;
  reason?: string;
}
