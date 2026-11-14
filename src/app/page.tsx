'use client';

import React, { useState, useEffect } from 'react';
import { Overview } from '@/components/Overview';
import { Header } from '@/components/Header';
import { ProfileOverview } from '@/components/ProfileOverview';
import { RoadmapView } from '@/components/RoadmapView';
import { AgentActivityFeed } from '@/components/AgentActivityFeed';
import { AIMentorChat } from '@/components/AIMentorChat';
import { AssessmentModal } from '@/components/AssessmentModal';
import { CustomOnboardingModal } from '@/components/CustomOnboardingModal';

import { LearnerProfile, Roadmap, RoadmapModule, GapAnalysisReport, AgentFeedEvent, AssessmentResult } from '@/types';
import { PRESET_FULL_STACK_CANDIDATE } from '@/data/presets';
import { SkillAnalyzerAgent } from '@/services/agents/skill-analyzer';
import { CurriculumPlannerAgent } from '@/services/agents/curriculum-planner';
import { AdaptiveRemediationEngine } from '@/services/adaptive-loop';
import { AgentEventBus } from '@/lib/event-bus';
import { StorageService } from '@/services/storage';

export default function Home() {
  const [profile, setProfile] = useState<LearnerProfile>(PRESET_FULL_STACK_CANDIDATE);
  const [gapReport, setGapReport] = useState<GapAnalysisReport | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [feedEvents, setFeedEvents] = useState<AgentFeedEvent[]>([]);
  const [activeQuizModule, setActiveQuizModule] = useState<RoadmapModule | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLiveFirestore, setIsLiveFirestore] = useState(false);
  const [activeTab, setActiveTab] = useState<'path' | 'skills' | 'activity'>('path');

  // Initialize derived state and subscribe to the agent event bus once on mount.
  // The initial profile is a constant preset, so the missing `profile` dependency is intentional.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- one-time mount initialization */
  useEffect(() => {
    const storage = StorageService.getInstance();
    setIsLiveFirestore(storage.isLiveConnected());

    const report = SkillAnalyzerAgent.analyze(profile);
    setGapReport(report);

    const generatedRoadmap = CurriculumPlannerAgent.planRoadmap(report);
    setRoadmap(generatedRoadmap);

    // Subscribe to Event Bus
    const bus = AgentEventBus.getInstance();
    setFeedEvents(bus.getFeedHistory(profile.id));

    const unsubscribe = bus.subscribe('*', (evt: AgentFeedEvent) => {
      setFeedEvents(prev => [evt, ...prev.slice(0, 50)]);
    });

    // Restore saved progress (Firestore mode): profile + roadmap come back after a reload.
    let cancelled = false;
    if (storage.getMode() === 'firestore') {
      (async () => {
        try {
          const [savedProfile, savedRoadmap] = await Promise.all([
            storage.getProfile(profile.id),
            storage.getRoadmap(profile.id),
          ]);
          if (cancelled) return;
          if (savedProfile) {
            setProfile(savedProfile);
            setGapReport(SkillAnalyzerAgent.analyze(savedProfile));
          } else {
            await storage.saveProfile(profile);
          }
          if (savedRoadmap) setRoadmap(savedRoadmap);
        } catch (err) {
          console.warn('[Home] Could not restore saved progress:', err);
        }
      })();
    }

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  // Handle Preset Switching
  const handleSelectPreset = async (presetId: string) => {
    const storage = StorageService.getInstance();
    const newProfile = await storage.resetToPreset(presetId, profile.id);
    setProfile(newProfile);

    const report = SkillAnalyzerAgent.analyze(newProfile);
    setGapReport(report);

    const newRoadmap = CurriculumPlannerAgent.planRoadmap(report);
    setRoadmap(newRoadmap);
    storage.saveRoadmap(newRoadmap);
  };

  // Handle Custom Profile Creation
  const handleCustomProfile = async (newProfile: LearnerProfile) => {
    setProfile(newProfile);
    const storage = StorageService.getInstance();
    await storage.saveProfile(newProfile);

    const report = SkillAnalyzerAgent.analyze(newProfile);
    setGapReport(report);

    const newRoadmap = CurriculumPlannerAgent.planRoadmap(report);
    setRoadmap(newRoadmap);
    storage.saveRoadmap(newRoadmap);
  };

  // Handle Assessment Completion (Evaluator Agent -> Adaptive Remediation Loop)
  const handleAssessmentComplete = (result: AssessmentResult) => {
    if (!roadmap) return;

    const storage = StorageService.getInstance();
    storage.saveAssessmentResult(result);

    // Run Adaptive Remediation Engine
    const updatedRoadmap = AdaptiveRemediationEngine.triggerAssessmentRemediation(roadmap, result);
    setRoadmap(updatedRoadmap);
    storage.saveRoadmap(updatedRoadmap);
  };

  // Handle Career Pivot (AI Mentor trigger)
  const handleCareerPivot = (newRoleId: string) => {
    const { updatedProfile, newRoadmap } = AdaptiveRemediationEngine.triggerCareerPivot(profile, newRoleId);
    setProfile(updatedProfile);
    setRoadmap(newRoadmap);

    const report = SkillAnalyzerAgent.analyze(updatedProfile);
    setGapReport(report);

    const storage = StorageService.getInstance();
    storage.saveProfile(updatedProfile);
    storage.saveRoadmap(newRoadmap);
  };

  const mentorContext = [
    `Learner: ${profile.name}`,
    `Goal: ${gapReport?.targetRoleName ?? profile.targetRoleId}`,
    `Readiness: ${gapReport?.readinessScore ?? 0}%`,
    `Skills to learn: ${(gapReport?.missingSkills ?? []).map(g => g.name).slice(0, 8).join(', ') || 'none'}`,
    `Skills known: ${profile.skills.map(s => s.name).slice(0, 8).join(', ')}`,
    `Current module: ${roadmap?.modules.find(m => m.status === 'in_progress')?.title ?? 'none'}`,
  ].join('\n');

  const tabs = [
    { id: 'path', label: 'Learning path' },
    { id: 'skills', label: 'Skills' },
    { id: 'activity', label: `Agent activity${feedEvents.length ? ` (${feedEvents.length})` : ''}` },
  ] as const;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans selection:bg-accent-500 selection:text-on-accent">
      <a href="#main" className="skip-link">Skip to main content</a>
      <Header
        currentRoleId={profile.targetRoleId}
        onSelectPreset={handleSelectPreset}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        <Overview profile={profile} gapReport={gapReport} roadmap={roadmap} onStart={mod => setActiveQuizModule(mod)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-8 space-y-5 min-w-0">
            <div role="tablist" aria-label="Dashboard sections" className="flex gap-1 border-b border-border">
              {tabs.map(t => (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={activeTab === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3.5 py-2.5 text-sm font-medium -mb-px border-b-2 ${
                    activeTab === t.id
                      ? 'border-accent-400 text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              {activeTab === 'path' && <RoadmapView roadmap={roadmap} onTakeAssessment={mod => setActiveQuizModule(mod)} />}
              {activeTab === 'skills' && <ProfileOverview profile={profile} gapReport={gapReport} />}
              {activeTab === 'activity' && <AgentActivityFeed events={feedEvents} />}
            </div>
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-24" aria-label="AI mentor">
            <AIMentorChat userId={profile.id} context={mentorContext} onPivotGoal={handleCareerPivot} />
          </aside>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            {isLiveFirestore
              ? 'Your progress is synced to Firestore.'
              : 'Your progress is saved in this browser only. Add Firebase credentials to sync it.'}
          </span>
          <span>SkillBridge adaptive learning</span>
        </div>
      </footer>

      <AssessmentModal
        module={activeQuizModule}
        onClose={() => setActiveQuizModule(null)}
        onComplete={handleAssessmentComplete}
        userId={profile.id}
      />

      <CustomOnboardingModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomProfile}
      />
    </div>
  );
}
