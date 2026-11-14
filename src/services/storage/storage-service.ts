import {
  IStorageAdapter,
  StorageMode,
  LearnerProfile,
  Roadmap,
  AssessmentResult,
  AgentFeedEvent,
  AgentMessage,
} from '@/types';
import { LocalStorageMockAdapter } from './local-mock-adapter';
import { FirestoreAdapter } from './firestore-adapter';

export class StorageService {
  private static instance: IStorageAdapter | null = null;

  public static getInstance(): IStorageAdapter {
    if (!StorageService.instance) {
      const projectId =
        typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID : undefined;

      const hasValidFirebaseConfig =
        Boolean(projectId) &&
        projectId !== 'demo-project' &&
        projectId !== 'your-project-id' &&
        projectId !== 'test-placeholder';

      if (hasValidFirebaseConfig) {
        try {
          const firestore = new FirestoreAdapter();
          if (firestore.isLiveConnected()) {
            StorageService.instance = firestore;
            return StorageService.instance;
          }
        } catch (err) {
          console.warn('[StorageService] Firestore initialization error, falling back to LocalStorageMockAdapter:', err);
        }
      }

      // Default zero-config fallback: LocalStorage + In-Memory Mock Adapter
      StorageService.instance = new LocalStorageMockAdapter();
    }

    return StorageService.instance;
  }

  public static resetInstance(): void {
    StorageService.instance = null;
  }

  // Static proxy convenience methods
  public static async getProfile(userId: string): Promise<LearnerProfile | null> {
    return StorageService.getInstance().getProfile(userId);
  }

  public static async saveProfile(profile: LearnerProfile): Promise<void> {
    return StorageService.getInstance().saveProfile(profile);
  }

  public static async getRoadmap(userId: string): Promise<Roadmap | null> {
    return StorageService.getInstance().getRoadmap(userId);
  }

  public static async saveRoadmap(roadmap: Roadmap): Promise<void> {
    return StorageService.getInstance().saveRoadmap(roadmap);
  }

  public static async getAssessments(userId: string): Promise<AssessmentResult[]> {
    return StorageService.getInstance().getAssessments(userId);
  }

  public static async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    return StorageService.getInstance().saveAssessmentResult(result);
  }

  public static async getAgentFeed(userId: string): Promise<AgentFeedEvent[]> {
    return StorageService.getInstance().getAgentFeed(userId);
  }

  public static async appendFeedEvent(event: AgentFeedEvent): Promise<void> {
    const adapter = StorageService.getInstance();
    if (adapter.appendFeedEvent) {
      return adapter.appendFeedEvent(event);
    }
  }

  public static async appendAgentMessage(message: AgentMessage): Promise<void> {
    const adapter = StorageService.getInstance();
    if (adapter.appendAgentMessage) {
      return adapter.appendAgentMessage(message);
    }
  }

  public static async resetToPreset(presetId: string, userId?: string): Promise<LearnerProfile> {
    return StorageService.getInstance().resetToPreset(presetId, userId);
  }

  public static isLiveConnected(): boolean {
    return StorageService.getInstance().isLiveConnected();
  }

  public static getMode(): StorageMode {
    return StorageService.getInstance().getMode();
  }
}
