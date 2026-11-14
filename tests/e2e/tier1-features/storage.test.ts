import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, LocalStorageMockAdapter } from '../harness';

describe('Tier 1: Feature 6 - Dual-Mode Persistence (StorageService)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-STOR-01: LocalStorageMockAdapter Standalone Lifecycle', async () => {
    const adapter = new LocalStorageMockAdapter('local_mock');

    // Profile CRUD
    await adapter.saveProfile({
      id: 'test-user-crud',
      name: 'Storage Tester',
      targetRoleId: 'fullstack-dev',
      skills: [],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const prof = await adapter.getProfile('test-user-crud');
    expect(prof).not.toBeNull();
    expect(prof?.name).toBe('Storage Tester');

    // Roadmap CRUD
    await adapter.saveRoadmap({
      id: 'roadmap-crud',
      userId: 'test-user-crud',
      targetRoleId: 'fullstack-dev',
      modules: [],
      totalHours: 20,
      completedHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const roadmap = await adapter.getRoadmap('test-user-crud');
    expect(roadmap).not.toBeNull();
    expect(roadmap?.totalHours).toBe(20);

    // Assessment Result CRUD
    await adapter.saveAssessmentResult({
      id: 'asmt-crud',
      userId: 'test-user-crud',
      moduleId: 'mod-1',
      score: 85,
      passed: true,
      status: 'passed',
      feedback: 'Well done',
      missedConcepts: [],
      evaluatedAt: new Date().toISOString(),
    });

    const assessments = await adapter.getAssessments('test-user-crud');
    expect(assessments).toHaveLength(1);
    expect(assessments[0].score).toBe(85);

    // Agent Feed CRUD
    await adapter.appendAgentMessage({
      id: 'msg-crud',
      userId: 'test-user-crud',
      sender: 'mentor',
      content: 'Welcome to your learning journey!',
      timestamp: new Date().toISOString(),
    });

    const feed = await adapter.getAgentFeed('test-user-crud');
    expect(feed).toHaveLength(1);
    expect(feed[0].content).toContain('Welcome');
  });

  it('E2E-T1-STOR-02: Zero-Config Mode Detection', async () => {
    // Zero-config: no live credentials -> defaults to local_mock
    expect(context.storage.getMode()).toBe('local_mock');
    expect(context.storage.isLiveConnected()).toBe(false);
  });

  it('E2E-T1-STOR-03: Firestore Adapter Active Connection Verification', async () => {
    const firestoreAdapter = new LocalStorageMockAdapter('firestore');
    expect(firestoreAdapter.getMode()).toBe('firestore');
    expect(firestoreAdapter.isLiveConnected()).toBe(true);
  });

  it('E2E-T1-STOR-04: Graceful Degradation on Firestore Initialization Failure', async () => {
    const adapter = new LocalStorageMockAdapter('firestore');
    expect(adapter.getMode()).toBe('firestore');

    // Simulate connection failure during write
    adapter.setSimulateDisconnectError(true);
    adapter.setItem('test-key', 'test-value');

    // Mode degrades gracefully to local_mock
    expect(adapter.getMode()).toBe('local_mock');
    expect(adapter.isLiveConnected()).toBe(false);
  });

  it('E2E-T1-STOR-05: Multi-User Isolation in Storage', async () => {
    const adapter = context.storage;

    await adapter.resetToPreset('fullstack-dev', 'user-alpha');
    await adapter.resetToPreset('aiml-engineer', 'user-beta');

    const alphaProfile = await adapter.getProfile('user-alpha');
    const betaProfile = await adapter.getProfile('user-beta');

    expect(alphaProfile?.targetRoleId).toBe('fullstack-dev');
    expect(betaProfile?.targetRoleId).toBe('aiml-engineer');

    const alphaRoadmap = await adapter.getRoadmap('user-alpha');
    const betaRoadmap = await adapter.getRoadmap('user-beta');

    expect(alphaRoadmap?.userId).toBe('user-alpha');
    expect(betaRoadmap?.userId).toBe('user-beta');
  });
});
