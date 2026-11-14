import { AgentFeedEvent } from './types';

export class AgentEventBus {
  private static instance: AgentEventBus;
  private listeners: Map<string, Set<(payload: any) => void | Promise<void>>> = new Map();
  private feedHistory: AgentFeedEvent[] = [];
  private maxHistoryLimit: number = 500;

  private constructor() {}

  public static getInstance(): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus();
    }
    return AgentEventBus.instance;
  }

  public setMaxHistoryLimit(limit: number): void {
    this.maxHistoryLimit = limit;
    if (this.feedHistory.length > this.maxHistoryLimit) {
      this.feedHistory = this.feedHistory.slice(-this.maxHistoryLimit);
    }
  }

  public subscribe<T>(event: string, handler: (payload: T) => void | Promise<void>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event)!;
    handlers.add(handler);

    let unsubscribed = false;
    return () => {
      if (unsubscribed) return; // Idempotent unsubscription
      unsubscribed = true;
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  public async publish<T>(event: string, payload: T): Promise<void> {
    const handlersToInvoke: Array<(payload: any) => void | Promise<void>> = [];

    // Explicit event handlers
    const specific = this.listeners.get(event);
    if (specific) {
      handlersToInvoke.push(...Array.from(specific));
    }

    // Wildcard handlers
    const wildcard = this.listeners.get('*');
    if (wildcard) {
      handlersToInvoke.push(...Array.from(wildcard));
    }

    // Execute handlers with fault isolation
    for (const handler of handlersToInvoke) {
      try {
        await handler(payload);
      } catch (err) {
        console.warn(`[AgentEventBus] Handler threw error for event "${event}":`, err);
      }
    }
  }

  public recordFeedEvent(eventData: Omit<AgentFeedEvent, 'id' | 'timestamp'>): AgentFeedEvent {
    const fullEvent: AgentFeedEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    this.feedHistory.push(fullEvent);
    if (this.feedHistory.length > this.maxHistoryLimit) {
      this.feedHistory.shift(); // Evict oldest
    }

    // Also publish to wildcard and specific event topic
    this.publish(fullEvent.type, fullEvent).catch(() => {});
    return fullEvent;
  }

  public getFeedHistory(): AgentFeedEvent[] {
    return [...this.feedHistory];
  }

  public reset(): void {
    this.listeners.clear();
    this.feedHistory = [];
    this.maxHistoryLimit = 500;
  }
}

export class EventBusSpy {
  private recordedEvents: AgentFeedEvent[] = [];
  private unsubscribe?: () => void;
  private readonly targetUserId?: string;

  constructor(targetUserId?: string) {
    this.targetUserId = targetUserId;
  }

  public startListening(): () => void {
    const bus = AgentEventBus.getInstance();
    this.unsubscribe = bus.subscribe('*', (payload: any) => {
      // Filter by targetUserId if specified
      if (!this.targetUserId || !payload.userId || payload.userId === this.targetUserId) {
        this.recordedEvents.push(payload);
      }
    });
    return () => this.stopListening();
  }

  public stopListening(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  public getEvents(eventType?: string): AgentFeedEvent[] {
    if (!eventType) return [...this.recordedEvents];
    return this.recordedEvents.filter(e => e.type === eventType);
  }

  public async waitForEvent(eventType: string, timeoutMs: number = 2000): Promise<AgentFeedEvent> {
    const existing = this.recordedEvents.find(e => e.type === eventType);
    if (existing) return existing;

    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(() => {
        const found = this.recordedEvents.find(e => e.type === eventType);
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for event "${eventType}" after ${timeoutMs}ms`));
        }
      }, 15);
    });
  }

  public assertEmitted(eventType: string, predicate?: (event: AgentFeedEvent) => boolean): void {
    const matching = this.getEvents(eventType);
    if (matching.length === 0) {
      const types = this.recordedEvents.map(e => e.type).join(', ');
      throw new Error(`Expected event "${eventType}" to be emitted, but found none. Recorded: [${types}]`);
    }
    if (predicate && !matching.some(predicate)) {
      throw new Error(`Event "${eventType}" was emitted but failed custom predicate condition.`);
    }
  }

  public assertEmittedCount(eventType: string, expectedCount: number): void {
    const count = this.getEvents(eventType).length;
    if (count !== expectedCount) {
      throw new Error(`Expected ${expectedCount} occurrences of "${eventType}", but found ${count}`);
    }
  }

  public assertSequence(expectedTypes: string[]): void {
    let lastIndex = -1;
    for (const type of expectedTypes) {
      const idx = this.recordedEvents.findIndex((e, i) => i > lastIndex && e.type === type);
      if (idx === -1) {
        const types = this.recordedEvents.map(e => e.type).join(' -> ');
        throw new Error(
          `Expected event sequence [${expectedTypes.join(' -> ')}] violated. Missing or out-of-order: "${type}". Actual: [${types}]`
        );
      }
      lastIndex = idx;
    }
  }

  public clear(): void {
    this.recordedEvents = [];
  }
}
