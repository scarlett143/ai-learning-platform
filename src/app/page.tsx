'use client';

import React, { useState, useEffect } from 'react';
import { NextStepCard } from '@/components/NextStepCard';
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

  // Initialize profile, gap analysis, and roadmap
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

    return () => {
      unsubscribe();
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent-500 selection:text-stone-950">
      <a href="#main" className="skip-link">Skip to main content</a>
      {/* Header */}
      <Header
        currentRoleId={profile.targetRoleId}
        onSelectPreset={handleSelectPreset}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        isLiveFirestore={isLiveFirestore}
      />

      {/* Main Split-Layout Dashboard */}
      <main id="main" className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (60%): Profile Overview + Visual Learning Roadmap */}
        <section className="lg:col-span-7 space-y-6">
          <NextStepCard roadmap={roadmap} onStart={mod => setActiveQuizModule(mod)} />
          <ProfileOverview profile={profile} gapReport={gapReport} />
          <RoadmapView roadmap={roadmap} onTakeAssessment={mod => setActiveQuizModule(mod)} />
        </section>

        {/* Right Column (40%): Live Agent Collaboration Stream + Conversational AI Mentor */}
        <aside className="lg:col-span-5 space-y-6 sticky top-24">
          <AgentActivityFeed events={feedEvents} />
          <AIMentorChat userId={profile.id} onPivotGoal={handleCareerPivot} />
        </aside>
      </main>

      {/* Assessment Modal */}
      <AssessmentModal
        module={activeQuizModule}
        onClose={() => setActiveQuizModule(null)}
        onComplete={handleAssessmentComplete}
        userId={profile.id}
      />

      {/* Custom Learner Onboarding Modal */}
      <CustomOnboardingModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomProfile}
      />
    </div>
  );
}
