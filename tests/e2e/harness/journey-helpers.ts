import {
  LearnerProfile,
  Roadmap,
  RoadmapModule,
  AssessmentResult,
  GapAnalysisReport,
  RoleBenchmark,
  ProficiencyLevel,
  Quiz,
  SkillGap,
} from './types';
import { TestContext } from './context';
import { AgentEventBus } from './event-bus-harness';

export const ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  'fullstack-dev': {
    id: 'fullstack-dev',
    roleName: 'Full Stack Developer',
    description: 'Modern full-stack web engineering across frontend, backend, and relational databases.',
    requiredSkills: [
      { name: 'JavaScript', minProficiency: 'advanced', weight: 30, category: 'Frontend' },
      { name: 'React', minProficiency: 'intermediate', weight: 25, category: 'Frontend' },
      { name: 'Node.js', minProficiency: 'intermediate', weight: 25, category: 'Backend' },
      { name: 'SQL', minProficiency: 'intermediate', weight: 10, category: 'Database' },
      { name: 'HTML', minProficiency: 'beginner', weight: 10, category: 'Frontend' },
    ],
  },
  'aiml-engineer': {
    id: 'aiml-engineer',
    roleName: 'AI / ML Engineer',
    description: 'Statistical modeling, deep neural networks, and scalable ML engineering.',
    requiredSkills: [
      { name: 'Python', minProficiency: 'advanced', weight: 30, category: 'Machine Learning' },
      { name: 'Linear Algebra', minProficiency: 'intermediate', weight: 20, category: 'Machine Learning' },
      { name: 'PyTorch', minProficiency: 'intermediate', weight: 25, category: 'Machine Learning' },
      { name: 'Pandas', minProficiency: 'intermediate', weight: 15, category: 'Machine Learning' },
      { name: 'Model Evaluation', minProficiency: 'intermediate', weight: 10, category: 'Machine Learning' },
    ],
  },
  'devops-engineer': {
    id: 'devops-engineer',
    roleName: 'DevOps Engineer',
    description: 'Container orchestration, CI/CD automation, and cloud infrastructure operations.',
    requiredSkills: [
      { name: 'Linux', minProficiency: 'intermediate', weight: 20, category: 'DevOps' },
      { name: 'Bash', minProficiency: 'intermediate', weight: 15, category: 'DevOps' },
      { name: 'Docker', minProficiency: 'intermediate', weight: 25, category: 'DevOps' },
      { name: 'Kubernetes', minProficiency: 'intermediate', weight: 25, category: 'DevOps' },
      { name: 'Git', minProficiency: 'intermediate', weight: 15, category: 'DevOps' },
    ],
  },
};

export function normalizeSkillName(name: string): string {
  const lower = name.trim().toLowerCase();
  if (lower === 'js' || lower === 'javascript' || lower === 'javascript.js' || lower === 'es6') return 'JavaScript';
  if (lower === 'react' || lower === 'react.js' || lower === 'reactjs') return 'React';
  if (lower === 'nodejs' || lower === 'node' || lower === 'node.js') return 'Node.js';
  if (lower === 'sql' || lower === 'postgres' || lower === 'postgresql' || lower === 'mysql' || lower === 'sqlite') return 'SQL';
  if (lower === 'html' || lower === 'html5') return 'HTML';
  if (lower === 'python' || lower === 'py' || lower === 'python3') return 'Python';
  if (lower === 'k8s' || lower === 'kubernetes') return 'Kubernetes';
  return name.trim();
}

export function normalizeRoleId(roleId: string): string {
  const lower = roleId.trim().toLowerCase().replace(/_/g, '-');
  if (lower.includes('full') || lower.includes('stack')) return 'fullstack-dev';
  if (lower.includes('ai') || lower.includes('ml')) return 'aiml-engineer';
  if (lower.includes('devops') || lower.includes('ops')) return 'devops-engineer';
  return roleId.trim();
}

