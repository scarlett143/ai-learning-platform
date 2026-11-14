'use client';

import React, { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
const getServerSnapshot = (): Theme => 'dark';

/** Toggles light/dark. The initial value is set before paint by the inline script in layout.tsx. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: the theme still applies for this session */
    }
    listeners.forEach(cb => cb());
  };

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="h-9 w-9 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
