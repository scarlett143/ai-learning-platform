import { TestContext } from './context';
import { GapAnalysisReport, Roadmap, RoadmapModule, AssessmentResult } from './types';

export class AssertionHelpers {
  constructor(private context: TestContext) {}

  public assertGapsIdentified(report: GapAnalysisReport, expectedGaps: string[]): void {
    const missingSkillNames = report.missingSkills.map(s => s.name.toLowerCase());
    for (const expected of expectedGaps) {
      if (!missingSkillNames.includes(expected.toLowerCase())) {
        throw new Error(
          `Expected missing skill "${expected}" not found in gap report. Found: [${missingSkillNames.join(', ')}]`
        );
      }
    }
  }

  public assertRemedialModuleInserted(roadmap: Roadmap, failedModuleId: string): RoadmapModule {
    const failedIndex = roadmap.modules.findIndex(m => m.id === failedModuleId);
    if (failedIndex === -1) {
      throw new Error(`Failed module "${failedModuleId}" not found in roadmap modules`);
    }

    const nextModule = roadmap.modules[failedIndex + 1];
    if (!nextModule || !nextModule.isRemedial) {
      throw new Error(
        `Expected remedial module immediately after module "${failedModuleId}", but found: ${nextModule?.title || 'None'}`
      );
    }

    return nextModule;
  }

  public assertNoRemedialModule(roadmap: Roadmap, moduleId: string): void {
    const failedIndex = roadmap.modules.findIndex(m => m.id === moduleId);
    const nextModule = roadmap.modules[failedIndex + 1];
    if (nextModule && nextModule.isRemedial && nextModule.remedialForModuleId === moduleId) {
      throw new Error(`Unexpected remedial module found after module "${moduleId}": ${nextModule.title}`);
    }
  }

  public assertPassingScore(result: AssessmentResult): void {
    if (result.score < 70) {
      throw new Error(`Expected passing score (>=70), but received ${result.score}`);
    }
    if (!result.passed) {
      throw new Error(`Expected result.passed to be true for score ${result.score}`);
    }
    if (result.status !== 'passed') {
      throw new Error(`Expected result.status to be 'passed', but received ${result.status}`);
    }
  }

  public assertFailingScore(result: AssessmentResult): void {
    if (result.score >= 70) {
      throw new Error(`Expected failing score (<70), but received ${result.score}`);
    }
    if (result.passed) {
      throw new Error(`Expected result.passed to be false for score ${result.score}`);
    }
    if (result.status !== 'failed') {
      throw new Error(`Expected result.status to be 'failed', but received ${result.status}`);
    }
  }

  public assertReadinessScoreBounds(report: GapAnalysisReport): void {
    if (typeof report.readinessScore !== 'number' || isNaN(report.readinessScore)) {
      throw new Error(`Readiness score must be a valid number, got ${report.readinessScore}`);
    }
    if (report.readinessScore < 0 || report.readinessScore > 100) {
      throw new Error(`Readiness score ${report.readinessScore} is out of bounds [0, 100]`);
    }
  }

  public assertModuleStatus(
    roadmap: Roadmap,
    moduleId: string,
    expectedStatus: RoadmapModule['status']
  ): void {
    const mod = roadmap.modules.find(m => m.id === moduleId);
    if (!mod) {
      throw new Error(`Module "${moduleId}" not found in roadmap`);
    }
    if (mod.status !== expectedStatus) {
      throw new Error(`Expected module "${moduleId}" status to be "${expectedStatus}", but was "${mod.status}"`);
    }
  }

  public assertTotalDuration(roadmap: Roadmap): void {
    const sum = roadmap.modules.reduce((acc, m) => acc + m.estimatedHours, 0);
    if (roadmap.totalHours !== sum) {
      throw new Error(`Roadmap totalHours (${roadmap.totalHours}) does not equal sum of module hours (${sum})`);
    }
  }
}
