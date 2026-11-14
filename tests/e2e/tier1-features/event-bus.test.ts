import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, AgentEventBus } from '../harness';

describe('Tier 1: Feature 13 - Live Agent Collaboration Feed & Event Bus', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-FEED-01: Singleton AgentEventBus Guarantee', () => {
    const bus1 = AgentEventBus.getInstance();
    const bus2 = AgentEventBus.getInstance();
    expect(bus1).toBe(bus2);
  });

  it('E2E-T1-FEED-02: Pub/Sub Event Dispatch & Cleanup', async () => {
    const bus = AgentEventBus.getInstance();
    let callCount = 0;

    const unsubscribe = bus.subscribe('custom:test:event', () => {
      callCount++;
    });

    await bus.publish('custom:test:event', { foo: 'bar' });
    expect(callCount).toBe(1);

    // Unsubscribe and publish again
    unsubscribe();
    await bus.publish('custom:test:event', { foo: 'baz' });
    expect(callCount).toBe(1); // Did not increment after unsubscription
  });

  it('E2E-T1-FEED-03: Feed Chronological Sequence Tracking', async () => {
    const bus = AgentEventBus.getInstance();

    bus.recordFeedEvent({
      agentName: 'Skill Analyzer',
      type: 'agent:skill-analysis:started',
      message: 'Analysis 1 started',
    });

    bus.recordFeedEvent({
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum:started',
      message: 'Curriculum 2 started',
    });

    bus.recordFeedEvent({
      agentName: 'Assessment Evaluator',
      type: 'agent:assessment:evaluated',
      message: 'Assessment 3 completed',
    });

    const history = bus.getFeedHistory();
    expect(history.length).toBeGreaterThanOrEqual(3);

    const types = history.slice(-3).map(h => h.type);
    expect(types).toEqual([
      'agent:skill-analysis:started',
      'agent:curriculum:started',
      'agent:assessment:evaluated',
    ]);
  });

  it('E2E-T1-FEED-04: Agent Attribution & Event Metadata', async () => {
    const bus = AgentEventBus.getInstance();

    const event = bus.recordFeedEvent({
      agentName: 'AI Mentor',
      type: 'mentor:advice:streamed',
      message: 'Provided Socratic explanation for async closures.',
      metadata: { topic: 'Closures', tokenCount: 42 },
    });

    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();
    expect(event.agentName).toBe('AI Mentor');
    expect(event.metadata?.topic).toBe('Closures');
    expect(event.metadata?.tokenCount).toBe(42);
  });

  it('E2E-T1-FEED-05: Event Payload Preserved Without Mutation', async () => {
    const bus = AgentEventBus.getInstance();
    let receivedPayload: any = null;

    bus.subscribe('data:complex:event', (payload: any) => {
      receivedPayload = payload;
    });

    const originalData = {
      user: 'learner-1',
      metrics: { score: 95.5, attempts: 2 },
      tags: ['react', 'nextjs'],
    };

    await bus.publish('data:complex:event', originalData);
    expect(receivedPayload).toEqual(originalData);
  });
});
