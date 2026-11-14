import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext } from '../harness';
import { CurriculumPlannerAgent } from '@/services/agents/curriculum-planner';

describe('Tier 1: Feature 14 - Bi-directional Adaptive Remediation Loop', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-ADAP-01: Downstream Remediation Trigger on Failure (<70%)', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    expect(roadmap).not.toBeNull();

    const targetModuleId = roadmap!.modules[0].id;
    // Score 65% (< 70%)
    const submission = await context.journey.submitAssessment(targetModuleId, 65.0);

    expect(submission.result.passed).toBe(false);
    expect(submission.remedialModuleInserted).toBe(true);

    // Verify remedial module was inserted immediately after failed module
    const remedialMod = context.assert.assertRemedialModuleInserted(
      submission.updatedRoadmap,
      targetModuleId
    );
    expect(remedialMod.isRemedial).toBe(true);
    expect(remedialMod.remedialForModuleId).toBe(targetModuleId);
  });

  it('E2E-T1-ADAP-02: Downstream Loop Bypass on Pass (>=70%)', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // Score 75% (>= 70%)
    const submission = await context.journey.submitAssessment(targetModuleId, 75.0);

    expect(submission.result.passed).toBe(true);
    expect(submission.remedialModuleInserted).toBe(false);

    context.assert.assertNoRemedialModule(submission.updatedRoadmap, targetModuleId);
    context.assert.assertModuleStatus(submission.updatedRoadmap, targetModuleId, 'completed');
  });

  it('E2E-T1-ADAP-03: Amber Badge and Remedial Metadata Marking on Injected Module', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    const submission = await context.journey.submitAssessment(targetModuleId, 50.0);
    const remedialMod = context.assert.assertRemedialModuleInserted(
      submission.updatedRoadmap,
      targetModuleId
    );

    expect(remedialMod.title).toMatch(/Remedial:/i);
    expect(remedialMod.isRemedial).toBe(true);
    expect(remedialMod.estimatedHours).toBeGreaterThan(0);
    expect(remedialMod.quiz).toBeDefined();
  });

  it('E2E-T1-ADAP-04: Dynamic Roadmap Recalculation on Career Goal Pivot', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const pivot = await context.journey.pivotCareerGoal('aiml-engineer');

    expect(pivot.updatedProfile.targetRoleId).toBe('aiml-engineer');
    expect(pivot.updatedRoadmap.targetRoleId).toBe('aiml-engineer');
    expect(pivot.gapAnalysis.targetRoleName).toBe('AI / ML Engineer');

    // Modules restructured for AI/ML in harness
    const moduleTitles = pivot.updatedRoadmap.modules.map(m => m.title);
    expect(moduleTitles.some(t => t.includes('Machine Learning') || t.includes('Algebra') || t.includes('PyTorch'))).toBe(true);

    // Defect 3 Verification: Verify production CurriculumPlannerAgent synthesizes non-empty skill modules for aiml-engineer & devops-engineer
    const aimlRoadmap = CurriculumPlannerAgent.planRoadmap(pivot.gapAnalysis);
    expect(aimlRoadmap.modules.length).toBeGreaterThan(1); // Not just the single capstone!
    expect(aimlRoadmap.modules.some(m => m.title.includes('Python') || m.title.includes('PyTorch') || m.title.includes('Linear Algebra'))).toBe(true);
    expect(aimlRoadmap.modules[aimlRoadmap.modules.length - 1].title).toContain('AI/ML');

    // Also test DevOps pivot in production engine
    const devopsPivot = await context.journey.pivotCareerGoal('devops-engineer');
    const devopsRoadmap = CurriculumPlannerAgent.planRoadmap(devopsPivot.gapAnalysis);
    expect(devopsRoadmap.modules.length).toBeGreaterThan(1);
    expect(devopsRoadmap.modules.some(m => m.title.includes('Docker') || m.title.includes('Kubernetes') || m.title.includes('CI/CD'))).toBe(true);
    expect(devopsRoadmap.modules[devopsRoadmap.modules.length - 1].title).toContain('DevOps');
  });

  it('E2E-T1-ADAP-05: Remedial Module Re-Test Passing Clears Remediation Flag', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const roadmap = await context.storage.getRoadmap(context.userId);
    const targetModuleId = roadmap!.modules[0].id;

    // Step 1: Fail initial quiz -> inserts remedial module
    const failOutcome = await context.journey.submitAssessment(targetModuleId, 55.0);
    expect(failOutcome.remedialModuleInserted).toBe(true);

    const remedialModuleId = `${targetModuleId}-remedial`;

    // Step 2: Pass remedial quiz with 85%
    const passOutcome = await context.journey.submitAssessment(remedialModuleId, 85.0);
    expect(passOutcome.result.passed).toBe(true);

    const remedialInRoadmap = passOutcome.updatedRoadmap.modules.find(m => m.id === remedialModuleId);
    expect(remedialInRoadmap?.status).toBe('remediated_and_passed');

    // Next core module unlocked
    const secondModule = passOutcome.updatedRoadmap.modules.find(m => m.order === 2);
    if (secondModule) {
      expect(secondModule.status).toBe('in_progress');
    }
  });
});
