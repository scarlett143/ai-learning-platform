'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  PlayCircle,
  Lock,
  AlertTriangle,
  Code2,
  BookOpen,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Roadmap, RoadmapModule } from '@/types';

interface RoadmapViewProps {
  roadmap: Roadmap | null;
  onTakeAssessment: (module: RoadmapModule) => void;
}

export function RoadmapView({ roadmap, onTakeAssessment }: RoadmapViewProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
  });

  if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-3">
        <Sparkles className="h-8 w-8 text-accent-400 mx-auto" />
        <h3 className="text-sm font-semibold text-foreground">Building your learning path</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Matching modules to the skills you still need...
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <span>Your learning path</span>
            <span className="text-xs font-normal text-muted-foreground">({roadmap.modules.length} modules)</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Goal: <strong className="text-foreground">{roadmap.targetRoleName}</strong>
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Path adjusts automatically when a quiz score drops below 70%
        </div>
      </div>

      {/* Sequential Roadmap Modules */}
      <div className="space-y-3 relative before:absolute before:left-5 before:top-6 before:bottom-6 before:w-0.5 before:bg-border">
        {roadmap.modules.map((mod, index) => {
          const isExpanded = expandedModules[mod.id] ?? false;
          const isRemedial = mod.isRemedial;
          const isInProgress = mod.status === 'in_progress';
          const isCompleted = mod.status === 'completed';
          const isLocked = mod.status === 'locked';

          return (
            <div
              key={mod.id}
              className={`relative ml-10 rounded-2xl border transition-all duration-300 ${
                isRemedial
                  ? 'border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5'
                  : isInProgress
                  ? 'border-accent-500/40 bg-card shadow-md shadow-accent-500/5'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-card'
                  : 'border-border bg-card/60 opacity-80'
              }`}
            >
              {/* Timeline Node Indicator on Left Line */}
              <div
                className={`absolute -left-10 top-5 -translate-x-1/2 h-7 w-7 rounded-full flex items-center justify-center border-2 bg-card ${
                  isRemedial
                    ? 'border-amber-400 text-amber-400'
                    : isInProgress
                    ? 'border-accent-400 text-accent-400 shadow-sm shadow-accent-400/50'
                    : isCompleted
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : isRemedial ? (
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                ) : isInProgress ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Module Header Bar */}
              <div className="p-4 flex items-start justify-between gap-3 cursor-pointer" onClick={() => toggleExpand(mod.id)}>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">M{index + 1}</span>
                    <h3 className="text-sm font-bold text-foreground">{mod.title}</h3>

                    {/* Status & Remedial Badges */}
                    {isRemedial ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Review module added
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
                        Up next
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{mod.estimatedHours}h est.</span>
                  <button aria-label={isExpanded ? "Collapse module details" : "Expand module details"} aria-expanded={isExpanded} className="text-muted-foreground hover:text-foreground p-1">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Module Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-border/50 text-xs">
                  {/* Lessons List */}
                  <div className="space-y-1.5">
                    <div className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Lessons
                    </div>
                    <div className="grid grid-cols-1 gap-1 pl-5">
                      {mod.lessons.map(l => (
                        <div key={l.id} className="flex items-center justify-between text-muted-foreground py-0.5">
                          <span>• {l.title}</span>
                          <span className="font-mono text-[11px] opacity-70">{l.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Code Snippets */}
                  {mod.codeSnippets && mod.codeSnippets.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-muted-foreground flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-accent-400" />
                        Example code
                      </div>
                      <div className="bg-stone-950 border border-border rounded-xl p-3 font-mono text-[11px] text-stone-200 overflow-x-auto">
                        <pre>{mod.codeSnippets[0].code}</pre>
                      </div>
                    </div>
                  )}

                  {/* Practical Exercises */}
                  {mod.exercises && mod.exercises.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-1">
                      <span className="font-semibold text-foreground">Practice exercise</span>
                      <p className="text-muted-foreground">{mod.exercises[0].prompt}</p>
                      {mod.exercises[0].solutionHint && (
                        <p className="text-[11px] text-amber-400 italic mt-1">Hint: {mod.exercises[0].solutionHint}</p>
                      )}
                    </div>
                  )}

                  {/* Assessment Action Button */}
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => onTakeAssessment(mod)}
                      disabled={isLocked}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition shadow-sm ${
                        isInProgress || isRemedial
                          ? 'bg-accent-400 hover:bg-accent-300 text-stone-950 shadow-accent-500/20'
                          : isCompleted
                          ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      <span>{isCompleted ? 'Retake the quiz' : 'Take the quiz'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
