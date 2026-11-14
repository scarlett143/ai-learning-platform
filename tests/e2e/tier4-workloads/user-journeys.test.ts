import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TestHarness,
  TestContext,
  LearnerProfile,
} from '../harness';

describe('Tier 4: Real-World Application Scenarios (End-to-End User Journeys - 5 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T4-JOURNEY-01: Canonical Full Stack Developer Journey', async () => {
    // 1. Zero-config boot
    expect(context.storage.getMode()).toBe('local_mock');

    // 2. Load Full Stack Developer preset (Python, SQL, HTML)
    const profile = await context.journey.applyPreset('fullstack-dev');
    expect(profile.targetRoleId).toBe('fullstack-dev');
    expect(profile.skills.map(s => s.name)).toContain('Python');

    // 3. Gap Analysis identifies JavaScript, React, Node.js
    const gapReport = await context.journey.performGapAnalysis();
    context.assert.assertGapsIdentified(gapReport, ['JavaScript', 'React', 'Node.js']);
    context.assert.assertReadinessScoreBounds(gapReport);

    // 4. Curriculum Planner synthesizes sequenced roadmap
    const roadmap = await context.journey.generateRoadmap(gapReport);
    expect(roadmap.modules.length).toBeGreaterThanOrEqual(3);
    const mod1 = roadmap.modules[0];
    expect(mod1.status).toBe('in_progress');

    // 5. Submit Module 1 quiz with 100% score (Pass)
    const submission = await context.journey.submitAssessment(mod1.id, 100.0);
    expect(submission.result.passed).toBe(true);
    expect(submission.result.score).toBe(100.0);
    expect(submission.remedialModuleInserted).toBe(false);

    // Module 1 completed, Module 2 unlocked
    context.assert.assertModuleStatus(submission.updatedRoadmap, mod1.id, 'completed');

    // 6. Consult AI Mentor
    const mentorReply = await context.journey.askMentor('How does React Virtual DOM differ from real DOM?');
    expect(mentorReply.tokens.length).toBeGreaterThan(0);
    expect(mentorReply.fullText.length).toBeGreaterThan(20);

    // 7. Verify all artifacts persisted in storage
    const storedProfile = await context.storage.getProfile(context.userId);
    const storedRoadmap = await context.storage.getRoadmap(context.userId);
    const storedAssessments = await context.storage.getAssessments(context.userId);

    expect(storedProfile).not.toBeNull();
    expect(storedRoadmap).not.toBeNull();
    expect(storedAssessments).toHaveLength(1);
    expect(storedAssessments[0].passed).toBe(true);
  });

  it('E2E-T4-JOURNEY-02: Remedial Recovery Loop Journey', async () => {
    // 1. Load DevOps preset
    await context.journey.applyPreset('devops-engineer');
    const gapReport = await context.journey.performGapAnalysis();
    const roadmap = await context.journey.generateRoadmap(gapReport);

    const mod1 = roadmap.modules[0];
    expect(mod1.status).toBe('in_progress');

    // 2. Learner scores 60% on Module 1 quiz (< 70% passing threshold)
    const failOutcome = await context.journey.submitAssessment(mod1.id, 60.0);
    expect(failOutcome.result.passed).toBe(false);
    expect(failOutcome.remedialModuleInserted).toBe(true);

    // 3. Remedial module injected immediately following Module 1
    const remedialMod = context.assert.assertRemedialModuleInserted(
      failOutcome.updatedRoadmap,
      mod1.id
    );
    expect(remedialMod.isRemedial).toBe(true);
    expect(remedialMod.status).toBe('in_progress');

    // 4. Learner completes remedial exercises and retakes quiz, scoring 85%
    const passOutcome = await context.journey.submitAssessment(remedialMod.id, 85.0);
    expect(passOutcome.result.passed).toBe(true);

    // 5. Remedial module marked passed, original module marked remediated, Module 2 unlocked
    const updatedRemedial = passOutcome.updatedRoadmap.modules.find(m => m.id === remedialMod.id);
    expect(updatedRemedial?.status).toBe('remediated_and_passed');

    const mod2 = passOutcome.updatedRoadmap.modules.find(m => m.order === 2);
    if (mod2) {
      expect(mod2.status).toBe('in_progress');
    }
  });

  it('E2E-T4-JOURNEY-03: Mid-Curriculum Career Pivot Journey', async () => {
    // 1. Learner starts on Full Stack track
    await context.journey.applyPreset('fullstack-dev');
    const fsGap = await context.journey.performGapAnalysis();
    const fsRoadmap = await context.journey.generateRoadmap(fsGap);

    // 2. Learner completes Module 1 with 90%
    const passMod1 = await context.journey.submitAssessment(fsRoadmap.modules[0].id, 90.0);
    expect(passMod1.result.passed).toBe(true);

    // 3. Learner pivots to AI/ML Engineer
    const pivot = await context.journey.pivotCareerGoal('aiml-engineer');
    expect(pivot.updatedProfile.targetRoleId).toBe('aiml-engineer');
    expect(pivot.gapAnalysis.targetRoleName).toBe('AI / ML Engineer');

    // Python recognized as depth gap (intermediate -> advanced), SQL/HTML preserved as strengths
    const pythonGap = pivot.gapAnalysis.missingSkills.find(s => s.name === 'Python');
    expect(pythonGap).toBeDefined();
    expect(pythonGap?.gapType).toBe('depth');
    expect(pythonGap?.currentProficiency).toBe('intermediate');
    expect(pythonGap?.requiredProficiency).toBe('advanced');

    const strengthNames = pivot.gapAnalysis.strengths.map(s => s.name);
    expect(strengthNames).toContain('SQL');
    expect(strengthNames).toContain('HTML');

    // New AI/ML roadmap generated
    const moduleTitles = pivot.updatedRoadmap.modules.map(m => m.title);
    expect(moduleTitles.some(t => t.includes('Algebra') || t.includes('PyTorch'))).toBe(true);

    // 4. AI Mentor gives transition coaching
    const mentorAdvice = await context.journey.askMentor('Should I switch from Full Stack to AI/ML?');
    expect(mentorAdvice.fullText).toContain('Python');
    expect(mentorAdvice.fullText).toContain('AI/ML');
  });

  it('E2E-T4-JOURNEY-04: Zero-Config Offline to Cloud Sync Resilience Journey', async () => {
    // 1. Fresh boot without cloud credentials
    expect(context.storage.getMode()).toBe('local_mock');
    expect(context.storage.isLiveConnected()).toBe(false);

    // 2. User creates custom profile
    const customProfile: LearnerProfile = {
      id: context.userId,
      name: 'Cloud Security Specialist',
      targetRoleId: 'devops-engineer',
      skills: [
        { id: 's1', name: 'Linux', proficiency: 'advanced', category: 'DevOps' },
        { id: 's2', name: 'Networking', proficiency: 'intermediate', category: 'Infrastructure' },
      ],
      certifications: [
        { id: 'c1', name: 'Security+', issuer: 'CompTIA', issueDate: '2025-08-01' },
      ],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await context.storage.saveProfile(customProfile);

    // 3. Generate roadmap and submit quiz in offline mock mode
    const gapReport = await context.journey.performGapAnalysis();
    const roadmap = await context.journey.generateRoadmap(gapReport);
    await context.journey.submitAssessment(roadmap.modules[0].id, 80.0);

    // 4. User configures Firebase credentials -> switch mode to firestore
    context.storage.setMode('firestore', true);
    expect(context.storage.getMode()).toBe('firestore');
    expect(context.storage.isLiveConnected()).toBe(true);

    // 5. Verify local data intact after switching mode
    const syncedProfile = await context.storage.getProfile(context.userId);
    const syncedAssessments = await context.storage.getAssessments(context.userId);

    expect(syncedProfile?.name).toBe('Cloud Security Specialist');
    expect(syncedAssessments).toHaveLength(1);
    expect(syncedAssessments[0].score).toBe(80.0);
  });

  it('E2E-T4-JOURNEY-05: High-Velocity Multi-Agent Collaboration Session', async () => {
    await context.journey.applyPreset('fullstack-dev');

    // 1. Concurrently trigger Skill Analyzer, Curriculum Planner, and AI Mentor
    const gapPromise = context.journey.performGapAnalysis();
    const mentorPromise = context.journey.askMentor('Explain async generator functions in TypeScript');

    const gapReport = await gapPromise;
    const roadmapPromise = context.journey.generateRoadmap(gapReport);

    const [roadmap, mentorReply] = await Promise.all([roadmapPromise, mentorPromise]);

    expect(roadmap.modules.length).toBeGreaterThanOrEqual(3);
    expect(mentorReply.fullText.length).toBeGreaterThan(10);

    // 2. Verify all agents recorded events to EventBus
    context.events.assertEmitted('agent:skill-analysis:started');
    context.events.assertEmitted('agent:skill-analysis:completed');
    context.events.assertEmitted('agent:curriculum:started');
    context.events.assertEmitted('agent:curriculum:generated');

    const feedHistory = context.events.getEvents();
    expect(feedHistory.length).toBeGreaterThanOrEqual(4);
  });
});
