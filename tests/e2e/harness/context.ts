import { TestContextOptions } from './types';
import { LocalStorageMockAdapter } from './storage-harness';
import { MockLLMStreamProvider } from './llm-mock-harness';
import { EventBusSpy } from './event-bus-harness';
import { JourneyHelpers } from './journey-helpers';
import { AssertionHelpers } from './assertion-helpers';

export class TestContext {
  public readonly userId: string;
  public readonly storage: LocalStorageMockAdapter;
  public readonly llm: MockLLMStreamProvider;
  public readonly events: EventBusSpy;
  public readonly journey: JourneyHelpers;
  public readonly assert: AssertionHelpers;

  private cleanupFns: Array<() => void> = [];

  constructor(options?: TestContextOptions) {
    this.userId = options?.userId || `test-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.storage = new LocalStorageMockAdapter(options?.storageMode || 'local_mock');
    this.llm = new MockLLMStreamProvider({ speed: options?.llmSpeed || 'instant' });
    this.events = new EventBusSpy(this.userId);
    this.journey = new JourneyHelpers(this);
    this.assert = new AssertionHelpers(this);
  }

  public async init(presetId?: string): Promise<void> {
    const unsub = this.events.startListening();
    this.cleanupFns.push(unsub);
    if (presetId) {
      await this.storage.resetToPreset(presetId, this.userId);
    }
  }

  public async cleanup(): Promise<void> {
    for (const fn of this.cleanupFns) {
      try {
        fn();
      } catch {}
    }
    this.cleanupFns = [];
    this.events.clear();
    this.storage.clear();
  }
}
