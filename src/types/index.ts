/**
 * Domain & Interface Contracts for SkillBridge AI
 * Derived from PRD.md and PROJECT.md specifications.
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
  requiredProficiency: ProficiencyLevel;
  currentProficiency: ProficiencyLevel | null;
  gapType: 'missing' | 'depth';
  category: string;
  weight: number;
}

export interface GapAnalysisReport {
  userId: string;
  targetRoleId: string;
  targetRoleName: string;
  readinessScore: number; // 0 - 100
  missingSkills: SkillGap[];
  strengths: Array<{ name: string; proficiency: ProficiencyLevel; category: string }>;
  recommendations: string[];
  analyzedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  completed?: boolean;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface PracticalExercise {
  id: string;
  prompt: string;
  solutionHint?: string;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'locked' | 'in_progress' | 'completed';
  isRemedial: boolean;
  remedialForSkill?: string;
  estimatedHours: number;
  lessons: Lesson[];
  codeSnippets: CodeSnippet[];
  exercises: PracticalExercise[];
  order: number;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  targetRoleName: string;
  generatedAt: string;
  readinessScore: number;
  modules: RoadmapModule[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillName: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  moduleId: string;
  moduleTitle: string;
  score: number; // 0 - 100
  passed: boolean; // score >= 70
  evaluatedAt: string;
  feedback: string;
  answers: Array<{ questionId: string; selectedIndex: number; correct: boolean }>;
}

export type AgentRoleName = 'Skill Analyzer' | 'Curriculum Planner' | 'Assessment Evaluator' | 'AI Mentor';

export interface AgentFeedEvent {
  id: string;
  userId: string;
  agentName: AgentRoleName;
  type: string;
  message: string;
  timestamp: number;
  payload?: any;
}

export interface AgentMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  agentName?: AgentRoleName;
  content: string;
  timestamp: number;
}

export interface IStorageAdapter {
  getProfile(userId: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  getRoadmap(userId: string): Promise<Roadmap | null>;
  saveRoadmap(roadmap: Roadmap): Promise<void>;
  getAssessments(userId: string): Promise<AssessmentResult[]>;
  saveAssessmentResult(result: AssessmentResult): Promise<void>;
  getAgentFeed(userId: string): Promise<AgentFeedEvent[]>;
  appendAgentMessage(message: AgentMessage): Promise<void>;
  resetToPreset(presetId: string, userId: string): Promise<LearnerProfile>;
  isLiveConnected(): boolean;
  getMode(): 'firestore' | 'local_mock';
}

export interface ILLMClient {
  streamText(prompt: string, onToken: (chunk: string) => void): Promise<string>;
  generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
  getProviderName(): 'gemini' | 'openai' | 'mock';
}
