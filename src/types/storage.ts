/**
 * Persistence & Storage Adapter Contracts
 * Matching PRD Section 6.1 and PROJECT.md § Interface Contracts
 */

import { LearnerProfile } from './profile';
import { Roadmap } from './roadmap';
import { AssessmentResult } from './assessment';
import { AgentFeedEvent, AgentMessage } from './agents';

export type StorageMode = 'firestore' | 'local_mock';

export interface IStorageAdapter {
  getProfile(userId: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  getRoadmap(userId: string): Promise<Roadmap | null>;
  saveRoadmap(roadmap: Roadmap): Promise<void>;
  getAssessments(userId: string): Promise<AssessmentResult[]>;
  saveAssessmentResult(result: AssessmentResult): Promise<void>;
  getAgentFeed(userId: string): Promise<AgentFeedEvent[]>;
  appendFeedEvent?(event: AgentFeedEvent): Promise<void>;
  appendAgentMessage?(message: AgentMessage): Promise<void>;
  resetToPreset(presetId: string, userId?: string): Promise<LearnerProfile>;
  isLiveConnected(): boolean;
  getMode(): StorageMode;
}
