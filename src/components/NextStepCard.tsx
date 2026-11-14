'use client';

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Roadmap, RoadmapModule } from '@/types';

interface NextStepCardProps {
  roadmap: Roadmap | null;
  onStart: (module: RoadmapModule) => void;
}

/** Answers "what should I do now?" and shows overall progress. */
export function NextStepCard({ roadmap, onStart }: NextStepCardProps) {
  if (!roadmap || roadmap.modules.length === 0) {
    return <div className="h-24 rounded-lg bg-muted/40 animate-pulse" aria-hidden="true" />;
  }

  const total = roadmap.modules.length;
  const done = roadmap.modules.filter(m => m.status === 'completed').length;
  const next =
    roadmap.modules.find(m => (m.isRemedial || m.isRemediation) && m.status !== 'completed') ??
    roadmap.modules.find(m => m.status === 'in_progress');
  const pct = Math.round((done / total) * 100);

  return (
    <section aria-label="Your next step" className="rounded-lg bg-accent-500/10 border border-accent-500/25 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          {next ? (
            <>
              <p className="text-xs font-medium text-accent-400">
                {next.isRemedial || next.isRemediation ? 'Review needed before you continue' : 'Your next step'}
              </p>
              <h2 className="text-lg font-semibold text-foreground mt-0.5 truncate">{next.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                About {next.estimatedHours} hours. Finish the lessons, then take the short quiz to unlock the next module.
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h2 className="text-lg font-semibold text-foreground">Every module is complete</h2>
            </div>
          )}
        </div>
        {next && (
          <button
            onClick={() => onStart(next)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent-400 hover:bg-accent-300 text-on-accent text-sm font-semibold"
          >
            Take the quiz <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{done} of {total} modules complete</span>
          <span>{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Learning path progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-1.5 rounded-full bg-muted overflow-hidden"
        >
          <div className="h-full bg-accent-400 transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
