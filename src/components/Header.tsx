'use client';

import React, { useState } from 'react';
import { Sparkles, Database, Layers, CloudCheck, UserPlus, Info } from 'lucide-react';
import { ALL_PRESETS } from '@/data/presets';

interface HeaderProps {
  currentRoleId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenCustomModal: () => void;
  isLiveFirestore: boolean;
}

export function Header({ currentRoleId, onSelectPreset, onOpenCustomModal, isLiveFirestore }: HeaderProps) {
  const [showConfigInfo, setShowConfigInfo] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">SkillBridge AI</h1>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Agentic 2.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Autonomous Adaptive Upskilling & Career Roadmapping</p>
          </div>
        </div>

        {/* 1-Click Preset Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-lg bg-muted p-1 border border-border">
            {ALL_PRESETS.map(p => {
              const active = currentRoleId === p.roleId;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPreset(p.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                    active
                      ? 'bg-card text-foreground shadow-sm border border-border-active'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={p.subtitle}
                >
                  {p.title}
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:border-cyan-500/50 hover:text-cyan-400 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Custom Learner</span>
          </button>

          {/* Dual-Mode Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowConfigInfo(!showConfigInfo)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isLiveFirestore ? 'Live Firestore' : 'Dual-Mode Active'}</span>
              <Info className="h-3 w-3 ml-0.5 opacity-70" />
            </button>

            {showConfigInfo && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl p-3.5 shadow-xl text-xs space-y-2 z-50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-cyan-400" />
                  Dual-Mode Persistence Architecture
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The application is running with <strong className="text-foreground">zero-config offline fallback</strong>. All profiles, roadmaps, and quiz evaluations persist in real-time.
                </p>
                <div className="p-2 rounded bg-muted/60 text-[11px] text-muted-foreground font-mono">
                  cp .env.example .env.local
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supplying Firebase or Gemini credentials connects to Google Cloud instantly without restarts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
