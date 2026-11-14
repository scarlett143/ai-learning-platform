import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, AgentEventBus, EventBusSpy } from '../harness';

describe('Tier 2: Boundary Domain 4 - Event Bus & Adaptive Loop Boundaries (10 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T2-BND-26: High-Frequency Burst Publication (100 Events)', async () => {
    const bus = AgentEventBus.getInstance();
    let receivedCount = 0;

    const unsub = bus.subscribe('burst:test', () => {
      receivedCount++;
    });

    const promises = Array.from({ length: 100 }, (_, i) => {
      return bus.publish('burst:test', { index: i });
    });

    await Promise.all(promises);
    expect(receivedCount).toBe(100);
    unsub();
  });

  it('E2E-T2-BND-27: Faulty Subscriber Exception Isolation', async () => {
    const bus = AgentEventBus.getInstance();
    let subscriberBExecuted = false;

    // Faulty Subscriber A throws error
    bus.subscribe('isolated:topic', () => {
      throw new Error('Subscriber A Unhandled Crash');
    });

    // Healthy Subscriber B
    bus.subscribe('isolated:topic', () => {
      subscriberBExecuted = true;
    });

    await bus.publish('isolated:topic', { data: 'test' });
    expect(subscriberBExecuted).toBe(true);
  });

  it('E2E-T2-BND-28: Unsubscribe Idempotence & Safe Cleanup', () => {
    const bus = AgentEventBus.getInstance();
    const unsub = bus.subscribe('test:cleanup', () => {});

    // Calling unsubscribe multiple times should not throw
    expect(() => {
      unsub();
      unsub();
      unsub();
    }).not.toThrow();
  });

  it('E2E-T2-BND-29: Large Payload Event Preservation', async () => {
    const bus = AgentEventBus.getInstance();
    const largePayload = {
      codeSnippet: 'X'.repeat(50000), // 50KB string
      timestamp: Date.now(),
    };

    let receivedPayload: any = null;
    bus.subscribe('large:payload:topic', payload => {
      receivedPayload = payload;
    });

    await bus.publish('large:payload:topic', largePayload);
    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.codeSnippet.length).toBe(50000);
  });

  it('E2E-T2-BND-30: Feed History Eviction Cap', () => {
    const bus = AgentEventBus.getInstance();
    bus.setMaxHistoryLimit(50); // Set low limit for testing

    for (let i = 0; i < 75; i++) {
      bus.recordFeedEvent({
        agentName: 'System',
        type: 'test:event',
        message: `Message ${i}`,
      });
    }

    const history = bus.getFeedHistory();
    expect(history.length).toBe(50);
    expect(history[0].message).toBe('Message 25');
    expect(history[49].message).toBe('Message 74');
  });

  it('E2E-T2-BND-31: Multi-Tenant Event Filtering Strictly Isolates by UserId', async () => {
    const bus = AgentEventBus.getInstance();
    const userASpy = new EventBusSpy('user-alpha');
    const userBSpy = new EventBusSpy('user-beta');

    userASpy.startListening();
    userBSpy.startListening();

    bus.recordFeedEvent({
      userId: 'user-alpha',
      agentName: 'Skill Analyzer',
      type: 'user:alpha:event',
      message: 'Alpha only',
    });

    bus.recordFeedEvent({
      userId: 'user-beta',
      agentName: 'Curriculum Planner',
      type: 'user:beta:event',
      message: 'Beta only',
    });

    await userASpy.waitForEvent('user:alpha:event');
    await userBSpy.waitForEvent('user:beta:event');

    expect(userASpy.getEvents().some(e => e.userId === 'user-alpha')).toBe(true);
    expect(userASpy.getEvents().some(e => e.userId === 'user-beta')).toBe(false);

    expect(userBSpy.getEvents().some(e => e.userId === 'user-beta')).toBe(true);
    expect(userBSpy.getEvents().some(e => e.userId === 'user-alpha')).toBe(false);

    userASpy.stopListening();
    userBSpy.stopListening();
  });

  it('E2E-T2-BND-32: Recursive Remediation Prevention (Chained Failures)', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // First failure: inserts remedial module
    const outcome1 = await context.journey.submitAssessment(targetModuleId, 50.0);
    expect(outcome1.remedialModuleInserted).toBe(true);

    const initialRemedialCount = outcome1.updatedRoadmap.modules.filter(m => m.isRemedial).length;
    expect(initialRemedialCount).toBe(1);

    // Second consecutive failure on same module: does NOT duplicate redundant remedial module
    const outcome2 = await context.journey.submitAssessment(targetModuleId, 55.0);
    const postRemedialCount = outcome2.updatedRoadmap.modules.filter(m => m.isRemedial).length;
    expect(postRemedialCount).toBe(1);
  });

  it('E2E-T2-BND-33: Target Role Pivot to Identical Role (No-Op Boundary)', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmapBefore = await context.storage.getRoadmap(context.userId);

    // Pivot to same role 'fullstack-dev'
    const outcome = await context.journey.pivotCareerGoal('fullstack-dev');
    expect(outcome.updatedProfile.targetRoleId).toBe('fullstack-dev');
    expect(outcome.updatedRoadmap.modules.length).toBe(roadmapBefore!.modules.length);
  });

  it('E2E-T2-BND-34: Target Role Pivot to Empty / Null Role Rejection', async () => {
    await context.journey.applyPreset('fullstack-dev');

    await expect(context.journey.pivotCareerGoal('')).rejects.toThrow(/ValidationError/i);
    await expect(context.journey.pivotCareerGoal('   ')).rejects.toThrow(/ValidationError/i);
  });

  it('E2E-T2-BND-35: Rapid Repeated Goal Switches Sequential Consistency', async () => {
    await context.journey.applyPreset('fullstack-dev');

    // Rapid switches: Full Stack -> AI/ML -> DevOps
    await context.journey.pivotCareerGoal('aiml-engineer');
    await context.journey.pivotCareerGoal('devops-engineer');

    const finalProfile = await context.storage.getProfile(context.userId);
    const finalRoadmap = await context.storage.getRoadmap(context.userId);

    expect(finalProfile?.targetRoleId).toBe('devops-engineer');
    expect(finalRoadmap?.targetRoleId).toBe('devops-engineer');
    expect(finalRoadmap?.modules.some(m => m.title.includes('Docker') || m.title.includes('Linux'))).toBe(true);
  });
});
