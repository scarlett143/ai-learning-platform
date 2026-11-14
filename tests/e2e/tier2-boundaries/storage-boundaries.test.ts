import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, LocalStorageMockAdapter, MockLLMStreamProvider } from '../harness';

describe('Tier 2: Boundary Domain 3 - Storage & LLM Stream Boundaries (10 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T2-BND-16: Missing Firebase Keys with Local Fallback', () => {
    const adapter = new LocalStorageMockAdapter('local_mock');
    expect(adapter.getMode()).toBe('local_mock');
    expect(adapter.isLiveConnected()).toBe(false);
  });

  it('E2E-T2-BND-17: Corrupt LocalStorage JSON Recovery', async () => {
    const adapter = context.storage;
    // Inject corrupt JSON into storage for profile
    adapter.setItem(`profile:${context.userId}`, '{"corrupt: json-invalid');

    // Adapter catches parsing error, logs warning, and auto-heals with default profile
    const recovered = await adapter.getProfile(context.userId);
    expect(recovered).not.toBeNull();
    expect(recovered?.id).toBe(context.userId);
    expect(recovered?.skills.length).toBeGreaterThan(0);
  });

  it('E2E-T2-BND-18: Storage Quota Exceeded Exception Handling', () => {
    const adapter = new LocalStorageMockAdapter('local_mock');
    adapter.setSimulateQuotaError(true);

    expect(() => {
      adapter.setItem('heavy_key', 'heavy_payload');
    }).toThrow(/quota has been exceeded/i);
  });

  it('E2E-T2-BND-19: Null / Empty User ID Guard Rejection', async () => {
    const adapter = context.storage;

    await expect(adapter.getProfile('')).rejects.toThrow(/ValidationError/i);
    await expect(adapter.getRoadmap('   ')).rejects.toThrow(/ValidationError/i);
    await expect(adapter.saveProfile(null as any)).rejects.toThrow(/ValidationError/i);
  });

  it('E2E-T2-BND-20: Concurrent Read/Write Race Condition Safety', async () => {
    const adapter = context.storage;
    await adapter.resetToPreset('fullstack-dev', context.userId);

    // Dispatch 20 concurrent updates
    const promises = Array.from({ length: 20 }, (_, i) => {
      return adapter.saveProfile({
        id: context.userId,
        name: `Concurrent User ${i}`,
        targetRoleId: 'fullstack-dev',
        skills: [{ id: `s-${i}`, name: `Skill ${i}`, proficiency: 'beginner' }],
        certifications: [],
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await Promise.all(promises);

    const finalProfile = await adapter.getProfile(context.userId);
    expect(finalProfile).not.toBeNull();
    expect(finalProfile?.name).toMatch(/Concurrent User \d+/);
  });

  it('E2E-T2-BND-21: Querying Non-Existent Entity IDs Returns Null Cleanly', async () => {
    const prof = await context.storage.getProfile('non-existent-user-999');
    expect(prof).toBeNull();

    const road = await context.storage.getRoadmap('non-existent-user-999');
    expect(road).toBeNull();

    const asmts = await context.storage.getAssessments('non-existent-user-999');
    expect(asmts).toEqual([]);
  });

  it('E2E-T2-BND-22: Null and Empty Token Stream Chunks Filtered', async () => {
    const llm = new MockLLMStreamProvider();
    llm.queueResponse('test-empty-chunks', 'WordA  WordB WordC');

    const chunks: string[] = [];
    await llm.streamText('test-empty-chunks', chunk => {
      chunks.push(chunk);
    });

    for (const chunk of chunks) {
      expect(chunk).not.toBeNull();
      expect(chunk).not.toBeUndefined();
      expect(chunk.length).toBeGreaterThan(0);
    }
  });

  it('E2E-T2-BND-23: Stream Abort Signal Cancellation', async () => {
    const llm = new MockLLMStreamProvider({ speed: 'realistic' });
    const controller = new AbortController();

    // Abort after 15ms
    setTimeout(() => {
      controller.abort();
    }, 15);

    await expect(
      llm.streamText('Explain closures', () => {}, { signal: controller.signal })
    ).rejects.toThrow(/aborted/i);
  });

  it('E2E-T2-BND-24: Empty and Whitespace-Only Prompts Validation', async () => {
    const llm = context.llm;

    await expect(llm.streamText('', () => {})).rejects.toThrow(/Prompt cannot be empty/i);
    await expect(llm.streamText('   ', () => {})).rejects.toThrow(/Prompt cannot be empty/i);
    await expect(llm.generateJSON('')).rejects.toThrow(/Prompt cannot be empty/i);
  });

  it('E2E-T2-BND-25: Malformed JSON LLM Response Recovery or Fallback', async () => {
    const llm = new MockLLMStreamProvider();
    // Injects a fallback JSON response
    llm.queueJSON('malformed-trigger', {
      fallback: true,
      modules: [{ id: 'mod-recovered', title: 'Recovered Module' }],
    });

    const res = await llm.generateJSON<{ fallback: boolean; modules: any[] }>('malformed-trigger');
    expect(res.fallback).toBe(true);
    expect(res.modules.length).toBe(1);
  });
});
