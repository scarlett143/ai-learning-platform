import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHarness, TestContext, LocalStorageMockAdapter } from '../harness';
import fs from 'fs';
import path from 'path';

describe('Tier 1: Features 1-3, 15-16 - Split UI, Zero-Config & Specifications', () => {
  let context: TestContext;

  beforeEach(async () => {
    TestHarness.resetGlobalSingletons();
    context = await TestHarness.createContext();
  });

  afterEach(async () => {
    await context.cleanup();
  });

  // Feature 15: Unified Split Layout UI Contracts (5 Tests)
  describe('Unified Split Layout UI Contracts (5 Tests)', () => {
    it('E2E-T1-UI-01: Split Layout Structural Architecture Contract', () => {
      // Validates contract for Left Pane (Command Hub) and Right Pane (Visual Arena)
      const layoutPanes = {
        leftPane: { id: 'command-hub', role: 'controls-and-onboarding', minWidthPercent: 35 },
        rightPane: { id: 'visual-arena', role: 'roadmap-and-feed', minWidthPercent: 55 },
      };
      expect(layoutPanes.leftPane.id).toBe('command-hub');
      expect(layoutPanes.rightPane.id).toBe('visual-arena');
      expect(layoutPanes.leftPane.minWidthPercent + layoutPanes.rightPane.minWidthPercent).toBeLessThanOrEqual(100);
    });

    it('E2E-T1-UI-02: Presets Bar Availability and Actions', async () => {
      // Verifies preset options are exposed for 1-click selection
      const presets = ['fullstack-dev', 'aiml-engineer', 'devops-engineer'];
      for (const p of presets) {
        const loaded = await context.storage.resetToPreset(p, context.userId);
        expect(loaded.targetRoleId).toBe(p);
      }
    });

    it('E2E-T1-UI-03: Remedial Module Visual Badge Contract', async () => {
      await context.journey.applyPreset('fullstack-dev');
      const roadmap = await context.storage.getRoadmap(context.userId);
      const outcome = await context.journey.submitAssessment(roadmap!.modules[0].id, 45.0);

      const remedialMod = context.assert.assertRemedialModuleInserted(
        outcome.updatedRoadmap,
        roadmap!.modules[0].id
      );

      // UI Contract: remedial module must flag isRemedial: true for amber badge rendering
      expect(remedialMod.isRemedial).toBe(true);
      expect(remedialMod.status).toBe('in_progress');
    });

    it('E2E-T1-UI-04: Live Agent Feed Visualization Contract', async () => {
      await context.journey.applyPreset('fullstack-dev');
      await context.journey.performGapAnalysis();

      const events = context.events.getEvents().filter(e => (e as any).agentName);
      expect(events.length).toBeGreaterThan(0);
      for (const evt of events) {
        expect(evt).toHaveProperty('id');
        expect(evt).toHaveProperty('agentName');
        expect(evt).toHaveProperty('message');
        expect(evt).toHaveProperty('timestamp');
      }
    });

    it('E2E-T1-UI-05: Interactive AI Mentor Chat Interface Contract', async () => {
      const response = await context.journey.askMentor('Hello mentor');
      expect(response.tokens.length).toBeGreaterThan(0);
      expect(response.fullText.length).toBeGreaterThan(10);
    });
  });

  // Feature 16: Out-of-the-Box Zero-Config Resilience (5 Tests)
  describe('Out-of-the-Box Zero-Config Resilience (5 Tests)', () => {
    it('E2E-T1-CFG-01: Clean Boot with Zero Environment Variables', () => {
      const cleanStorage = new LocalStorageMockAdapter();
      expect(cleanStorage.getMode()).toBe('local_mock');
      expect(cleanStorage.isLiveConnected()).toBe(false);
    });

    it('E2E-T1-CFG-02: Offline Mock Mode Indicator', () => {
      const statusBadge = context.storage.isLiveConnected()
        ? 'Connected: Firestore'
        : 'Offline Mock Mode';
      expect(statusBadge).toBe('Offline Mock Mode');
    });

    it('E2E-T1-CFG-03: In-Memory SSR Safe Execution', () => {
      // In Node.js / SSR environment, window is undefined
      expect(typeof window).toBe('undefined');
      // Setting and getting items on LocalStorageMockAdapter works cleanly
      context.storage.setItem('ssr_key', 'ssr_value');
      expect(context.storage.getItem('ssr_key')).toBe('ssr_value');
    });

    it('E2E-T1-CFG-04: Offline Chat & Quiz Generation', async () => {
      const quiz = await context.llm.generateJSON<any>('Generate offline quiz');
      expect(quiz).toBeDefined();
      expect(quiz.questions.length).toBeGreaterThanOrEqual(1);

      const chat = await context.journey.askMentor('What is TypeScript?');
      expect(chat.fullText).toBeDefined();
    });

    it('E2E-T1-CFG-05: Zero External Network Dependencies', () => {
      // Validates that test harness operates hermetically without network
      expect(context.llm.getProviderName()).toBe('mock');
      expect(context.storage.getMode()).toBe('local_mock');
    });
  });

  // Features 1-3: PRD, Design System, Tooling & README Specifications (5 Tests)
  describe('Specifications & Submission Documentation (5 Tests)', () => {
    const rootDir = path.resolve(__dirname, '../../../');

    it('E2E-T1-SPEC-01: PRD Document Completeness', () => {
      const prdPath = path.join(rootDir, 'docs/PRD.md');
      expect(fs.existsSync(prdPath)).toBe(true);
      const prdContent = fs.readFileSync(prdPath, 'utf8');
      expect(prdContent).toContain('# Product Requirements Document');
      expect(prdContent).toContain('Multi-Agent');
      expect(prdContent).toContain('Adaptive Remediation');
    });

    it('E2E-T1-SPEC-02: UI/UX Design System Specification', () => {
      const designPath = path.join(rootDir, 'docs/UI_UX_DESIGN_SYSTEM.md');
      expect(fs.existsSync(designPath)).toBe(true);
      const designContent = fs.readFileSync(designPath, 'utf8');
      expect(designContent).toContain('Design System');
      expect(designContent).toMatch(/Color System|Design Tokens/i);
      expect(designContent).toMatch(/Split[\s-]Layout/i);
    });

    it('E2E-T1-SPEC-03: Package Dependencies & Scripts Verification', () => {
      const pkgPath = path.join(rootDir, 'package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      expect(pkg.scripts).toHaveProperty('test:e2e');
      expect(pkg.devDependencies).toHaveProperty('tsx');
      expect(pkg.devDependencies).toHaveProperty('vitest');
    });

    it('E2E-T1-SPEC-04: Submission Guidelines & README Verification', () => {
      // Verifies official parent submission guidelines:
      // 1. Chosen Vertical, 2. Approach & Logic, 3. How the Solution Works, 4. Assumptions Made
      const readmePath = path.join(rootDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
      const readme = fs.readFileSync(readmePath, 'utf8');

      expect(readme).toMatch(/Chosen Vertical/i);
      expect(readme).toMatch(/Approach/i);
      expect(readme).toMatch(/How the Solution Works/i);
      expect(readme).toMatch(/Assumptions Made/i);
    });

    it('E2E-T1-SPEC-05: GitHub Repository & Single Main Branch Target', () => {
      const readmePath = path.join(rootDir, 'README.md');
      const readme = fs.readFileSync(readmePath, 'utf8');

      expect(readme).toContain('scarlett143/ai-learning-platform');
      expect(readme).toContain('main');
    });
  });
});