const PROFICIENCY_RANKS: Record<ProficiencyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export class SkillAnalyzerService {
  public static analyzeGaps(profile: LearnerProfile, benchmark?: RoleBenchmark): GapAnalysisReport {
    const bus = AgentEventBus.getInstance();
    bus.publish('agent:skill-analysis:started', { userId: profile.id, roleId: profile.targetRoleId });
    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Skill Analyzer',
      type: 'agent:skill-analysis:started',
      message: `Analyzing career gaps for ${profile.name} against target role.`,
    });

    const canonicalRoleId = normalizeRoleId(profile.targetRoleId);
    const activeBenchmark = benchmark || ROLE_BENCHMARKS[canonicalRoleId] || ROLE_BENCHMARKS['fullstack-dev'];

    // Map learner skills
    const userSkillsMap = new Map<string, { originalName: string; proficiency: ProficiencyLevel; category?: string }>();
    for (const s of profile.skills || []) {
      const norm = normalizeSkillName(s.name);
      userSkillsMap.set(norm.toLowerCase(), { originalName: norm, proficiency: s.proficiency, category: s.category });
    }

    const missingSkills: SkillGap[] = [];
    const strengths: Array<{ name: string; proficiency: ProficiencyLevel; category: string }> = [];
    let satisfiedWeight = 0;
    const totalBenchmarkWeight = activeBenchmark.requiredSkills.reduce((sum, r) => sum + r.weight, 0);

    for (const req of activeBenchmark.requiredSkills) {
      const match = userSkillsMap.get(req.name.toLowerCase());
      if (!match) {
        missingSkills.push({
          name: req.name,
          requiredProficiency: req.minProficiency,
          currentProficiency: null,
          gapType: 'missing',
          category: req.category,
          weight: req.weight,
        });
      } else {
        const userRank = PROFICIENCY_RANKS[match.proficiency] || 1;
        const requiredRank = PROFICIENCY_RANKS[req.minProficiency] || 1;

        if (userRank >= requiredRank) {
          satisfiedWeight += req.weight;
          strengths.push({
            name: req.name,
            proficiency: match.proficiency,
            category: req.category,
          });
        } else {
          // Depth gap
          const partialCredit = req.weight * (userRank / requiredRank);
          satisfiedWeight += partialCredit;
          missingSkills.push({
            name: req.name,
            requiredProficiency: req.minProficiency,
            currentProficiency: match.proficiency,
            gapType: 'depth',
            category: req.category,
            weight: req.weight,
          });
        }
      }
    }

    // Add adjacencies / additional strengths not in benchmark
    for (const [sLower, sData] of Array.from(userSkillsMap.entries())) {
      const inReq = activeBenchmark.requiredSkills.some(r => r.name.toLowerCase() === sLower);
      if (!inReq) {
        strengths.push({
          name: sData.originalName,
          proficiency: sData.proficiency,
          category: sData.category || 'General',
        });
      }
    }

    const readinessScore = totalBenchmarkWeight > 0
      ? Math.min(100, Math.max(0, Math.round((satisfiedWeight / totalBenchmarkWeight) * 100)))
      : 100;

    // Prioritized recommendations: prerequisites first
    const recommendations: string[] = missingSkills.map(
      gap => `Focus on ${gap.name} (${gap.gapType === 'depth' ? 'deepen to ' + gap.requiredProficiency : 'learn from scratch'})`
    );

    const report: GapAnalysisReport = {
      userId: profile.id,
      targetRoleId: activeBenchmark.id,
      targetRoleName: activeBenchmark.roleName,
      readinessScore,
      missingSkills,
      weaknesses: missingSkills.filter(s => s.gapType === 'depth'),
      missingGaps: missingSkills.filter(s => s.gapType === 'missing'),
      strengths,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };

    bus.publish('agent:skill-analysis:completed', report);
    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Skill Analyzer',
      type: 'agent:skill-analysis:completed',
      message: `Completed gap analysis. Readiness score: ${readinessScore}%. Identified ${missingSkills.length} skill gaps.`,
      metadata: { readinessScore, gapCount: missingSkills.length },
    });

    return report;
  }
}

