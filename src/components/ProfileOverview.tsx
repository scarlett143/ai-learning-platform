'use client';

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Award, FolderGit2 } from 'lucide-react';
import { LearnerProfile, GapAnalysisReport } from '@/types';

interface ProfileOverviewProps {
  profile: LearnerProfile;
  gapReport: GapAnalysisReport | null;
}

export function ProfileOverview({ profile, gapReport }: ProfileOverviewProps) {
  const readiness = gapReport?.readinessScore ?? 25;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
      {/* Learner Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">{profile.name}</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
              ID: {profile.id.slice(0, 12)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Target className="h-3.5 w-3.5 text-cyan-400" />
            <span>Target Goal:</span>
            <span className="font-semibold text-foreground">{gapReport?.targetRoleName || profile.targetRoleId}</span>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3 bg-muted/50 px-3.5 py-2 rounded-xl border border-border">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Benchmark Readiness</div>
            <div className="text-lg font-black text-foreground">{readiness}%</div>
          </div>
          <div className="w-16 bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                readiness >= 70
                  ? 'bg-emerald-500'
                  : readiness >= 40
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.max(readiness, 5)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Competency Gap Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identified Missing Skills (Gaps) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Identified Skill Gaps ({gapReport?.missingSkills.length || 0})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">Required for target role</span>
          </div>

          <div className="space-y-1.5">
            {gapReport?.missingSkills && gapReport.missingSkills.length > 0 ? (
              gapReport.missingSkills.map((gap, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-foreground">{gap.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {gap.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-amber-400">
                    Needs: {gap.requiredProficiency}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-xs text-muted-foreground italic bg-muted/30 rounded-xl">
                Computing skill gaps with Skill Analyzer Agent...
              </div>
            )}
          </div>
        </div>

        {/* Existing Strengths & Adjacencies */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Existing Strengths ({profile.skills.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">Pre-existing competencies</span>
          </div>

          <div className="space-y-1.5">
            {profile.skills.map(s => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-foreground">{s.name}</span>
                  {s.category && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {s.category}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-emerald-400 capitalize">
                  {s.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications & Projects */}
      {(profile.certifications.length > 0 || profile.projects.length > 0) && (
        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {profile.certifications.map(c => (
            <div key={c.id} className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cert: <strong className="text-foreground">{c.name}</strong> ({c.issuer})</span>
            </div>
          ))}
          {profile.projects.map(p => (
            <div key={p.id} className="flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Project: <strong className="text-foreground">{p.title}</strong></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
