'use client';

import React, { useState } from 'react';
import { Database, UserPlus, Info } from 'lucide-react';
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
        {/* Brand */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" role="img" aria-label="SkillBridge logo">
            <rect width="32" height="32" rx="7" fill="#d6c9a3" />
            <path d="M5 21h22M8 21c0-6 3.5-9 8-9s8 3 8 9M16 12V8" fill="none" stroke="#0e0f0d" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground leading-tight">SkillBridge</h1>
            <p className="text-xs text-muted-foreground">Skill-gap analysis and adaptive learning paths</p>
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
                  aria-pressed={active}
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
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-card hover:border-accent-500/50 hover:text-accent-400 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Custom Learner</span>
          </button>

          {/* Dual-Mode Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowConfigInfo(!showConfigInfo)}
              aria-expanded={showConfigInfo}
              className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLiveFirestore ? 'bg-emerald-400' : 'bg-accent-500'}`} />
              <span>{isLiveFirestore ? 'Storage: Firestore' : 'Storage: this browser'}</span>
              <Info className="h-3 w-3 opacity-70" />
            </button>

            {showConfigInfo && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl p-3.5 shadow-xl text-xs space-y-2 z-50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-accent-400" />
                  Where your data is stored
                </div>
                <p className="text-muted-foreground leading-relaxed">Without Firebase credentials, profiles, roadmaps and quiz results are saved in this browser only. Add credentials in <span className="font-mono text-foreground">.env.local</span> to sync them to Firestore.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
