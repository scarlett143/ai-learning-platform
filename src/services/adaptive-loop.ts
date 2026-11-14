import { Roadmap, RoadmapModule, AssessmentResult, LearnerProfile } from '@/types';
import { AgentEventBus } from '@/lib/event-bus';
import { SkillAnalyzerAgent } from '@/services/agents/skill-analyzer';
import { CurriculumPlannerAgent } from '@/services/agents/curriculum-planner';

export class AdaptiveRemediationEngine {
  /**
   * Downstream Trigger: Injects an amber remedial module when assessment score < 70%
   */
  public static triggerAssessmentRemediation(
    currentRoadmap: Roadmap,
    result: AssessmentResult
  ): Roadmap {
    const bus = AgentEventBus.getInstance();

    if (result.passed) {
      // Advance status of current module to completed, and unlock next module
      const updatedModules = currentRoadmap.modules.map((m, idx, arr) => {
        if (m.id === result.moduleId) {
          return { ...m, status: 'completed' as const };
        }
        // Unlock next module if it was locked
        const prevMod = arr[idx - 1];
        if (prevMod && prevMod.id === result.moduleId && m.status === 'locked') {
          return { ...m, status: 'in_progress' as const };
        }
        return m;
      });

      return {
        ...currentRoadmap,
        modules: updatedModules,
      };
    }

    // Assessment failed (< 70%): Insert Remedial Refresher Module
    bus.recordFeedEvent({
      userId: result.userId,
      agentName: 'Curriculum Planner',
      type: 'agent:adaptive:remediation-injected',
      message: `Score ${result.score}% is below 70% threshold. Injecting targeted remedial refresher into roadmap for "${result.moduleTitle}".`,
    });

    const failedIndex = currentRoadmap.modules.findIndex(m => m.id === result.moduleId);
    if (failedIndex === -1) return currentRoadmap;

    const failedModule = currentRoadmap.modules[failedIndex];

    // Defect 2 Fix: Enforce strict recursion cap (max 3 remedial iterations).
    // Case 1: If failedModule is already a remedial module, intensify without creating another nested module
    if (failedModule.isRemedial) {
      const updatedAttempt = Math.min(3, (failedModule.remedialAttemptCount || 1) + 1);
      const updatedModules = currentRoadmap.modules.map(m => {
        if (m.id === failedModule.id) {
          return {
            ...m,
            status: 'failed' as const,
            remedialAttemptCount: updatedAttempt,
            exercises: [
              ...(m.exercises || []),
              {
                id: `rem-drill-${updatedAttempt}`,
                prompt: `Intensified Remedial Drill (Attempt ${updatedAttempt}/3): Re-verify core fundamentals and debug edge cases.`,
                solutionHint: 'Focus on stepping through line-by-line execution logic.',
              },
            ],
          };
        }
        return m;
      });

      bus.recordFeedEvent({
        userId: result.userId,
        agentName: 'Curriculum Planner',
        type: 'agent:adaptive:remediation-intensified',
        message: `Repeated failure on remedial module "${failedModule.title}" (Attempt ${updatedAttempt}/3). Intensifying drills without recursive explosion.`,
        payload: { moduleId: failedModule.id, attempt: updatedAttempt },
      });

      return {
        ...currentRoadmap,
        modules: updatedModules,
      };
    }

    // Case 2: Check if remedial module for this parent already exists in roadmap
    const alreadyHasRemedial = currentRoadmap.modules.some(
      m => m.isRemedial && (m.remedialForSkill === failedModule.title || m.remedialForModuleId === failedModule.id)
    );

    if (alreadyHasRemedial) {
      return currentRoadmap;
    }

    const remedialModule: RoadmapModule = {
      id: `remedial-${failedModule.id}-${Date.now()}`,
      title: `⚡ Remedial Deep-Dive: Core Foundations of ${failedModule.title}`,
      description: `Targeted conceptual reinforcement with step-by-step code breakdowns to solidify understanding before re-testing.`,
      category: failedModule.category,
      status: 'in_progress',
      isRemedial: true,
      remedialForSkill: failedModule.title,
      remedialForModuleId: failedModule.id,
      remedialAttemptCount: 1,
      estimatedHours: 6,
      lessons: [
        { id: 'rem-l1', title: 'Conceptual Pitfalls & Common Anti-Patterns', durationMinutes: 40 },
        { id: 'rem-l2', title: 'Interactive Debugging & Code Walkthrough', durationMinutes: 45 },
      ],
      codeSnippets: [
        {
          language: 'javascript',
          code: '// Remedial Tip: Always verify asynchronous microtask execution order!\nconsole.log("1");\nPromise.resolve().then(() => console.log("2 (microtask)"));\nconsole.log("3");',
        },
      ],
      exercises: [
        {
          id: 'rem-ex1',
          prompt: 'Trace through the execution order of the snippet and explain why microtasks run before macrotasks.',
          solutionHint: 'The microtask queue drains completely at the end of each tick before the next macrotask is dequeued.',
        },
      ],
      order: failedModule.order + 0.5,
    };

    const newModules = [...currentRoadmap.modules];
    // Insert remedial module right after the failed module
    newModules.splice(failedIndex + 1, 0, remedialModule);

    // Re-index module orders
    const reorderedModules = newModules.map((m, idx) => ({ ...m, order: idx + 1 }));

    return {
      ...currentRoadmap,
      modules: reorderedModules,
    };
  }

  /**
   * Upstream Trigger: Recalculates roadmap when learner pivots to a new career goal
   */
  public static triggerCareerPivot(
    profile: LearnerProfile,
    newRoleId: string
  ): { updatedProfile: LearnerProfile; newRoadmap: Roadmap } {
    const bus = AgentEventBus.getInstance();

    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'AI Mentor',
      type: 'agent:adaptive:career-pivot',
      message: `Learner pivoted target role from "${profile.targetRoleId}" to "${newRoleId}". Recalculating roadmap...`,
    });

    const updatedProfile: LearnerProfile = {
      ...profile,
      targetRoleId: newRoleId,
      updatedAt: new Date().toISOString(),
    };

    const report = SkillAnalyzerAgent.analyze(updatedProfile);
    const newRoadmap = CurriculumPlannerAgent.planRoadmap(report);

    return { updatedProfile, newRoadmap };
  }
}
