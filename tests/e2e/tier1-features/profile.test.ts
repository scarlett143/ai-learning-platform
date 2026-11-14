import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, LearnerProfile } from '../harness';

describe('Tier 1: Feature 4 - Learner Profile Model', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-PROF-01: Minimal Profile Creation & Persistence', async () => {
    const minimalProfile: LearnerProfile = {
      id: context.userId,
      name: 'Alice Learner',
      targetRoleId: 'fullstack-dev',
      skills: [],
      certifications: [],
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await context.storage.saveProfile(minimalProfile);
    const retrieved = await context.storage.getProfile(context.userId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(context.userId);
    expect(retrieved?.name).toBe('Alice Learner');
    expect(retrieved?.targetRoleId).toBe('fullstack-dev');
    expect(retrieved?.skills).toHaveLength(0);
  });

  it('E2E-T1-PROF-02: Full Profile Schema with Skills & Experience', async () => {
    const fullProfile: LearnerProfile = {
      id: context.userId,
      name: 'Bob FullStack',
      targetRoleId: 'fullstack-dev',
      skills: [
        { id: 's1', name: 'Python', proficiency: 'intermediate', category: 'Backend', verified: true },
        { id: 's2', name: 'SQL', proficiency: 'advanced', category: 'Database', verified: true },
        { id: 's3', name: 'HTML', proficiency: 'beginner', category: 'Frontend', verified: false },
      ],
      certifications: [
        { id: 'c1', name: 'Certified Python Developer', issuer: 'Python Institute', issueDate: '2025-05-10' },
      ],
      projects: [
        {
          id: 'p1',
          title: 'Full Stack CRM',
          description: 'A customer relationship management tool built with Python & SQL.',
          techStack: ['Python', 'SQL', 'HTML'],
          url: 'https://github.com/test/crm',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await context.storage.saveProfile(fullProfile);
    const retrieved = await context.storage.getProfile(context.userId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.skills).toHaveLength(3);
    expect(retrieved?.skills[0].name).toBe('Python');
    expect(retrieved?.skills[0].proficiency).toBe('intermediate');
    expect(retrieved?.certifications).toHaveLength(1);
    expect(retrieved?.certifications[0].issuer).toBe('Python Institute');
    expect(retrieved?.projects).toHaveLength(1);
    expect(retrieved?.projects[0].techStack).toContain('SQL');
  });

  it('E2E-T1-PROF-03: Target Career Goal Modification', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const initial = await context.storage.getProfile(context.userId);
    expect(initial?.targetRoleId).toBe('fullstack-dev');

    const pivotOutcome = await context.journey.pivotCareerGoal('aiml-engineer');

    expect(pivotOutcome.updatedProfile.targetRoleId).toBe('aiml-engineer');
    const persisted = await context.storage.getProfile(context.userId);
    expect(persisted?.targetRoleId).toBe('aiml-engineer');
  });

  it('E2E-T1-PROF-04: Skill List Mutations (Add, Modify, Remove)', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const profile = await context.storage.getProfile(context.userId);
    expect(profile).not.toBeNull();

    // Add TypeScript
    profile!.skills.push({ id: 's4', name: 'TypeScript', proficiency: 'intermediate', category: 'Frontend' });
    // Modify HTML to advanced
    const htmlSkill = profile!.skills.find(s => s.name === 'HTML');
    if (htmlSkill) htmlSkill.proficiency = 'advanced';
    // Remove SQL
    profile!.skills = profile!.skills.filter(s => s.name !== 'SQL');

    await context.storage.saveProfile(profile!);
    const updated = await context.storage.getProfile(context.userId);

    expect(updated?.skills.some(s => s.name === 'TypeScript')).toBe(true);
    expect(updated?.skills.find(s => s.name === 'HTML')?.proficiency).toBe('advanced');
    expect(updated?.skills.some(s => s.name === 'SQL')).toBe(false);
  });

  it('E2E-T1-PROF-05: Profile Serialization Round-Trip Integrity', async () => {
    await context.journey.applyPreset('devops-engineer');
    const original = await context.storage.getProfile(context.userId);
    expect(original).not.toBeNull();

    const jsonString = JSON.stringify(original);
    const parsed = JSON.parse(jsonString);

    expect(parsed).toEqual(original);
  });
});
