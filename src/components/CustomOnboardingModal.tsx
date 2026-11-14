'use client';

import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { LearnerProfile, ProficiencyLevel } from '@/types';

interface CustomOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profile: LearnerProfile) => void;
}

export function CustomOnboardingModal({ isOpen, onClose, onSubmit }: CustomOnboardingModalProps) {
  const [name, setName] = useState('Jordan Lee');
  const [targetRoleId, setTargetRoleId] = useState('fullstack-dev');
  const [skillsInput, setSkillsInput] = useState('Python, SQL, HTML');
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('intermediate');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsList = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map((skillName, idx) => ({
        id: `custom-s-${idx}`,
        name: skillName,
        proficiency,
        category: 'General',
      }));

    const newProfile: LearnerProfile = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'Custom Learner',
      targetRoleId,
      skills: skillsList,
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newProfile);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" onClick={e => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-accent-400" />
            <h2 id="onboarding-title" className="text-sm font-bold text-foreground">Custom Learner Onboarding</h2>
          </div>
          <button onClick={onClose} aria-label="Close onboarding" className="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="learner-name" className="font-semibold text-foreground">Learner Full Name</label>
            <input
              id="learner-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-md px-3.5 py-2 text-foreground focus:outline-none focus:border-accent-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="learner-target" className="font-semibold text-foreground">Target Career Goal</label>
            <select
              id="learner-target"
              value={targetRoleId}
              onChange={e => setTargetRoleId(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-md px-3.5 py-2 text-foreground focus:outline-none focus:border-accent-500"
            >
              <option value="fullstack-dev">Full Stack Developer</option>
              <option value="aiml-engineer">AI / Machine Learning Engineer</option>
              <option value="devops-engineer">Cloud DevOps & Platform Engineer</option>
              <option value="data-engineer">Data Platform Engineer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="learner-skills" className="font-semibold text-foreground">Current Existing Skills (Comma-separated)</label>
            <input
              id="learner-skills"
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="e.g. Python, SQL, HTML, Docker"
              className="w-full bg-muted/50 border border-border rounded-md px-3.5 py-2 text-foreground focus:outline-none focus:border-accent-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="learner-level" className="font-semibold text-foreground">General Baseline Proficiency</label>
            <select
              id="learner-level"
              value={proficiency}
              onChange={e => setProficiency(e.target.value as ProficiencyLevel)}
              className="w-full bg-muted/50 border border-border rounded-md px-3.5 py-2 text-foreground focus:outline-none focus:border-accent-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-accent-400 hover:bg-accent-300 text-stone-950 font-semibold shadow-sm"
            >
              Initialize Profile & Roadmap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
