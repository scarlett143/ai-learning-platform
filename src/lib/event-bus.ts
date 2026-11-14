import { AgentFeedEvent } from '@/types';

type EventHandler<T = any> = (payload: T) => void | Promise<void>;

/**
 * Singleton In-Memory Event Bus for Real-Time Agent Execution Observability
 */
export class AgentEventBus {
  private static instance: AgentEventBus;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private feedHistory: AgentFeedEvent[] = [];
  private maxHistoryLimit = 200;

  private constructor() {}

  public static getInstance(): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus();
    }
    return AgentEventBus.instance;
  }

  public subscribe<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  public async publish<T = any>(event: string, payload: T): Promise<void> {
    const handlersToInvoke: Array<EventHandler> = [];

    const specific = this.listeners.get(event);
    if (specific) {
      handlersToInvoke.push(...Array.from(specific));
    }

    const wildcard = this.listeners.get('*');
    if (wildcard) {
      handlersToInvoke.push(...Array.from(wildcard));
    }

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

    this.feedHistory.unshift(fullEvent);
    if (this.feedHistory.length > this.maxHistoryLimit) {
      this.feedHistory.pop();
    }

    // Broadcast on bus
    this.publish(fullEvent.type, fullEvent).catch(() => {});
    return fullEvent;
  }

  public getFeedHistory(userId?: string): AgentFeedEvent[] {
    if (!userId) return [...this.feedHistory];
    return this.feedHistory.filter(e => e.userId === userId);
  }

  public reset(): void {
    this.listeners.clear();
    this.feedHistory = [];
  }
}
