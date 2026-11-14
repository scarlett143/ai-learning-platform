'use client';

import React from 'react';
import { UserPlus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ALL_PRESETS } from '@/data/presets';

interface HeaderProps {
  currentRoleId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenCustomModal: () => void;
}

export function Header({ currentRoleId, onSelectPreset, onOpenCustomModal }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" role="img" aria-label="SkillBridge logo">
            <rect width="32" height="32" rx="7" style={{ fill: 'var(--accent-400)' }} />
            <path d="M5 21h22M8 21c0-6 3.5-9 8-9s8 3 8 9M16 12V8" fill="none" style={{ stroke: 'var(--on-accent)' }} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-base font-semibold tracking-tight text-foreground">SkillBridge</span>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          {/* Wide screens: segmented control. Small screens: native select. */}
          <div className="hidden md:flex items-center rounded-md bg-muted p-0.5" role="group" aria-label="Choose a learner profile">
            {ALL_PRESETS.map(p => {
              const active = currentRoleId === p.roleId;
              return (
                <button
                  key={p.id}
                  aria-pressed={active}
                  onClick={() => onSelectPreset(p.id)}
                  title={p.subtitle}
                  className={`text-xs font-medium px-3 py-1.5 rounded whitespace-nowrap ${
                    active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.title}
                </button>
              );
            })}
          </div>

          <label className="md:hidden">
            <span className="sr-only">Choose a learner profile</span>
            <select
              value={ALL_PRESETS.find(p => p.roleId === currentRoleId)?.id ?? ''}
              onChange={e => onSelectPreset(e.target.value)}
              className="bg-muted text-foreground text-xs rounded-md px-2.5 py-2 border border-border max-w-[11rem]"
            >
              {ALL_PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>

          <ThemeToggle />

          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border border-border hover:bg-muted text-foreground whitespace-nowrap"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>New learner</span>
          </button>
        </div>
      </div>
    </header>
  );
}
