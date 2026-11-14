import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TestHarness,
  TestContext,
  SkillAnalyzerService,
  normalizeRoleId,
  RoleBenchmark,
  LearnerProfile,
} from '../harness';

describe('Tier 2: Boundary Domain 2 - Profile & Skill Extremes (10 Tests)', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T2-BND-06: Blank Learner Profile Boundary', async () => {
    const blank: LearnerProfile = {
      id: context.userId,
      name: 'Blank Learner',
      targetRoleId: 'fullstack-dev',
      skills: [],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await context.storage.saveProfile(blank);

    const report = await context.journey.performGapAnalysis();
    expect(report.readinessScore).toBe(0);
    expect(report.missingSkills.length).toBe(5);
    expect(report.strengths.length).toBe(0);
  });

  it('E2E-T2-BND-07: Extremely Large Profile with 100+ Skills', async () => {
    const largeSkills = Array.from({ length: 120 }, (_, i) => ({
      id: `skill-${i}`,
      name: `Specialty Skill ${i}`,
      proficiency: (i % 3 === 0 ? 'advanced' : i % 2 === 0 ? 'intermediate' : 'beginner') as any,
      category: 'General',
    }));

    const largeProfile: LearnerProfile = {
      id: context.userId,
      name: 'Massive Skills Learner',
      targetRoleId: 'fullstack-dev',
      skills: largeSkills,
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const start = Date.now();
    await context.storage.saveProfile(largeProfile);
    const report = SkillAnalyzerService.analyzeGaps(largeProfile);
    const duration = Date.now() - start;

    expect(report).toBeDefined();
    expect(duration).toBeLessThan(1000); // Sub-second performance
    expect(report.strengths.length).toBe(120);
  });

  it('E2E-T2-BND-08: Unknown / Unregistered Target Career Role ID', async () => {
    const custom: LearnerProfile = {
      id: context.userId,
      name: 'Unknown Role Learner',
      targetRoleId: 'quantum-blockchain-architect-2099',
      skills: [],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await context.storage.saveProfile(custom);

    // Gracefully falls back to default role benchmark without throwing unhandled exception
    const report = await context.journey.performGapAnalysis();
    expect(report).toBeDefined();
    expect(report.targetRoleId).toBeDefined();
  });

  it('E2E-T2-BND-09: Special Characters & HTML Injections in Profile', async () => {
    const xssProfile: LearnerProfile = {
      id: context.userId,
      name: '<script>alert("xss")</script> & "Tester" 🚀',
      targetRoleId: 'fullstack-dev',
      skills: [
        { id: 's1', name: 'C++', proficiency: 'intermediate' },
        { id: 's2', name: 'C#', proficiency: 'intermediate' },
        { id: 's3', name: '.NET Core', proficiency: 'intermediate' },
      ],
      certifications: [],
      projects: [
        {
          id: 'p1',
          title: '<b>Project Bold</b>',
          description: '<svg onload="alert(1)">',
          techStack: ['C++', 'C#'],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await context.storage.saveProfile(xssProfile);
    const retrieved = await context.storage.getProfile(context.userId);

    expect(retrieved?.name).toBe('<script>alert("xss")</script> & "Tester" 🚀');
    expect(retrieved?.skills[0].name).toBe('C++');
  });

  it('E2E-T2-BND-10: Duplicate Skill Entries Normalization', async () => {
    const duplicateProfile: LearnerProfile = {
      id: context.userId,
      name: 'Dupe Learner',
      targetRoleId: 'fullstack-dev',
      skills: [
        { id: '1', name: 'React', proficiency: 'beginner' },
        { id: '2', name: 'react', proficiency: 'intermediate' },
        { id: '3', name: 'REACT.JS', proficiency: 'advanced' },
      ],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = SkillAnalyzerService.analyzeGaps(duplicateProfile);
    // React is recognized and deduplicated; highest or latest proficiency credited
    const reactGap = report.missingSkills.find(s => s.name === 'React');
    expect(reactGap).toBeUndefined(); // Advanced React satisfies intermediate requirement
  });

  it('E2E-T2-BND-11: 100% Skill Overlap (Mastery)', () => {
    const master: LearnerProfile = {
      id: 'master-user',
      name: 'Master Engineer',
      targetRoleId: 'devops-engineer',
      skills: [
        { id: '1', name: 'Linux', proficiency: 'advanced' },
        { id: '2', name: 'Bash', proficiency: 'advanced' },
        { id: '3', name: 'Docker', proficiency: 'advanced' },
        { id: '4', name: 'Kubernetes', proficiency: 'advanced' },
        { id: '5', name: 'Git', proficiency: 'advanced' },
      ],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = SkillAnalyzerService.analyzeGaps(master);
    expect(report.readinessScore).toBe(100);
    expect(report.missingSkills.length).toBe(0);
  });

  it('E2E-T2-BND-12: 0% Skill Overlap (Completely Disjoint Domain)', () => {
    const graphicDesigner: LearnerProfile = {
      id: 'designer-user',
      name: 'Graphic Designer',
      targetRoleId: 'devops-engineer',
      skills: [
        { id: '1', name: 'Figma', proficiency: 'advanced', category: 'Design' },
        { id: '2', name: 'Photoshop', proficiency: 'advanced', category: 'Design' },
        { id: '3', name: 'Typography', proficiency: 'intermediate', category: 'Design' },
      ],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = SkillAnalyzerService.analyzeGaps(graphicDesigner);
    expect(report.readinessScore).toBe(0);
    expect(report.missingSkills.length).toBe(5);
    expect(report.strengths.length).toBe(3); // Preserved as non-matching strengths
  });

  it('E2E-T2-BND-13: Empty Benchmark Requirements Safe Handling', () => {
    const emptyBenchmark: RoleBenchmark = {
      id: 'empty-benchmark',
      roleName: 'Empty Role',
      description: 'Role with no required competencies',
      requiredSkills: [],
    };

    const profile: LearnerProfile = {
      id: 'test-user',
      name: 'Tester',
      targetRoleId: 'empty-benchmark',
      skills: [{ id: '1', name: 'Python', proficiency: 'intermediate' }],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const report = SkillAnalyzerService.analyzeGaps(profile, emptyBenchmark);
    expect(report.readinessScore).toBe(100);
    expect(report.missingSkills).toHaveLength(0);
  });

  it('E2E-T2-BND-14: Case-Insensitive Role ID Normalization', () => {
    expect(normalizeRoleId('FULLSTACK-DEV')).toBe('fullstack-dev');
    expect(normalizeRoleId('FullStack_Dev')).toBe('fullstack-dev');
    expect(normalizeRoleId('AIML_ENGINEER')).toBe('aiml-engineer');
    expect(normalizeRoleId('DevOps_Engineer')).toBe('devops-engineer');
  });

  it('E2E-T2-BND-15: Boundary String Lengths in Profile', async () => {
    const longName = 'A'.repeat(500);
    const longDescription = 'B'.repeat(10000);

    const boundaryProfile: LearnerProfile = {
      id: context.userId,
      name: longName,
      targetRoleId: 'fullstack-dev',
      skills: [],
      certifications: [],
      projects: [
        {
          id: 'p1',
          title: 'Heavy Project',
          description: longDescription,
          techStack: ['Python'],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await context.storage.saveProfile(boundaryProfile);
    const retrieved = await context.storage.getProfile(context.userId);

    expect(retrieved?.name.length).toBe(500);
    expect(retrieved?.projects[0].description.length).toBe(10000);
  });
});
