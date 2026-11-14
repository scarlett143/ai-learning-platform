import { TestContext } from './context';
import { TestContextOptions } from './types';
import { AgentEventBus } from './event-bus-harness';

export class TestHarness {
  public static async createContext(options?: TestContextOptions): Promise<TestContext> {
    const context = new TestContext(options);
    await context.init(options?.presetId);
    return context;
  }

  public static resetGlobalSingletons(): void {
    const bus = AgentEventBus.getInstance();
    bus.reset();
  }
}
