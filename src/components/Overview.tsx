'use client';

import React from 'react';
import { LearnerProfile, GapAnalysisReport, Roadmap, RoadmapModule } from '@/types';
import { NextStepCard } from './NextStepCard';

interface OverviewProps {
  profile: LearnerProfile;
  gapReport: GapAnalysisReport | null;
  roadmap: Roadmap | null;
  onStart: (module: RoadmapModule) => void;
}

function readinessLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: 'Ready to apply', color: 'var(--ok)' };
  if (score >= 40) return { text: 'Building momentum', color: 'var(--warn)' };
  return { text: 'Early stage', color: 'var(--accent-400)' };
}

/** Top band: who the learner is, how close they are to the goal, and what to do next. */
export function Overview({ profile, gapReport, roadmap, onStart }: OverviewProps) {
  const readiness = gapReport?.readinessScore ?? 0;
  const { text, color } = readinessLabel(readiness);
  const firstName = profile.name.split(' ')[0];
  const gaps = gapReport?.missingSkills.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Hi {firstName}, here is your path
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-[60ch]">
            Goal: <span className="text-foreground font-medium">{gapReport?.targetRoleName || profile.targetRoleId}</span>.{' '}
            {gaps > 0 ? `${gaps} skills to learn, ${profile.skills.length} you already have.` : 'No skill gaps found.'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0" role="group" aria-label={`Role readiness ${readiness} percent, ${text}`}>
          <div
            className="relative h-20 w-20 rounded-full grid place-items-center"
            style={{ background: `conic-gradient(${color} ${Math.max(readiness, 2) * 3.6}deg, var(--muted) 0)` }}
            aria-hidden="true"
          >
            <div className="h-[62px] w-[62px] rounded-full bg-background grid place-items-center">
              <span className="text-xl font-semibold text-foreground">{readiness}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Role readiness</div>
            <div className="text-sm font-medium" style={{ color }}>{text}</div>
          </div>
        </div>
      </div>

      <NextStepCard roadmap={roadmap} onStart={onStart} />
    </div>
  );
}
