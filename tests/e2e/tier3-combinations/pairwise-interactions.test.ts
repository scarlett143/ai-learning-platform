import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TestHarness,
  TestContext,
  LocalStorageMockAdapter,
  SkillAnalyzerService,
  CurriculumPlannerService,
  AssessmentEvaluatorService,
  PRESET_FULL_STACK,
} from '../harness';

describe('Tier 3: Cross-Feature Combinations (Pairwise Interactions - 10 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T3-XFT-01: Target Role Pivot + Active Remedial State', async () => {
    // F14 (Adaptive Loop) + F4 (Profile) + F10 (Curriculum Planner)
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // Trigger remedial module via 55% failure
    const failOutcome = await context.journey.submitAssessment(targetModuleId, 55.0);
    expect(failOutcome.remedialModuleInserted).toBe(true);

    // Pivot career goal to AI/ML Engineer
    const pivotOutcome = await context.journey.pivotCareerGoal('aiml-engineer');

    expect(pivotOutcome.updatedProfile.targetRoleId).toBe('aiml-engineer');
    expect(pivotOutcome.updatedRoadmap.targetRoleId).toBe('aiml-engineer');

    // Web remedial module replaced with AI/ML curriculum
    const hasAiModules = pivotOutcome.updatedRoadmap.modules.some(
      m => m.title.includes('Algebra') || m.title.includes('PyTorch')
    );
    expect(hasAiModules).toBe(true);
    context.events.assertEmitted('goal:pivoted');
  });

  it('E2E-T3-XFT-02: Live Feed Event Emission During Streaming Chat', async () => {
    // F12 (AI Mentor) + F13 (Live Feed / Event Bus) + F8 (LLM Engine)
    await context.journey.applyPreset('fullstack-dev');

    const chatTokens: string[] = [];
    const chatPromise = context.journey.askMentor('Explain closures in JavaScript');

    // Concurrently trigger skill analysis which records events
    const gapReport = await context.journey.performGapAnalysis();
    expect(gapReport).toBeDefined();

    const chatResponse = await chatPromise;
    expect(chatResponse.fullText).toContain('closure');

    // Both chat resolved and background feed event recorded cleanly
    context.events.assertEmitted('agent:skill-analysis:completed');
  });

  it('E2E-T3-XFT-03: Preset Switch During Active Assessment Evaluation', async () => {
    // F7 (Presets) + F11 (Assessment Evaluator) + F6 (Dual-Mode Storage)
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);

    // Partial assessment in progress, then user clicks DevOps preset
    await context.journey.applyPreset('devops-engineer');

    const currentProfile = await context.storage.getProfile(context.userId);
    const currentRoadmap = await context.storage.getRoadmap(context.userId);

    expect(currentProfile?.targetRoleId).toBe('devops-engineer');
    expect(currentRoadmap?.targetRoleId).toBe('devops-engineer');
    expect(currentRoadmap?.modules[0].title).toContain('Docker');
  });

  it('E2E-T3-XFT-04: Storage Fallback on Simulated Network Disconnect', async () => {
    // F6 (Dual-Mode Storage) + F16 (Zero-Config Resilience) + F13 (Live Feed)
    const storage = new LocalStorageMockAdapter('firestore');
    expect(storage.getMode()).toBe('firestore');
    expect(storage.isLiveConnected()).toBe(true);

    // Simulate network disconnect during write
    storage.setSimulateDisconnectError(true);
    await storage.saveProfile({
      id: context.userId,
      name: 'Network Resilient Learner',
      targetRoleId: 'fullstack-dev',
      skills: [],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-fallback to local_mock
    expect(storage.getMode()).toBe('local_mock');
    expect(storage.isLiveConnected()).toBe(false);

    const retrieved = await storage.getProfile(context.userId);
    expect(retrieved?.name).toBe('Network Resilient Learner');
  });

  it('E2E-T3-XFT-05: Dynamic Roadmap Recalculation + Dual Storage Sync', async () => {
    // F10 (Curriculum Planner) + F6 (Storage) + F5 (Gap Analysis)
    await context.journey.applyPreset('aiml-engineer');
    const gapReport = await context.journey.performGapAnalysis();
    const generatedRoadmap = await context.journey.generateRoadmap(gapReport);

    const storedRoadmap = await context.storage.getRoadmap(context.userId);
    expect(storedRoadmap).not.toBeNull();
    expect(storedRoadmap?.modules.length).toBe(generatedRoadmap.modules.length);
    expect(storedRoadmap?.totalHours).toBe(generatedRoadmap.totalHours);
  });

  it('E2E-T3-XFT-06: Multi-Agent Sequential Pipeline + Live Feed Broadcast', async () => {
    // F9 (Skill Analyzer) + F10 (Curriculum Planner) + F11 (Assessment Evaluator) + F13 (Live Feed)
    const profile = await context.journey.applyPreset('fullstack-dev');

    // Agent 1: Skill Analyzer
    const gapReport = SkillAnalyzerService.analyzeGaps(profile);
    // Agent 2: Curriculum Planner
    const roadmap = CurriculumPlannerService.generateRoadmap(profile, gapReport);
    // Agent 3: Assessment Evaluator
    const assessmentResult = AssessmentEvaluatorService.gradeSubmission({
      userId: profile.id,
      moduleId: roadmap.modules[0].id,
      score: 85,
    });

    expect(assessmentResult.passed).toBe(true);

    // Assert sequence across Event Bus
    context.events.assertSequence([
      'agent:skill-analysis:started',
      'agent:skill-analysis:completed',
      'agent:curriculum:started',
      'agent:curriculum:generated',
      'agent:assessment:evaluated',
    ]);
  });

  it('E2E-T3-XFT-07: Preset Selection + Profile Mutation + Storage Verification', async () => {
    // F7 (Presets) + F4 (Profile) + F6 (Storage)
    const initial = await context.journey.applyPreset('fullstack-dev');
    initial.skills.push({ id: 's-extra', name: 'Docker', proficiency: 'intermediate' });
    await context.storage.saveProfile(initial);

    const reloaded = await context.storage.getProfile(context.userId);
    expect(reloaded?.skills.some(s => s.name === 'Docker')).toBe(true);

    // Preset fixture itself was not mutated
    expect(PRESET_FULL_STACK.skills.some(s => s.name === 'Docker')).toBe(false);
  });

  it('E2E-T3-XFT-08: Remedial Module Injection + Assessment Re-evaluation', async () => {
    // F14 (Adaptive Loop) + F11 (Assessment Evaluator) + F10 (Curriculum Planner)
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // Fail quiz -> injects remedial module
    const failOutcome = await context.journey.submitAssessment(targetModuleId, 50.0);
    expect(failOutcome.remedialModuleInserted).toBe(true);

    const remedialModuleId = `${targetModuleId}-remedial`;

    // Pass remedial module with 90%
    const passOutcome = await context.journey.submitAssessment(remedialModuleId, 90.0);
    expect(passOutcome.result.passed).toBe(true);

    const remedialModule = passOutcome.updatedRoadmap.modules.find(m => m.id === remedialModuleId);
    expect(remedialModule?.status).toBe('remediated_and_passed');
  });

  it('E2E-T3-XFT-09: Mock LLM Fallback + Zero-Config App Boot', async () => {
    // F16 (Zero-Config Resilience) + F8 (LLM Engine) + F12 (AI Mentor) + F15 (Split UI)
    expect(context.llm.getProviderName()).toBe('mock');
    expect(context.storage.getMode()).toBe('local_mock');

    const mentorResponse = await context.journey.askMentor('Explain closures');
    expect(mentorResponse.tokens.length).toBeGreaterThan(1);
    expect(mentorResponse.fullText).toContain('closure');
  });

  it('E2E-T3-XFT-10: Assessment Failure (<70%) + Adaptive Remediation + Live Feed Notification', async () => {
    // F11 (Assessment) + F14 (Adaptive Loop) + F13 (Live Feed) + F15 (Split UI)
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    const outcome = await context.journey.submitAssessment(targetModuleId, 55.0);

    expect(outcome.result.passed).toBe(false);
    expect(outcome.remedialModuleInserted).toBe(true);

    context.events.assertEmitted('remediation:triggered');
    context.events.assertEmitted('agent:assessment:evaluated');
  });
});
