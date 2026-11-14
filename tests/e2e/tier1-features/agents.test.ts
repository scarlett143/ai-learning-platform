import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TestHarness,
  TestContext,
  SkillAnalyzerService,
  CurriculumPlannerService,
  AssessmentEvaluatorService,
  normalizeSkillName,
} from '../harness';

describe('Tier 1: Features 9-12 - Specialized Collaborating AI Agents', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  // Agent 1: Skill Analyzer
  describe('Skill Analyzer Agent (5 Tests)', () => {
    it('E2E-T1-AG1-01: Comprehensive Skill Analysis Pipeline', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const report = await context.journey.performGapAnalysis();

      expect(report).toBeDefined();
      expect(report.missingSkills.length).toBeGreaterThan(0);
      expect(report.strengths.length).toBeGreaterThan(0);
      expect(report.readinessScore).toBeGreaterThanOrEqual(0);
      expect(report.readinessScore).toBeLessThanOrEqual(100);
    });

    it('E2E-T1-AG1-02: Agent Event Bus Lifecycle Emissions', async () => {
      await context.journey.applyPreset('fullstack-dev');
      await context.journey.performGapAnalysis();

      context.events.assertEmitted('agent:skill-analysis:started');
      context.events.assertEmitted('agent:skill-analysis:completed');
      context.events.assertSequence(['agent:skill-analysis:started', 'agent:skill-analysis:completed']);
    });

    it('E2E-T1-AG1-03: Readiness Score Bounds and Scale', async () => {
      // 0% readiness profile (no skills)
      const emptyProfile = await context.storage.resetToPreset('fullstack-dev', context.userId);
      emptyProfile.skills = [];
      const reportEmpty = SkillAnalyzerService.analyzeGaps(emptyProfile);
      expect(reportEmpty.readinessScore).toBe(0);

      // 100% readiness profile (all skills matched at max level)
      const perfectProfile = await context.storage.resetToPreset('fullstack-dev', context.userId);
      perfectProfile.skills = [
        { id: '1', name: 'JavaScript', proficiency: 'advanced' },
        { id: '2', name: 'React', proficiency: 'advanced' },
        { id: '3', name: 'Node.js', proficiency: 'advanced' },
        { id: '4', name: 'SQL', proficiency: 'advanced' },
        { id: '5', name: 'HTML', proficiency: 'advanced' },
      ];
      const reportPerfect = SkillAnalyzerService.analyzeGaps(perfectProfile);
      expect(reportPerfect.readinessScore).toBe(100);
    });

    it('E2E-T1-AG1-04: Prioritized Learning Recommendations', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const report = await context.journey.performGapAnalysis();

      expect(report.recommendations.length).toBeGreaterThanOrEqual(report.missingSkills.length);
      expect(report.recommendations[0]).toContain('Focus on');
    });

    it('E2E-T1-AG1-05: Canonical Normalization of Skill Aliases', () => {
      expect(normalizeSkillName('JS')).toBe('JavaScript');
      expect(normalizeSkillName('react.js')).toBe('React');
      expect(normalizeSkillName('nodejs')).toBe('Node.js');
      expect(normalizeSkillName('PostgreSQL')).toBe('SQL');
      expect(normalizeSkillName('k8s')).toBe('Kubernetes');
    });
  });

  // Agent 2: Curriculum Planner
  describe('Curriculum Planner Agent (5 Tests)', () => {
    it('E2E-T1-AG2-01: Personalized Roadmap Generation', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      const roadmap = await context.journey.generateRoadmap(gapReport);

      expect(roadmap).toBeDefined();
      expect(roadmap.modules.length).toBe(gapReport.missingSkills.length);
      expect(roadmap.modules[0].status).toBe('in_progress');
      expect(roadmap.modules[1].status).toBe('locked');
    });

    it('E2E-T1-AG2-02: Module Content Structure & Schema Integrity', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      const roadmap = await context.journey.generateRoadmap(gapReport);

      const mod = roadmap.modules[0];
      expect(mod.id).toBeDefined();
      expect(mod.title).toBeDefined();
      expect(mod.description).toBeDefined();
      expect(mod.lessons.length).toBeGreaterThan(0);
      expect(mod.codeSnippets.length).toBeGreaterThan(0);
      expect(mod.exercises.length).toBeGreaterThan(0);
      expect(mod.quiz).toBeDefined();
      expect(mod.estimatedHours).toBeGreaterThan(0);
    });

    it('E2E-T1-AG2-03: Curriculum Event Bus Notifications', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      await context.journey.generateRoadmap(gapReport);

      context.events.assertEmitted('agent:curriculum:started');
      context.events.assertEmitted('agent:curriculum:generated');
      context.events.assertSequence(['agent:curriculum:started', 'agent:curriculum:generated']);
    });

    it('E2E-T1-AG2-04: Remedial Module Injection Capability', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      const roadmap = await context.journey.generateRoadmap(gapReport);

      const failedModule = roadmap.modules[0];
      const remedialMod = CurriculumPlannerService.createRemedialModule(failedModule, ['Closures & Scoping']);

      expect(remedialMod.isRemedial).toBe(true);
      expect(remedialMod.remedialForModuleId).toBe(failedModule.id);
      expect(remedialMod.title).toContain('Remedial:');
      expect(remedialMod.description).toContain('Closures & Scoping');
    });

    it('E2E-T1-AG2-05: Total Estimated Duration Computation', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      const roadmap = await context.journey.generateRoadmap(gapReport);

      context.assert.assertTotalDuration(roadmap);
    });
  });

  // Agent 3: Assessment Evaluator
  describe('Assessment Evaluator Agent (5 Tests)', () => {
    it('E2E-T1-AG3-01: Dynamic Quiz Question Synthesis', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const gapReport = await context.journey.performGapAnalysis();
      const roadmap = await context.journey.generateRoadmap(gapReport);

      const quiz = roadmap.modules[0].quiz;
      expect(quiz).toBeDefined();
      expect(quiz?.questions.length).toBeGreaterThan(0);
      expect(quiz?.questions[0].options.length).toBe(4);
    });

    it('E2E-T1-AG3-02: Scoring Engine Accuracy', () => {
      const result = AssessmentEvaluatorService.gradeSubmission({
        userId: context.userId,
        moduleId: 'mod-test',
        score: 80.0,
      });

      expect(result.score).toBe(80.0);
      expect(result.passed).toBe(true);
      expect(result.status).toBe('passed');
    });

    it('E2E-T1-AG3-03: 70% Passing Threshold Enforcement', () => {
      const failing = AssessmentEvaluatorService.gradeSubmission({
        userId: context.userId,
        moduleId: 'mod-test',
        score: 60.0,
      });
      expect(failing.passed).toBe(false);
      expect(failing.status).toBe('failed');

      const passing = AssessmentEvaluatorService.gradeSubmission({
        userId: context.userId,
        moduleId: 'mod-test',
        score: 70.0,
      });
      expect(passing.passed).toBe(true);
      expect(passing.status).toBe('passed');
    });

    it('E2E-T1-AG3-04: Missed Concept Diagnostics', () => {
      const failing = AssessmentEvaluatorService.gradeSubmission({
        userId: context.userId,
        moduleId: 'mod-test',
        score: 55.0,
      });

      expect(failing.missedConcepts.length).toBeGreaterThan(0);
      expect(failing.feedback).toContain('below the 70% threshold');
    });

    it('E2E-T1-AG3-05: Assessment Result Recording & Event Bus Emission', async () => {
      AssessmentEvaluatorService.gradeSubmission({
        userId: context.userId,
        moduleId: 'mod-test-evt',
        score: 85.0,
      });

      context.events.assertEmitted('agent:assessment:evaluated', e => (e as any).score === 85.0 || (e as any).metadata?.score === 85.0);
    });
  });

  // Agent 4: AI Mentor
  describe('AI Mentor Agent (5 Tests)', () => {
    it('E2E-T1-AG4-01: Streaming Conversational Guidance', async () => {
      const response = await context.journey.askMentor('Explain closures');
      expect(response.tokens.length).toBeGreaterThan(1);
      expect(response.fullText).toContain('closure');
    });

    it('E2E-T1-AG4-02: Socratic Debugging Demeanor', async () => {
      const response = await context.journey.askMentor('Give me the code to solve this bug');
      expect(response.fullText.toLowerCase()).toContain('step-by-step');
    });

    it('E2E-T1-AG4-03: Learner Context Ingestion', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const response = await context.journey.askMentor('What should I study next for my role?');
      expect(response.fullText).toBeDefined();
      expect(response.fullText.length).toBeGreaterThan(20);
    });

    it('E2E-T1-AG4-04: Career Pivot Advisory', async () => {
      const response = await context.journey.askMentor('Should I switch from Full Stack to AI/ML?');
      expect(response.fullText).toContain('Python');
      expect(response.fullText).toContain('Linear Algebra');
    });

    it('E2E-T1-AG4-05: Conversation History Retention', async () => {
      // First turn
      await context.storage.appendAgentMessage({
        id: 'msg-1',
        userId: context.userId,
        sender: 'user',
        content: 'I want to focus on Node.js',
        timestamp: new Date().toISOString(),
      });

      // Second turn
      await context.storage.appendAgentMessage({
        id: 'msg-2',
        userId: context.userId,
        sender: 'mentor',
        content: 'Great! Let us start with async event loops.',
        timestamp: new Date().toISOString(),
      });

      const feed = await context.storage.getAgentFeed(context.userId);
      expect(feed).toHaveLength(2);
      expect(feed[0].sender).toBe('user');
      expect(feed[1].sender).toBe('mentor');
    });
  });
});
