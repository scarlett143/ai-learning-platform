import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, AssessmentEvaluatorService } from '../harness';

describe('Tier 2: Boundary Domain 1 - Assessment Scoring Thresholds (5 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T2-BND-01: Strict 69.9% and 69.999% vs 70.0% Boundary Condition', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // 69.9% score strictly fails (< 70.0%) and triggers remediation
    const result69 = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: targetModuleId,
      score: 69.9,
    });
    expect(result69.score).toBe(69.9);
    expect(result69.passed).toBe(false);
    expect(result69.status).toBe('failed');

    const outcome69 = await context.journey.submitAssessment(targetModuleId, 69.9);
    expect(outcome69.remedialModuleInserted).toBe(true);

    // Clean reset for 69.999% boundary precision test (Defect 1 verification)
    await context.storage.resetToPreset('fullstack-dev', context.userId);
    const result69999 = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: targetModuleId,
      score: 69.999,
    });
    expect(result69999.score).toBe(69.999);
    expect(result69999.passed).toBe(false);
    expect(result69999.status).toBe('failed');

    const outcome69999 = await context.journey.submitAssessment(targetModuleId, 69.999);
    expect(outcome69999.remedialModuleInserted).toBe(true);
    expect(outcome69999.result.passed).toBe(false);
    expect(outcome69999.updatedRoadmap.modules[0].status).toBe('failed');
    // Ensure progression is locked: next module remains locked
    expect(outcome69999.updatedRoadmap.modules[2].status).toBe('locked');

    // Clean reset for 70.0% test
    await context.storage.resetToPreset('fullstack-dev', context.userId);
    const result70 = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: targetModuleId,
      score: 70.0,
    });
    expect(result70.score).toBe(70.0);
    expect(result70.passed).toBe(true);
    expect(result70.status).toBe('passed');

    const outcome70 = await context.journey.submitAssessment(targetModuleId, 70.0);
    expect(outcome70.remedialModuleInserted).toBe(false);
  });

  it('E2E-T2-BND-02: Absolute Zero Score (0%) Boundary', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    const outcome0 = await context.journey.submitAssessment(targetModuleId, 0.0);
    expect(outcome0.result.score).toBe(0.0);
    expect(outcome0.result.passed).toBe(false);
    expect(outcome0.remedialModuleInserted).toBe(true);

    const remedial = context.assert.assertRemedialModuleInserted(
      outcome0.updatedRoadmap,
      targetModuleId
    );
    expect(remedial.isRemedial).toBe(true);
  });

  it('E2E-T2-BND-03: Perfect Score (100%) Mastery Boundary', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    const outcome100 = await context.journey.submitAssessment(targetModuleId, 100.0);
    expect(outcome100.result.score).toBe(100.0);
    expect(outcome100.result.passed).toBe(true);
    expect(outcome100.remedialModuleInserted).toBe(false);

    context.assert.assertModuleStatus(outcome100.updatedRoadmap, targetModuleId, 'completed');
  });

  it('E2E-T2-BND-04: Negative and Overflow Score Normalization', () => {
    // Scores below 0 clamp to 0
    const negative = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: 'mod-neg',
      score: -25.5,
    });
    expect(negative.score).toBe(0);
    expect(negative.passed).toBe(false);

    // Scores above 100 clamp to 100
    const overflow = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: 'mod-over',
      score: 145.0,
    });
    expect(overflow.score).toBe(100);
    expect(overflow.passed).toBe(true);
  });

  it('E2E-T2-BND-05: Single Question Quiz Boundary (0% vs 100%)', () => {
    const wrong = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: 'mod-single-q',
      score: 0,
    });
    expect(wrong.passed).toBe(false);

    const correct = AssessmentEvaluatorService.gradeSubmission({
      userId: context.userId,
      moduleId: 'mod-single-q',
      score: 100,
    });
    expect(correct.passed).toBe(true);
  });
});
