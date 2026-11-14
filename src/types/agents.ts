/**
 * Multi-Agent System Contracts & Event Feed Models
 * Matching PRD Section 7.3 and PROJECT.md § Interface Contracts
 */

export type AgentId =
  | 'skill-analyzer'
  | 'curriculum-planner'
  | 'assessment-evaluator'
  | 'ai-mentor'
  | 'system';

export type EventType =
  | 'thought'
  | 'action'
  | 'handoff'
  | 'evaluation'
  | 'remediation_trigger'
  | 'roadmap_update'
  | 'message';

export type AgentRoleName =
  | 'Skill Analyzer'
  | 'Curriculum Planner'
  | 'Assessment Evaluator'
  | 'AI Mentor';

export interface AgentFeedEvent {
  id: string;
  timestamp: string | number;
  userId?: string;
  agentId?: AgentId;
  agentName: AgentRoleName;
  agentColor?: string;
  type: EventType | string;
  title?: string;
  summary?: string;
  details?: string;
  message?: string; // Backwards compatibility
  metadata?: Record<string, unknown>;
  payload?: unknown; // Backwards compatibility
  status?: 'pending' | 'success' | 'warning' | 'error';
}

export type AgentStatus = 'idle' | 'thinking' | 'acting' | 'waiting' | 'error';

export interface AgentAction {
  id: string;
  agentId: AgentId;
  actionType: string;
  payload: unknown;
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  userId: string;
  role?: 'user' | 'assistant' | 'system';
  sender?: 'user' | 'mentor' | 'system'; // Backwards compatibility
  agentName?: AgentRoleName | string;
  content: string;
  timestamp: string | number;
}