export class CurriculumPlannerService {
  public static generateRoadmap(profile: LearnerProfile, gapReport: GapAnalysisReport): Roadmap {
    const bus = AgentEventBus.getInstance();
    bus.publish('agent:curriculum:started', { userId: profile.id, gapCount: gapReport.missingSkills.length });
    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum:started',
      message: `Synthesizing personalized curriculum for ${gapReport.targetRoleName}.`,
    });

    const modules: RoadmapModule[] = [];
    let order = 1;

    for (const gap of gapReport.missingSkills) {
      const estHours = gap.gapType === 'depth' ? 8 : 14;
      const mod: RoadmapModule = {
        id: `mod-${gap.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${order}`,
        title: `${gap.name} Mastery`,
        description: `Comprehensive module covering ${gap.name} required for ${gapReport.targetRoleName}.`,
        category: gap.category,
        status: order === 1 ? 'in_progress' : 'locked',
        isRemedial: false,
        estimatedHours: estHours,
        lessons: [
          { id: `les-${order}-1`, title: `${gap.name} Core Fundamentals`, durationMinutes: 45 },
          { id: `les-${order}-2`, title: `Advanced Patterns & Best Practices in ${gap.name}`, durationMinutes: 60 },
        ],
        codeSnippets: [
          { language: 'typescript', code: `// Practical application of ${gap.name}\nexport function demo() {}` },
        ],
        exercises: [
          { id: `ex-${order}-1`, prompt: `Build a real-world exercise demonstrating ${gap.name}.` },
        ],
        quiz: {
          id: `quiz-mod-${order}`,
          moduleId: `mod-${gap.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${order}`,
          title: `${gap.name} Mastery Assessment`,
          questions: [
            {
              id: `q-${order}-1`,
              question: `What is the primary architectural concept of ${gap.name}?`,
              options: ['Core Concept A', 'Core Concept B', 'Core Concept C', 'Core Concept D'],
              correctIndex: 0,
              concept: `${gap.name} Architecture`,
            },
            {
              id: `q-${order}-2`,
              question: `Which technique is recommended for error resilience in ${gap.name}?`,
              options: ['Ignore errors', 'Try-catch & circuit breakers', 'Kill the process', 'Log nothing'],
              correctIndex: 1,
              concept: `${gap.name} Resilience`,
            },
          ],
        },
        order: order++,
      };
      modules.push(mod);
    }

    // If 0 gaps, add a Capstone specialization module
    if (modules.length === 0) {
      modules.push({
        id: 'mod-capstone-1',
        title: `${gapReport.targetRoleName} Capstone Project`,
        description: 'End-to-end production architecture capstone.',
        category: 'Advanced',
        status: 'in_progress',
        isRemedial: false,
        estimatedHours: 20,
        lessons: [{ id: 'les-cap-1', title: 'System Architecture & Deployment' }],
        codeSnippets: [{ language: 'typescript', code: '// Capstone architecture' }],
        exercises: [{ id: 'ex-cap-1', prompt: 'Deploy full production system' }],
        order: 1,
      });
    }

    const totalHours = modules.reduce((sum, m) => sum + m.estimatedHours, 0);

    const roadmap: Roadmap = {
      id: `roadmap-${profile.id}`,
      userId: profile.id,
      targetRoleId: gapReport.targetRoleId,
      modules,
      totalHours,
      completedHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bus.publish('agent:curriculum:generated', { userId: profile.id, moduleCount: modules.length });
    bus.recordFeedEvent({
      userId: profile.id,
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum:generated',
      message: `Generated roadmap with ${modules.length} modules (${totalHours} total hours).`,
      metadata: { moduleCount: modules.length, totalHours },
    });

    return roadmap;
  }

  public static createRemedialModule(failedModule: RoadmapModule, missedConcepts: string[]): RoadmapModule {
    const conceptLabel = missedConcepts.length > 0 ? missedConcepts.join(', ') : failedModule.title;
    return {
      id: `${failedModule.id}-remedial`,
      title: `Remedial: ${failedModule.title} Drills`,
      description: `Targeted review focusing on missed concepts: ${conceptLabel}.`,
      category: failedModule.category,
      status: 'in_progress',
      isRemedial: true,
      remedialForModuleId: failedModule.id,
      estimatedHours: 6,
      lessons: [
        { id: `les-rem-1`, title: `Diagnostic Review: ${conceptLabel}`, durationMinutes: 30 },
        { id: `les-rem-2`, title: `Hands-on Code Fixes & Anti-patterns`, durationMinutes: 45 },
      ],
      codeSnippets: [
        { language: 'typescript', code: `// Targeted drill for: ${conceptLabel}\nexport function fixDefect() {}` },
      ],
      exercises: [
        { id: `ex-rem-1`, prompt: `Fix the failing test cases related to ${conceptLabel}.` },
      ],
      quiz: {
        id: `quiz-${failedModule.id}-remedial`,
        moduleId: `${failedModule.id}-remedial`,
        title: `Remedial Retest: ${failedModule.title}`,
        questions: [
          {
            id: `q-rem-1`,
            question: `How do you resolve issues with ${conceptLabel}?`,
            options: ['Apply remedial best practice', 'Ignore', 'Reboot system', 'Delete tests'],
            correctIndex: 0,
            concept: conceptLabel,
          },
        ],
      },
      order: failedModule.order + 0.5,
    };
  }
}

