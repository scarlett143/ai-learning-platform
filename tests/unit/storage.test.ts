import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageMockAdapter, StorageService } from '@/services/storage';
import { LearnerProfile, Roadmap, AssessmentResult, AgentFeedEvent } from '@/types';
import { PRESET_FULL_STACK_ALEX } from '@/data/presets';

describe('Dual-Mode Storage Layer (Unit Tests)', () => {
  let adapter: LocalStorageMockAdapter;

  beforeEach(() => {
    StorageService.resetInstance();
    adapter = new LocalStorageMockAdapter();
  });

  describe('LocalStorageMockAdapter CRUD Operations', () => {
    it('saves and retrieves a learner profile', async () => {
      const profile: LearnerProfile = {
        id: 'test-user-1',
        name: 'Samantha Ray',
        email: 'samantha@example.com',
        targetRole: 'full-stack',
        targetRoleId: 'fullstack-dev',
        weeklyCommitmentHours: 12,
        skills: [
          { id: 's1', name: 'TypeScript', category: 'frontend', proficiency: 'intermediate' },
        ],
        certifications: [],
        projects: [],
        createdAt: '2026-11-14T00:00:00Z',
        updatedAt: '2026-11-14T00:00:00Z',
      };

      await adapter.saveProfile(profile);
      const retrieved = await adapter.getProfile('test-user-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-user-1');
      expect(retrieved?.name).toBe('Samantha Ray');
      expect(retrieved?.skills[0].name).toBe('TypeScript');
    });

    it('returns null when querying unseeded unknown user profile', async () => {
      const nonExistent = await adapter.getProfile('unknown-random-user-id-999');
      expect(nonExistent).toBeNull();
    });

    it('saves and retrieves a roadmap', async () => {
      const roadmap: Roadmap = {
        id: 'roadmap-test-1',
        userId: 'test-user-1',
        roleId: 'full-stack',
        roleTitle: 'Full Stack Developer',
        totalEstimatedHours: 40,
        modules: [
          {
            id: 'mod-1',
            order: 1,
            title: 'Modern JavaScript Deep Dive',
            category: 'frontend',
            estimatedHours: 10,
            status: 'in-progress',
            lessons: [
              { id: 'l1', title: 'Event Loop & Promises', durationMinutes: 45, completed: false },
            ],
          },
        ],
        createdAt: '2026-11-14T00:00:00Z',
        updatedAt: '2026-11-14T00:00:00Z',
      };

      await adapter.saveRoadmap(roadmap);
      const retrieved = await adapter.getRoadmap('test-user-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('roadmap-test-1');
      expect(retrieved?.modules.length).toBe(1);
      expect(retrieved?.modules[0].title).toBe('Modern JavaScript Deep Dive');
    });

    it('saves and retrieves assessment results', async () => {
      const result: AssessmentResult = {
        id: 'eval-1',
        assessmentId: 'quiz-js-1',
        moduleId: 'mod-1',
        userId: 'test-user-1',
        score: 85,
        passed: true,
        threshold: 70,
        totalQuestions: 5,
        correctCount: 4,
        questionFeedback: [],
        failedConceptTags: [],
        answers: [{ questionId: 'q1', selectedIndex: 1, correct: true }],
        evaluatedAt: '2026-11-14T00:00:00Z',
      };

      await adapter.saveAssessmentResult(result);
      const list = await adapter.getAssessments('test-user-1');

      expect(list.length).toBe(1);
      expect(list[0].id).toBe('eval-1');
      expect(list[0].score).toBe(85);
      expect(list[0].passed).toBe(true);
    });

    it('appends and retrieves agent feed events', async () => {
      const event: AgentFeedEvent = {
        id: 'event-1',
        userId: 'test-user-1',
        agentName: 'Skill Analyzer',
        type: 'evaluation',
        title: 'Competency Analysis Complete',
        summary: 'Calculated 32% readiness score for Full Stack Developer.',
        timestamp: new Date().toISOString(),
      };

      await adapter.appendFeedEvent(event);
      const feed = await adapter.getAgentFeed('test-user-1');

      expect(feed.length).toBe(1);
      expect(feed[0].title).toBe('Competency Analysis Complete');
      expect(feed[0].agentName).toBe('Skill Analyzer');
    });

    it('reports offline local mock mode and disconnected cloud sync', () => {
      expect(adapter.getMode()).toBe('local_mock');
      expect(adapter.isLiveConnected()).toBe(false);
    });
  });

  describe('Preset Resetting & Default Hydration', () => {
    it('resets to Full Stack Developer preset (Alex Chen)', async () => {
      const profile = await adapter.resetToPreset('preset-full-stack-transition', 'user-reset-1');

      expect(profile.id).toBe('user-reset-1');
      expect(profile.name).toBe('Alex Chen');
      expect(profile.targetRoleId).toBe('fullstack-dev');
      expect(profile.skills.length).toBe(3);

      const saved = await adapter.getProfile('user-reset-1');
      expect(saved?.name).toBe('Alex Chen');
    });

    it('resets to AI/ML Engineer preset (Priya Sharma)', async () => {
      const profile = await adapter.resetToPreset('preset-ai-engineer-pivot', 'user-reset-2');

      expect(profile.id).toBe('user-reset-2');
      expect(profile.name).toBe('Priya Sharma');
      expect(profile.targetRoleId).toBe('aiml-engineer');
    });

    it('resets to Cloud DevOps Architect preset (Marcus Vance)', async () => {
      const profile = await adapter.resetToPreset('preset-cloud-devops-architect', 'user-reset-3');

      expect(profile.id).toBe('user-reset-3');
      expect(profile.name).toBe('Marcus Vance');
      expect(profile.targetRoleId).toBe('devops-engineer');
    });

    it('returns canonical Alex Chen preset for pre-seeded user IDs', async () => {
      const alex = await adapter.getProfile('alex-chen');
      expect(alex).not.toBeNull();
      expect(alex?.name).toBe('Alex Chen');
    });
  });

  describe('StorageService Factory Pattern', () => {
    it('returns singleton adapter instance across multiple calls', () => {
      const instance1 = StorageService.getInstance();
      const instance2 = StorageService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1.getMode()).toBe('local_mock');
    });

    it('clears and recreates instance on resetInstance()', () => {
      const instance1 = StorageService.getInstance();
      StorageService.resetInstance();
      const instance2 = StorageService.getInstance();

      expect(instance1).not.toBe(instance2);
    });

    it('proxies static operations cleanly to the underlying adapter', async () => {
      const testProfile: LearnerProfile = {
        ...JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX)),
        id: 'service-proxy-user',
      };

      await StorageService.saveProfile(testProfile);
      const retrieved = await StorageService.getProfile('service-proxy-user');

      expect(retrieved?.id).toBe('service-proxy-user');
      expect(StorageService.getMode()).toBe('local_mock');
      expect(StorageService.isLiveConnected()).toBe(false);
    });
  });
});
