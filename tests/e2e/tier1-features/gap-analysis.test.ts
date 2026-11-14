import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, ROLE_BENCHMARKS } from '../harness';

describe('Tier 1: Feature 5 - Role Benchmarks & Gap Analysis', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-GAP-01: Canonical Full Stack Scenario Gap Identification', async () => {
    // Canonical prompt scenario: learner has Python, SQL, HTML targeted to Full Stack Developer
    await context.journey.applyPreset('fullstack-dev');
    const report = await context.journey.performGapAnalysis();

    expect(report.targetRoleId).toBe('fullstack-dev');
    expect(report.targetRoleName).toBe('Full Stack Developer');

    // Asserts missing skills include JavaScript, React, Node.js
    context.assert.assertGapsIdentified(report, ['JavaScript', 'React', 'Node.js']);

    // Existing skills Python, SQL, HTML are strengths/adjacencies
    const strengthNames = report.strengths.map(s => s.name);
    expect(strengthNames).toContain('SQL');
    expect(strengthNames).toContain('HTML');
    expect(strengthNames).toContain('Python');
  });

  it('E2E-T1-GAP-02: Quantitative Readiness Score Calculation', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const report = await context.journey.performGapAnalysis();

    context.assert.assertReadinessScoreBounds(report);
    // Profile satisfies HTML (10) + SQL (10) out of 100 benchmark weight = 20%
    expect(report.readinessScore).toBeGreaterThanOrEqual(15);
    expect(report.readinessScore).toBeLessThanOrEqual(45);
  });

  it('E2E-T1-GAP-03: Depth & Proficiency Gap Detection', async () => {
    // Profile with React at beginner, but Full Stack role requires intermediate
    const profile = await context.storage.resetToPreset('fullstack-dev', context.userId);
    profile.skills.push({ id: 's-react', name: 'React', proficiency: 'beginner', category: 'Frontend' });
    await context.storage.saveProfile(profile);

    const report = await context.journey.performGapAnalysis();
    const reactGap = report.missingSkills.find(s => s.name.toLowerCase() === 'react');

    expect(reactGap).toBeDefined();
    expect(reactGap?.gapType).toBe('depth');
    expect(reactGap?.currentProficiency).toBe('beginner');
    expect(reactGap?.requiredProficiency).toBe('intermediate');
  });

  it('E2E-T1-GAP-04: Taxonomy Category Categorization', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const report = await context.journey.performGapAnalysis();

    const categories = new Set(report.missingSkills.map(s => s.category));
    expect(categories.has('Frontend')).toBe(true);
    expect(categories.has('Backend')).toBe(true);
  });

  it('E2E-T1-GAP-05: Benchmark Registry Role Querying', async () => {
    const roles = Object.keys(ROLE_BENCHMARKS);
    expect(roles).toContain('fullstack-dev');
    expect(roles).toContain('aiml-engineer');
    expect(roles).toContain('devops-engineer');

    for (const roleKey of roles) {
      const benchmark = ROLE_BENCHMARKS[roleKey];
      expect(benchmark.requiredSkills.length).toBeGreaterThanOrEqual(3);
      const totalWeight = benchmark.requiredSkills.reduce((sum, s) => sum + s.weight, 0);
      expect(totalWeight).toBe(100);
    }
  });
});
