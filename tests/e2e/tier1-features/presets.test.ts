import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, PRESET_FULL_STACK, PRESET_AI_ML, PRESET_DEVOPS } from '../harness';

describe('Tier 1: Feature 7 - 1-Click Presets Fixtures', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  it('E2E-T1-PRES-01: Canonical Full Stack Developer Preset Structure', async () => {
    await context.journey.applyPreset('fullstack-dev');
    const profile = await context.storage.getProfile(context.userId);

    expect(profile).not.toBeNull();
    expect(profile?.targetRoleId).toBe('fullstack-dev');

    const skillNames = profile?.skills.map(s => s.name);
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('SQL');
    expect(skillNames).toContain('HTML');
  });

  it('E2E-T1-PRES-02: AI / ML Engineer Preset Structure', async () => {
    await context.journey.applyPreset('aiml-engineer');
    const profile = await context.storage.getProfile(context.userId);

    expect(profile).not.toBeNull();
    expect(profile?.targetRoleId).toBe('aiml-engineer');

    const skillNames = profile?.skills.map(s => s.name);
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('Linear Algebra');
    expect(skillNames).toContain('Pandas');
  });

  it('E2E-T1-PRES-03: DevOps Engineer Preset Structure', async () => {
    await context.journey.applyPreset('devops-engineer');
    const profile = await context.storage.getProfile(context.userId);

    expect(profile).not.toBeNull();
    expect(profile?.targetRoleId).toBe('devops-engineer');

    const skillNames = profile?.skills.map(s => s.name);
    expect(skillNames).toContain('Linux');
    expect(skillNames).toContain('Bash');
    expect(skillNames).toContain('Git');
  });

  it('E2E-T1-PRES-04: Preset Reset Invocation (resetToPreset)', async () => {
    // Modify profile with custom skills
    const custom = await context.journey.applyPreset('fullstack-dev');
    custom.skills.push({ id: 'custom-skill', name: 'Rust', proficiency: 'advanced' });
    await context.storage.saveProfile(custom);

    const modified = await context.storage.getProfile(context.userId);
    expect(modified?.skills.some(s => s.name === 'Rust')).toBe(true);

    // Reset back to canonical preset
    await context.storage.resetToPreset('fullstack-dev', context.userId);
    const reset = await context.storage.getProfile(context.userId);

    expect(reset?.skills.some(s => s.name === 'Rust')).toBe(false);
    expect(reset?.skills.map(s => s.name)).toContain('Python');
  });

  it('E2E-T1-PRES-05: Preset Fixture Immutability', async () => {
    // Verify preset templates cannot be polluted by mutating return values
    const originalCount = PRESET_FULL_STACK.skills.length;

    await context.journey.applyPreset('fullstack-dev');
    const profile = await context.storage.getProfile(context.userId);
    profile!.skills.pop();

    expect(PRESET_FULL_STACK.skills.length).toBe(originalCount);
    expect(PRESET_FULL_STACK.skills.map(s => s.name)).toContain('HTML');
  });
});
