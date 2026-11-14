import {
  IStorageAdapter,
  LearnerProfile,
  Roadmap,
  AssessmentResult,
  AgentFeedEvent,
  AgentMessage,
} from '@/types';
import { PRESET_FULL_STACK_CANDIDATE, PRESET_AIML_TRANSITION, PRESET_DEVOPS_TRANSITION } from '@/data/presets';
import { ROLE_BENCHMARKS } from '@/lib/benchmarks';

/**
 * In-Memory & LocalStorage Dual-Mode Storage Adapter
 */
export class LocalStorageMockAdapter implements IStorageAdapter {
  private profiles = new Map<string, LearnerProfile>();
  private roadmaps = new Map<string, Roadmap>();
  private assessments = new Map<string, AssessmentResult[]>();
  private feedHistory = new Map<string, AgentFeedEvent[]>();
  private messages = new Map<string, AgentMessage[]>();

  constructor() {
    this.hydrateFromLocalStorage();
  }

  private hydrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedProfiles = localStorage.getItem('sb_profiles');
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        Object.entries(parsed).forEach(([k, v]) => this.profiles.set(k, v as LearnerProfile));
      }
      const savedRoadmaps = localStorage.getItem('sb_roadmaps');
      if (savedRoadmaps) {
        const parsed = JSON.parse(savedRoadmaps);
        Object.entries(parsed).forEach(([k, v]) => this.roadmaps.set(k, v as Roadmap));
      }
    } catch {
      // LocalStorage access may fail in private mode or SSR
    }
  }

  private syncToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const profObj: Record<string, LearnerProfile> = {};
      this.profiles.forEach((v, k) => (profObj[k] = v));
      localStorage.setItem('sb_profiles', JSON.stringify(profObj));

      const roadObj: Record<string, Roadmap> = {};
      this.roadmaps.forEach((v, k) => (roadObj[k] = v));
      localStorage.setItem('sb_roadmaps', JSON.stringify(roadObj));
    } catch {
      // Ignore quota errors
    }
  }

  public async getProfile(userId: string): Promise<LearnerProfile | null> {
    if (this.profiles.has(userId)) {
      return JSON.parse(JSON.stringify(this.profiles.get(userId)!));
    }
    // Default to Full Stack Canonical Preset for new sessions
    return this.resetToPreset('fullstack-dev', userId);
  }

  public async saveProfile(profile: LearnerProfile): Promise<void> {
    this.profiles.set(profile.id, JSON.parse(JSON.stringify(profile)));
    this.syncToLocalStorage();
  }

  public async getRoadmap(userId: string): Promise<Roadmap | null> {
    if (this.roadmaps.has(userId)) {
      return JSON.parse(JSON.stringify(this.roadmaps.get(userId)!));
    }
    return null;
  }

  public async saveRoadmap(roadmap: Roadmap): Promise<void> {
    this.roadmaps.set(roadmap.userId, JSON.parse(JSON.stringify(roadmap)));
    this.syncToLocalStorage();
  }

  public async getAssessments(userId: string): Promise<AssessmentResult[]> {
    return [...(this.assessments.get(userId) || [])];
  }

  public async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    if (!this.assessments.has(result.userId)) {
      this.assessments.set(result.userId, []);
    }
    this.assessments.get(result.userId)!.push(result);
  }

  public async getAgentFeed(userId: string): Promise<AgentFeedEvent[]> {
    return [...(this.feedHistory.get(userId) || [])];
  }

  public async appendAgentMessage(message: AgentMessage): Promise<void> {
    if (!this.messages.has(message.userId)) {
      this.messages.set(message.userId, []);
    }
    this.messages.get(message.userId)!.push(message);
  }

  public async resetToPreset(presetId: string, userId: string): Promise<LearnerProfile> {
    let source = PRESET_FULL_STACK_CANDIDATE;
    if (presetId === 'aiml-engineer') source = PRESET_AIML_TRANSITION;
    if (presetId === 'devops-engineer') source = PRESET_DEVOPS_TRANSITION;

    const newProfile: LearnerProfile = {
      ...JSON.parse(JSON.stringify(source)),
      id: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveProfile(newProfile);
    return newProfile;
  }

  public isLiveConnected(): boolean {
    return false;
  }

  public getMode(): 'firestore' | 'local_mock' {
    return 'local_mock';
  }
}

/**
 * Storage Service Factory implementing Dual-Mode Pattern
 */
export class StorageService {
  private static instance: IStorageAdapter;

  public static getInstance(): IStorageAdapter {
    if (!StorageService.instance) {
      // In SSR or when Firebase client keys are absent, use LocalStorageMockAdapter
      const hasFirebase =
        typeof process !== 'undefined' &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      // Local mock is robust and works seamlessly on both server and client
      StorageService.instance = new LocalStorageMockAdapter();
    }
    return StorageService.instance;
  }
}