export class AssessmentEvaluatorService {
  public static gradeSubmission(submission: {
    userId: string;
    moduleId: string;
    score: number;
    submittedAt?: string;
  }): AssessmentResult {
    // Strict 70.0% boundary: any score < 70.0 (including 69.999%, 69.9%) strictly fails
    const rawScore = Math.max(0, Math.min(100, submission.score));
    const passed = rawScore >= 70.0;
    const score = rawScore;
    const missedConcepts = !passed ? ['Core Concept Understanding', 'Edge Case Handling'] : [];

    const result: AssessmentResult = {
      id: `asmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: submission.userId,
      moduleId: submission.moduleId,
      score,
      passed,
      status: passed ? 'passed' : 'failed',
      feedback: passed
        ? `Great job! You achieved ${score}%, demonstrating solid competency.`
        : `Score ${score}% is below the 70% threshold. Remedial practice recommended.`,
      missedConcepts,
      evaluatedAt: submission.submittedAt || new Date().toISOString(),
    };

    const bus = AgentEventBus.getInstance();
    bus.publish('agent:assessment:evaluated', result);
    bus.recordFeedEvent({
      userId: submission.userId,
      agentName: 'Assessment Evaluator',
      type: 'agent:assessment:evaluated',
      message: `Graded quiz for module ${submission.moduleId}: ${score}% (${passed ? 'PASSED' : 'FAILED'}).`,
      metadata: { score, passed },
    });

    return result;
  }
}

export class AdaptiveRemediationLoopService {
  public static async handleAssessmentSubmission(
    result: AssessmentResult,
    currentRoadmap: Roadmap
  ): Promise<{
    updatedRoadmap: Roadmap;
    remedialModuleInserted: boolean;
    remedialModule?: RoadmapModule;
  }> {
    const bus = AgentEventBus.getInstance();
    const modules = [...currentRoadmap.modules];
    const modIdx = modules.findIndex(m => m.id === result.moduleId);

    if (modIdx === -1) {
      return { updatedRoadmap: currentRoadmap, remedialModuleInserted: false };
    }

    const currentMod = modules[modIdx];

    if (!result.passed) {
      // Defect 2 Fix: Prevent infinite remedial module explosion on repeated failures.
      // 1. If currentMod is ALREADY a remedial module:
      if (currentMod.isRemedial) {
        currentMod.status = 'failed';
        currentMod.remedialAttemptCount = Math.min(3, (currentMod.remedialAttemptCount || 1) + 1);
        // Intensify practice exercises rather than spawning a new nested module
        currentMod.exercises.push({
          id: `ex-intensified-${currentMod.remedialAttemptCount}`,
          prompt: `Intensified Remedial Drill (Attempt ${currentMod.remedialAttemptCount}): Deepen conceptual mastery and debug edge cases for ${currentMod.title}.`,
        });

        bus.recordFeedEvent({
          userId: currentRoadmap.userId,
          agentName: 'Curriculum Planner',
          type: 'remediation:intensified',
          message: `Learner failed remedial module "${currentMod.title}" (Attempt ${currentMod.remedialAttemptCount}/3). Intensifying drills without recursive explosion.`,
          metadata: { remedialModuleId: currentMod.id, attempt: currentMod.remedialAttemptCount },
        });

        const updatedRoadmap: Roadmap = {
          ...currentRoadmap,
          modules,
          updatedAt: new Date().toISOString(),
        };

        return { updatedRoadmap, remedialModuleInserted: false, remedialModule: currentMod };
      }

      // 2. If a remedial module for this parent module already exists in the roadmap:
      const existingRemedial = modules.find(
        m => m.isRemedial && m.remedialForModuleId === currentMod.id
      );
      if (existingRemedial) {
        existingRemedial.remedialAttemptCount = Math.min(3, (existingRemedial.remedialAttemptCount || 1) + 1);
        return { updatedRoadmap: currentRoadmap, remedialModuleInserted: false, remedialModule: existingRemedial };
      }

      // 3. First failure of parent module: Create exactly 1 remedial module
      currentMod.status = 'failed';
      const remedialMod = CurriculumPlannerService.createRemedialModule(currentMod, result.missedConcepts);
      remedialMod.remedialAttemptCount = 1;
      remedialMod.remedialForModuleId = currentMod.id;

      // Insert immediately after failed module
      modules.splice(modIdx + 1, 0, remedialMod);

      bus.publish('remediation:triggered', {
        userId: currentRoadmap.userId,
        failedModuleId: currentMod.id,
        remedialModuleId: remedialMod.id,
        score: result.score,
      });

      bus.recordFeedEvent({
        userId: currentRoadmap.userId,
        agentName: 'Curriculum Planner',
        type: 'remediation:triggered',
        message: `Assessment score ${result.score}% < 70%. Injected remedial module for ${currentMod.title}.`,
        metadata: { remedialModuleId: remedialMod.id, score: result.score },
      });

      const updatedRoadmap: Roadmap = {
        ...currentRoadmap,
        modules,
        totalHours: modules.reduce((sum, m) => sum + m.estimatedHours, 0),
        updatedAt: new Date().toISOString(),
      };

      return { updatedRoadmap, remedialModuleInserted: true, remedialModule: remedialMod };
    } else {
      // Score >= 70: Passed
      if (currentMod.isRemedial) {
        currentMod.status = 'remediated_and_passed';
        // Unlock next module
        const nextMod = modules[modIdx + 1];
        if (nextMod) {
          nextMod.status = 'in_progress';
        }
      } else {
        currentMod.status = 'completed';
        // If there was an adjacent remedial module that is now obsolete, we can advance following module
        const nextMod = modules[modIdx + 1];
        if (nextMod) {
          if (!nextMod.isRemedial) {
            nextMod.status = 'in_progress';
          } else {
            const followingMod = modules[modIdx + 2];
            if (followingMod) {
              followingMod.status = 'in_progress';
            }
          }
        }
      }

      const completedHours = modules
        .filter(m => m.status === 'completed' || m.status === 'remediated_and_passed')
        .reduce((sum, m) => sum + m.estimatedHours, 0);

      const updatedRoadmap: Roadmap = {
        ...currentRoadmap,
        modules,
        completedHours,
        updatedAt: new Date().toISOString(),
      };

      return { updatedRoadmap, remedialModuleInserted: false };
    }
  }

  public static async handleCareerGoalChange(
    newRoleId: string,
    currentProfile: LearnerProfile,
    currentRoadmap: Roadmap
  ): Promise<{
    updatedProfile: LearnerProfile;
    updatedRoadmap: Roadmap;
    gapAnalysis: GapAnalysisReport;
  }> {
    if (!newRoleId || newRoleId.trim() === '') {
      throw new Error('ValidationError: newRoleId cannot be empty');
    }

    const bus = AgentEventBus.getInstance();
    const canonicalRoleId = normalizeRoleId(newRoleId);

    // If identical role, return unchanged
    if (canonicalRoleId === normalizeRoleId(currentProfile.targetRoleId)) {
      const existingGap = SkillAnalyzerService.analyzeGaps(currentProfile);
      return {
        updatedProfile: currentProfile,
        updatedRoadmap: currentRoadmap,
        gapAnalysis: existingGap,
      };
    }

    // Update profile
    const updatedProfile: LearnerProfile = {
      ...currentProfile,
      targetRoleId: canonicalRoleId,
      updatedAt: new Date().toISOString(),
    };

    bus.publish('goal:pivoted', {
      userId: currentProfile.id,
      oldRoleId: currentProfile.targetRoleId,
      newRoleId: canonicalRoleId,
    });

    bus.recordFeedEvent({
      userId: currentProfile.id,
      agentName: 'Skill Analyzer',
      type: 'goal:pivoted',
      message: `Pivoted career goal to ${canonicalRoleId}. Re-analyzing skill competencies.`,
      metadata: { newRoleId: canonicalRoleId },
    });

    // Run gap analysis against new benchmark
    const gapAnalysis = SkillAnalyzerService.analyzeGaps(updatedProfile);

    // Re-synthesize roadmap
    const updatedRoadmap = CurriculumPlannerService.generateRoadmap(updatedProfile, gapAnalysis);

    bus.publish('agent:roadmap:recalculated', {
      userId: currentProfile.id,
      moduleCount: updatedRoadmap.modules.length,
    });

    bus.recordFeedEvent({
      userId: currentProfile.id,
      agentName: 'Curriculum Planner',
      type: 'agent:roadmap:recalculated',
      message: `Roadmap recalibrated for ${canonicalRoleId} with ${updatedRoadmap.modules.length} modules.`,
    });

    return {
      updatedProfile,
      updatedRoadmap,
      gapAnalysis,
    };
  }
}

export class JourneyHelpers {
  constructor(private context: TestContext) {}

  public async applyPreset(
    presetId: 'full-stack' | 'ai-ml' | 'devops' | 'fullstack-dev' | 'aiml-engineer' | 'devops-engineer'
  ): Promise<LearnerProfile> {
    const profile = await this.context.storage.resetToPreset(presetId, this.context.userId);
    return profile;
  }

  public async performGapAnalysis(): Promise<GapAnalysisReport> {
    const profile = await this.context.storage.getProfile(this.context.userId);
    if (!profile) throw new Error('Cannot analyze gaps: Profile not found');
    const report = SkillAnalyzerService.analyzeGaps(profile);
    return report;
  }

  public async generateRoadmap(gapReport: GapAnalysisReport): Promise<Roadmap> {
    const profile = await this.context.storage.getProfile(this.context.userId);
    if (!profile) throw new Error('Cannot generate roadmap: Profile not found');
    const roadmap = CurriculumPlannerService.generateRoadmap(profile, gapReport);
    await this.context.storage.saveRoadmap(roadmap);
    return roadmap;
  }

  public async submitAssessment(
    moduleId: string,
    score: number
  ): Promise<{
    result: AssessmentResult;
    updatedRoadmap: Roadmap;
    remedialModuleInserted: boolean;
  }> {
    const result = AssessmentEvaluatorService.gradeSubmission({
      userId: this.context.userId,
      moduleId,
      score,
    });

    await this.context.storage.saveAssessmentResult(result);

    const currentRoadmap = await this.context.storage.getRoadmap(this.context.userId);
    if (!currentRoadmap) throw new Error('Roadmap missing during assessment submission');

    const outcome = await AdaptiveRemediationLoopService.handleAssessmentSubmission(result, currentRoadmap);
    await this.context.storage.saveRoadmap(outcome.updatedRoadmap);

    return {
      result,
      updatedRoadmap: outcome.updatedRoadmap,
      remedialModuleInserted: outcome.remedialModuleInserted,
    };
  }

  public async pivotCareerGoal(newRoleId: string): Promise<{
    updatedProfile: LearnerProfile;
    updatedRoadmap: Roadmap;
    gapAnalysis: GapAnalysisReport;
  }> {
    const currentProfile = await this.context.storage.getProfile(this.context.userId);
    const currentRoadmap = await this.context.storage.getRoadmap(this.context.userId);
    if (!currentProfile || !currentRoadmap) throw new Error('Profile or roadmap missing for career pivot');

    const outcome = await AdaptiveRemediationLoopService.handleCareerGoalChange(
      newRoleId,
      currentProfile,
      currentRoadmap
    );

    await this.context.storage.saveProfile(outcome.updatedProfile);
    await this.context.storage.saveRoadmap(outcome.updatedRoadmap);

    return outcome;
  }

  public async askMentor(prompt: string): Promise<{ fullText: string; tokens: string[] }> {
    const tokens: string[] = [];
    const fullText = await this.context.llm.streamText(prompt, chunk => {
      tokens.push(chunk);
    });
    return { fullText, tokens };
  }
}
