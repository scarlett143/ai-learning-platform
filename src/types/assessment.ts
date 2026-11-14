/**
 * Assessment Engine & Grading Contracts
 * Matching PRD Section 7.5 and PROJECT.md § Interface Contracts
 */

export type QuestionType = 'multiple_choice' | 'code_analysis' | 'architecture_choice';

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  type?: QuestionType;
  question?: string;
  prompt: string; // Compatibility with both question & prompt
  codeSnippet?: string;
  options: (AssessmentOption | string)[];
  correctOptionId?: string;
  correctIndex?: number; // Backwards compatibility
  explanation: string;
  conceptTag?: string;
  skillName?: string; // Backwards compatibility
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillName: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  passingScoreThreshold: number; // 70
}

export interface AssessmentSubmission {
  id?: string;
  assessmentId?: string;
  moduleId: string;
  userId: string;
  score?: number;
  submittedAt?: string;
  answers: Record<string, string> | Record<string, number>;
}

export interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  conceptTag?: string;
  selectedIndex?: number; // Backwards compatibility
}

export interface AssessmentResult {
  id: string;
  assessmentId?: string;
  moduleId: string;
  moduleTitle?: string; // Backwards compatibility
  userId: string;
  score: number; // 0 - 100
  passed: boolean; // score >= 70
  threshold?: number; // 70
  totalQuestions?: number;
  correctCount?: number;
  questionFeedback?: QuestionFeedback[];
  failedConceptTags?: string[];
  evaluatedAt: string;
  feedback?: string; // Backwards compatibility
  answers: Array<{ questionId: string; selectedIndex: number; correct: boolean }>; // Compatibility
  status?: 'passed' | 'failed'; // Backwards compatibility
  missedConcepts?: string[]; // Backwards compatibility
}

export interface ConceptScore {
  conceptTag: string;
  score: number;
  total: number;
}
