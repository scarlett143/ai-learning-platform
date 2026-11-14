import {
  IStorageAdapter,
  StorageMode,
  LearnerProfile,
  Roadmap,
  AssessmentResult,
  AgentFeedEvent,
  AgentMessage,
} from '@/types';
import {
  PRESET_FULL_STACK_ALEX,
  PRESET_AI_ML_PIVOT,
  PRESET_DEVOPS_ARCHITECT,
  getPresetById,
} from '@/data/presets';

const STORAGE_PREFIX = 'ai_learning_platform:';

export class LocalStorageMockAdapter implements IStorageAdapter {
  private profiles = new Map<string, LearnerProfile>();
  private roadmaps = new Map<string, Roadmap>();
  private assessments = new Map<string, AssessmentResult[]>();
  private feedEvents = new Map<string, AgentFeedEvent[]>();
  private messages = new Map<string, AgentMessage[]>();

  constructor() {
    this.seedDefaults();
    this.hydrateFromStorage();
  }

  private seedDefaults(): void {
    // Seed canonical preset user profiles into in-memory dictionary
    this.profiles.set('alex-chen', JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX)));
    this.profiles.set('default-user', JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX)));
    this.profiles.set('preset-fullstack', JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX)));
    this.profiles.set('fullstack-dev', JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX)));
    this.profiles.set('priya-sharma', JSON.parse(JSON.stringify(PRESET_AI_ML_PIVOT)));
    this.profiles.set('marcus-vance', JSON.parse(JSON.stringify(PRESET_DEVOPS_ARCHITECT)));
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private hydrateFromStorage(): void {
    if (!this.isBrowser()) return;

    try {
      const savedProfiles =
        localStorage.getItem(`${STORAGE_PREFIX}profiles`) || localStorage.getItem('sb_profiles');
      if (savedProfiles) {
        try {
          const parsed = JSON.parse(savedProfiles);
          Object.entries(parsed).forEach(([k, v]) => this.profiles.set(k, v as LearnerProfile));
        } catch {
          // Corrupt JSON recovery
          console.warn('Corrupt profiles JSON detected in localStorage, restoring defaults.');
        }
      }

      const savedRoadmaps =
        localStorage.getItem(`${STORAGE_PREFIX}roadmaps`) || localStorage.getItem('sb_roadmaps');
      if (savedRoadmaps) {
        try {
          const parsed = JSON.parse(savedRoadmaps);
          Object.entries(parsed).forEach(([k, v]) => this.roadmaps.set(k, v as Roadmap));
        } catch {
          console.warn('Corrupt roadmaps JSON detected in localStorage.');
        }
      }

      const savedAssessments = localStorage.getItem(`${STORAGE_PREFIX}assessments`);
      if (savedAssessments) {
        try {
          const parsed = JSON.parse(savedAssessments);
          Object.entries(parsed).forEach(([k, v]) => this.assessments.set(k, v as AssessmentResult[]));
        } catch {
          console.warn('Corrupt assessments JSON detected in localStorage.');
        }
      }
    } catch {
      // LocalStorage access may fail in private mode or sandboxed contexts
    }
  }

  private persistToStorage(): void {
    if (!this.isBrowser()) return;

    try {
      const profObj: Record<string, LearnerProfile> = {};
      this.profiles.forEach((v, k) => (profObj[k] = v));
      localStorage.setItem(`${STORAGE_PREFIX}profiles`, JSON.stringify(profObj));

      const roadObj: Record<string, Roadmap> = {};
      this.roadmaps.forEach((v, k) => (roadObj[k] = v));
      localStorage.setItem(`${STORAGE_PREFIX}roadmaps`, JSON.stringify(roadObj));

      const assessObj: Record<string, AssessmentResult[]> = {};
      this.assessments.forEach((v, k) => (assessObj[k] = v));
      localStorage.setItem(`${STORAGE_PREFIX}assessments`, JSON.stringify(assessObj));
    } catch {
      // Ignore quota exceeded or permissions errors
    }
  }

  public async getProfile(userId: string): Promise<LearnerProfile | null> {
    if (this.profiles.has(userId)) {
      return JSON.parse(JSON.stringify(this.profiles.get(userId)!));
    }
    // Automatically initialize default profile only for canonical default user IDs
    if (userId === 'default-user' || userId === 'alex-chen' || userId === 'current') {
      return this.resetToPreset('preset-full-stack-transition', userId);
    }
    return null;
  }

  public async saveProfile(profile: LearnerProfile): Promise<void> {
    this.profiles.set(profile.id, JSON.parse(JSON.stringify(profile)));
    this.persistToStorage();
  }

  public async getRoadmap(userId: string): Promise<Roadmap | null> {
    if (this.roadmaps.has(userId)) {
      return JSON.parse(JSON.stringify(this.roadmaps.get(userId)!));
    }
    return null;
  }

  public async saveRoadmap(roadmap: Roadmap): Promise<void> {
    this.roadmaps.set(roadmap.userId, JSON.parse(JSON.stringify(roadmap)));
    this.persistToStorage();
  }

  public async getAssessments(userId: string): Promise<AssessmentResult[]> {
    const list = this.assessments.get(userId) || [];
    return JSON.parse(JSON.stringify(list));
  }

  public async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    if (!this.assessments.has(result.userId)) {
      this.assessments.set(result.userId, []);
    }
    this.assessments.get(result.userId)!.push(JSON.parse(JSON.stringify(result)));
    this.persistToStorage();
  }

  public async getAgentFeed(userId: string): Promise<AgentFeedEvent[]> {
    const list = this.feedEvents.get(userId) || [];
    return JSON.parse(JSON.stringify(list));
  }

  public async appendFeedEvent(event: AgentFeedEvent): Promise<void> {
    const key = event.userId || 'active-session';
    if (!this.feedEvents.has(key)) {
      this.feedEvents.set(key, []);
    }
    this.feedEvents.get(key)!.push(JSON.parse(JSON.stringify(event)));
  }

  public async appendAgentMessage(message: AgentMessage): Promise<void> {
    if (!this.messages.has(message.userId)) {
      this.messages.set(message.userId, []);
    }
    this.messages.get(message.userId)!.push(JSON.parse(JSON.stringify(message)));
  }

  public async resetToPreset(presetId: string, userId?: string): Promise<LearnerProfile> {
    const targetUserId = userId || 'alex-chen';
    const preset = getPresetById(presetId) || PRESET_FULL_STACK_ALEX;

    const cloned: LearnerProfile = {
      ...JSON.parse(JSON.stringify(preset)),
      id: targetUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveProfile(cloned);
    return cloned;
  }

  public isLiveConnected(): boolean {
    return false;
  }

  public getMode(): StorageMode {
    return 'local_mock';
  }
}
