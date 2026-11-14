'use client';

import React from 'react';
import { Activity, ShieldCheck, Cpu, GitBranch, Terminal } from 'lucide-react';
import { AgentFeedEvent, AgentRoleName } from '@/types';

interface AgentActivityFeedProps {
  events: AgentFeedEvent[];
}

const AGENT_BADGES: Record<AgentRoleName, { bg: string; text: string; border: string }> = {
  'Skill Analyzer': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Curriculum Planner': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Assessment Evaluator': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'AI Mentor': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

export function AgentActivityFeed({ events }: AgentActivityFeedProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col h-[320px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Live Agent Collaboration Feed
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live Event Bus
        </span>
      </div>

      {/* Events Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1 text-xs">
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground italic py-8">
            Listening for multi-agent events on the message bus...
          </div>
        ) : (
          events.map(evt => {
            const style = AGENT_BADGES[evt.agentName] || {
              bg: 'bg-muted',
              text: 'text-muted-foreground',
              border: 'border-border',
            };

            const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={evt.id}
                className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-1 hover:border-border-active transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {evt.agentName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{timeStr}</span>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed">{evt.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
