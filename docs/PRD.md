# Product Requirements Document (PRD)
## AI-Powered Adaptive Learning Platform

---

### Document Control & Metadata
- **Project Title**: AI-Powered Adaptive Learning Platform
- **Document Version**: 1.0.0 (Production Blueprint)
- **Target Execution Window**: 3-Hour Rapid Full-Stack Delivery
- **Framework & Runtime**: Next.js 15/16 App Router, React 19, TypeScript 5, Tailwind CSS v4
- **Persistence Model**: Dual-Mode (Live Google Cloud Firestore + Zero-Config Offline LocalStorage/In-Memory)
- **Multi-Agent Runtime**: 4-Agent Autonomous Collaborative Cluster + Event-Driven Bus
- **Model Gateway**: Multi-Provider LLM Router (Google Gemini, OpenAI, Claude Stubs + Deterministic Streaming Mock Engine)

---

## 1. Executive Summary & Vision

### 1.1 Executive Summary
Modern technical upskilling suffers from static, one-size-fits-all roadmaps that fail to adapt to a learner's pre-existing strengths, gaps, or real-time struggles. The **AI-Powered Adaptive Learning Platform** is an enterprise-grade developer learning environment that dynamically benchmarks a learner's baseline competencies against production job role standards, constructs custom multi-stage roadmaps, generates interactive conceptual assessments, and autonomously executes a **bi-directional adaptive remediation loop**.

Powered by a collaborative cluster of 4 specialized AI agents (*Skill Analyzer*, *Curriculum Planner*, *Assessment Evaluator*, *AI Mentor*), the platform provides real-time Socratic guidance, transparent agent coordination logging, and immediate corrective curriculum branching when comprehension gaps (< 70% threshold) are detected.

### 1.2 System Vision
To provide engineers and career pivoters with an autonomous, real-time AI mentoring experience that feels like a dedicated technical staff engineer guiding them through targeted skill acquisition, zero wasted curriculum time, and instantaneous remediation when challenging concepts are encountered.

### 1.3 3-Hour Rapid Execution Target
The entire architecture is engineered for deterministic, high-velocity delivery within a 3-hour rapid execution window:
- **Zero-Config Out-of-the-Box Operation**: Fully functional offline without requiring mandatory API keys or cloud credentials.
- **Progressive Enhancement**: Connects seamlessly to live Firebase Firestore and external LLM APIs (Gemini/OpenAI) when credentials are provided in `.env.local`.
- **Pre-Hydrated Benchmark Presets**: Includes instant 1-click industry presets (such as the canonical Python + SQL + HTML -> Full Stack Developer transition) alongside a custom onboarding wizard.

---

## 2. System Architecture & Architectural Blocks

```
+----------------------------------------------------------------------------------------------------+
|                                    1. LEARNER UI (Next.js 15/16 Client)                            |
|  - Unified Split-Layout (45% Interaction Hub | 55% Visual Arena)                                   |
|  - 1-Click Presets Bar (Full Stack, AI/ML, Cloud DevOps, Custom Wizard)                            |
|  - React 19 Client Components, Tailwind CSS v4, Lucide Icons, Framer Motion Micro-Animations       |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                     +-----------------------------+-----------------------------+
                     |                                                           |
                     v                                                           v
+-----------------------------------------+         +------------------------------------------------+
|        2. MULTI-AGENT CLUSTER           |         |              3. PERSISTENCE LAYER              |
|  - Skill Analyzer Agent                 |         |              (Dual-Mode Repository)            |
|  - Curriculum / Roadmap Planner Agent   |         |                                                |
|  - Assessment Evaluator Agent           |         |  StorageService (IStorageAdapter)              |
|  - AI Mentor Agent (Conversational)     |         |  +------------------------------------------+  |
|                                         |         |  | Live Mode: FirestoreAdapter              |  |
|  Event Dispatcher:                      |         |  |   (Google Cloud Firestore via JS SDK)    |  |
|  - AgentEventBus (Pub/Sub Event Bus)    |         |  +------------------------------------------+  |
|  - Live Agent Feed Stream (SSE / React) |         |  | Offline Mode: LocalStorageMockAdapter    |  |
+-----------------------------------------+         |  |   (Window LocalStorage + SSR In-Memory)  |  |
                     |                              +------------------------------------------+-----+
                     |                                                           |
                     v                                                           v
+-----------------------------------------+         +------------------------------------------------+
|       4. MODEL GATEWAY (ILLMClient)     |         |          5. KNOWLEDGE BASE & BENCHMARKS        |
|  - Google Gemini Provider (Gemini 2.5)  |         |  - Role Competency Benchmark Matrices          |
|  - OpenAI Provider (GPT-4o / Mini)      |         |  - Canonical Full Stack Developer Baseline     |
|  - MockLLMStreamProvider (Zero-Config)  |         |  - Assessment Question Bank & Distractors      |
|    * Word-by-word streaming simulation  |         |  - Remedial Concept Mini-Module Templates      |
+-----------------------------------------+         +------------------------------------------------+
```

### 2.1 Architectural Blocks Description
1. **Learner UI (Next.js 15/16 App Router Client)**:
   - Built on React 19 with strict client/server boundary discipline.
   - Implements a high-density, professional developer tooling layout:
     * Left Column (45%): Interactive Command & Mentorship Hub (Profile, AI Mentor Chat, Live Agent Feed).
     * Right Column (55%): Visual Execution Arena (Career Gap Radar, Interactive Roadmap Visualizer, Assessment Modal, Remediation Banner).
     * Global Header: System branding, Firestore/Local connection pill, 1-Click Presets quickbar, Dark/Light theme switch.
2. **Specialized Multi-Agent Cluster**:
   - Four distinct, loosely coupled agent services communicating over an event-driven message bus (`AgentEventBus`).
   - Every action, inference, calculation, and handoff emits a typed `AgentFeedEvent` for real-time visualization.
3. **Bi-directional Adaptive Remediation Loop**:
   - Downstream: Automated assessment evaluation triggering immediate remedial module injection upon failure (< 70%).
   - Upstream: Career goal change event triggering intelligent roadmap recalculation while preserving mastered competencies.
4. **Dual-Mode Persistence Layer**:
   - `StorageService` implements the Repository Pattern via `IStorageAdapter`.
   - `FirestoreAdapter` activates when `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is present.
   - `LocalStorageMockAdapter` engages transparently if credentials are missing or network requests fail, storing data in browser `localStorage` and node memory during SSR.
5. **Multi-Provider Model Gateway**:
   - Unified interface `ILLMClient` with both streaming chunk callbacks (`streamText`) and typed JSON extraction (`generateJSON`).
   - Includes a deterministic, domain-aware `MockLLMStreamProvider` streaming realistic tokens at 15–30ms intervals with zero external network dependencies.
6. **Knowledge Base & Benchmark Repository**:
   - Standardized role definition graphs mapping roles to required skills, minimum competency thresholds, importance weights, and prerequisite dependencies.

---

## 3. Specialized 4-Agent Cluster Interaction Contracts

```
 +---------------------------------------------------------------------------------+
 |                              AGENT INTERACTION GRAPH                            |
 +---------------------------------------------------------------------------------+
                                          
       [Learner Profile] ---------------------> (1) SKILL ANALYZER AGENT
                                                       |
                                                       | Emits: SKILL_ANALYSIS_COMPLETED
                                                       v
                                            (2) CURRICULUM PLANNER AGENT
                                                       |
                                                       | Generates: Roadmap Modules
                                                       v
   [Learner Takes Quiz] ----------------------> (3) ASSESSMENT EVALUATOR AGENT
                                                       |
                           +---------------------------+---------------------------+
                           | Score >= 70% (PASS)                                   | Score < 70% (FAIL)
                           v                                                       v
                   [Unlock Next Module]                              Emits: ASSESSMENT_FAILED
                                                                                   |
                                                                                   v
                                                                   (2) CURRICULUM PLANNER AGENT
                                                                       (Splices Remedial Module)
                                                                                   |
                                                                                   v
                                                                     (4) AI MENTOR AGENT
                                                                       (Socratic Debug Guidance)
```

### 3.1 Agent 1: Skill Analyzer Agent (`skill-analyzer`)
- **Agent Identity**:
  - Name: Skill Analyzer
  - Accent Color: Cyan (`#06b6d4`)
  - Icon: `ScanSearch` / `Activity`
- **Core Responsibilities**:
  - Ingests learner's current profile (skills, proficiency levels, certifications, projects, and target career goal).
  - Matches the profile against the target role's canonical competency matrix.
  - Computes strengths (matched skills with adequate proficiency), weaknesses (skills present but below target proficiency), and critical missing gaps (mandatory skills missing entirely).
  - Calculates a mathematically normalized **Readiness Score** ($0\% \le R \le 100\%$).
- **Inputs**:
  ```typescript
  interface SkillAnalyzerInput {
    profile: LearnerProfile;
    targetRoleBenchmark: RoleBenchmark;
  }
  ```
- **Outputs**:
  ```typescript
  interface SkillAnalysisResult {
    roleId: string;
    roleName: string;
    readinessScore: number; // 0 to 100
    strengths: AnalyzedSkill[];
    weaknesses: AnalyzedSkill[];
    missingGaps: AnalyzedSkill[];
    recommendations: string[];
    analyzedAt: string;
  }
  ```
- **Event Bus Output**: Emits `SKILL_ANALYSIS_COMPLETED` with payload summary.

---

### 3.2 Agent 2: Curriculum / Roadmap Planner Agent (`curriculum-planner`)
- **Agent Identity**:
  - Name: Curriculum Planner
  - Accent Color: Amber (`#f59e0b`)
  - Icon: `Milestone` / `GitBranch`
- **Core Responsibilities**:
  - Synthesizes a sequential, dependency-aware learning roadmap (typically 4–6 progressive modules) addressing the identified critical gaps and weaknesses.
  - Allocates estimated study hours, difficulty ratings, bite-sized lessons with code examples, and practical exercises.
  - **Dynamic Remediation Injection**: When invoked by an `ASSESSMENT_FAILED` event, generates a targeted remedial mini-module specifically focused on the failed sub-concepts and splices it immediately after the failed module with an amber badge indicator.
  - **Upstream Re-Planning**: When invoked by a `GOAL_CHANGED` event, compares existing completed modules, preserves acquired skills, and recalculates subsequent modules to match the new role.
- **Inputs**:
  ```typescript
  interface CurriculumPlannerInput {
    analysis: SkillAnalysisResult;
    currentRoadmap?: Roadmap | null;
    remediationContext?: {
      failedModuleId: string;
      failedConceptTags: string[];
      score: number;
    };
  }
  ```
- **Outputs**:
  ```typescript
  interface Roadmap {
    id: string;
    userId: string;
    roleId: string;
    roleTitle: string;
    totalEstimatedHours: number;
    modules: RoadmapModule[];
    createdAt: string;
    updatedAt: string;
  }
  ```
- **Event Bus Output**: Emits `ROADMAP_GENERATED` or `REMEDIATION_MODULE_INSERTED`.

---

### 3.3 Agent 3: Assessment Evaluator Agent (`assessment-evaluator`)
- **Agent Identity**:
  - Name: Assessment Evaluator
  - Accent Color: Emerald (`#10b981`)
  - Icon: `CheckCircle2` / `GraduationCap`
- **Core Responsibilities**:
  - Generates dynamic, context-specific assessment quizzes (5 questions covering conceptual understanding, code snippet output prediction, debugging, and architectural trade-offs).
  - Evaluates user submissions against deterministic answer keys and rubrics.
  - Computes the aggregate percentage score.
  - **Strict Threshold Rule**:
    * If **Score $\ge 70\%$**: Issues PASS decision, marks the module status as `completed`, unlocks the subsequent roadmap module, and emits `ASSESSMENT_PASSED`.
    * If **Score $< 70\%$**: Issues FAIL decision, marks the module status as `failed`, extracts the specific failed concept tags, emits `ASSESSMENT_FAILED`, and triggers the Bi-directional Adaptive Remediation Loop.
- **Inputs**:
  ```typescript
  interface AssessmentEvaluationInput {
    moduleId: string;
    assessmentId: string;
    answers: Record<string, string>; // questionId -> selectedOptionId
    questions: AssessmentQuestion[];
  }
  ```
- **Outputs**:
  ```typescript
  interface AssessmentResult {
    id: string;
    assessmentId: string;
    moduleId: string;
    userId: string;
    score: number; // 0 to 100
    passed: boolean; // score >= 70
    threshold: number; // 70
    totalQuestions: number;
    correctCount: number;
    questionFeedback: {
      questionId: string;
      correct: boolean;
      userAnswer: string;
      correctAnswer: string;
      explanation: string;
      conceptTag: string;
    }[];
    failedConceptTags: string[];
    evaluatedAt: string;
  }
  ```
- **Event Bus Output**: Emits `ASSESSMENT_PASSED` or `ASSESSMENT_FAILED`.

---

### 3.4 Agent 4: AI Mentor Agent (`ai-mentor`)
- **Agent Identity**:
  - Name: AI Mentor
  - Accent Color: Indigo (`#6366f1`)
  - Icon: `Bot` / `Sparkles`
- **Core Responsibilities**:
  - Operates as a persistent conversational copilot using Socratic pedagogy (asking guiding questions, prompting self-correction, explaining why instead of simply providing copy-paste solutions).
  - Maintains awareness of active context: current profile, target role, current module, recent assessment scores, and active remediation modules.
  - Delivers code snippet explanations, architectural trade-off discussions, and motivation during challenging remediation steps.
  - Assists with career pivot counseling (explaining skill transferability and salary/market trends).
- **Communication Protocol**:
  - Token-by-token streaming via Server-Sent Events (`text/event-stream; charset=utf-8`) or Web `ReadableStream`.
- **Inputs**:
  ```typescript
  interface AIMentorPromptContext {
    messages: ChatMessage[];
    currentProfile: LearnerProfile;
    activeModule?: RoadmapModule;
    recentAssessmentResult?: AssessmentResult;
  }
  ```
- **Outputs**:
  - Streaming markdown chunks with syntax-highlighted code blocks, bulleted checklists, and collapsible deep-dives.

---

## 4. Career Gap Analysis Mathematical & Algorithmic Formulation

To eliminate ambiguity and provide rigorous, repeatable results across both automated test suites and real-world usage, the Skill Gap Engine executes a deterministic vector matching algorithm.

### 4.1 Proficiency Weight Matrix
Learner skills and benchmark role requirements are assigned ordinal proficiency levels mapped to normalized numerical weights $W \in [0.0, 1.0]$:

$$\text{Weight}(p) = \begin{cases}
0.25 & \text{if } p = \text{"beginner"} \\
0.50 & \text{if } p = \text{"intermediate"} \\
0.75 & \text{if } p = \text{"advanced"} \\
1.00 & \text{if } p = \text{"expert"} \\
0.00 & \text{if skill is missing or unverified}
\end{cases}$$

### 4.2 Benchmark Skill Importance Multiplier
Each required skill $k$ in a target role benchmark $B$ carries an importance tier $I_k \in \{1, 2, 3\}$:
- **Critical (Tier 3, weight = 1.0)**: Mandatory core competency (e.g., React, JavaScript, Node.js for Full Stack).
- **Important (Tier 2, weight = 0.7)**: Strong operational skill (e.g., TypeScript, REST APIs, Git).
- **Nice-to-Have (Tier 1, weight = 0.4)**: Complementary advantage (e.g., Docker, Jest, CI/CD).

### 4.3 Classification Taxonomy
For each required skill $k \in B$:
1. Let $W_{req}(k)$ be the benchmark target weight.
2. Let $W_{user}(k)$ be the learner's current weight ($0.0$ if skill is absent from profile).

The skill is classified into one of three mutually exclusive categories:
- **Strength**: $W_{user}(k) \ge W_{req}(k)$.
  * The learner meets or exceeds the role benchmark.
- **Weakness (Proficiency Gap)**: $0 < W_{user}(k) < W_{req}(k)$.
  * The skill exists in the learner's profile, but the proficiency level is below the role's required standard. Deficit: $\Delta(k) = W_{req}(k) - W_{user}(k)$.
- **Missing Critical Gap**: $W_{user}(k) = 0$.
  * The skill is completely absent from the learner's profile. Deficit: $\Delta(k) = W_{req}(k)$.

### 4.4 Aggregate Readiness Score Formula
The overall Career Readiness Score $R \in [0, 100]$ is computed as the weighted ratio of achieved proficiency to required proficiency:

$$R = \text{round}\left( \frac{\sum_{k \in B} \min(W_{user}(k), W_{req}(k)) \cdot I_k}{\sum_{k \in B} W_{req}(k) \cdot I_k} \times 100 \right)$$

Where:
- $\min(W_{user}(k), W_{req}(k))$ prevents extra proficiency in one skill from compensating for a missing critical skill.
- The denominator normalizes the score against the benchmark's total weighted requirements.

### 4.5 Canonical Scenario: Full Stack Developer Transition
- **Learner Profile Baseline**:
  * Python (Advanced, $W=0.75$)
  * SQL (Intermediate, $W=0.50$)
  * HTML (Beginner, $W=0.25$)
- **Target Role: Full Stack Developer Benchmark**:
  * JavaScript (Advanced, $W_{req}=0.75, I=1.0$) -> **Missing Critical Gap**
  * React (Intermediate, $W_{req}=0.50, I=1.0$) -> **Missing Critical Gap**
  * Node.js (Intermediate, $W_{req}=0.50, I=1.0$) -> **Missing Critical Gap**
  * HTML/CSS (Intermediate, $W_{req}=0.50, I=0.7$) -> **Weakness** ($W_{user}=0.25 < 0.50$)
  * SQL/Databases (Intermediate, $W_{req}=0.50, I=0.7$) -> **Strength** ($W_{user}=0.50 \ge 0.50$)
  * Python/Backend (Nice-to-Have, $W_{req}=0.25, I=0.4$) -> **Strength** ($W_{user}=0.75 \ge 0.25$)
- **Algorithmic Output**:
  * Missing Gaps: `['JavaScript', 'React', 'Node.js']`
  * Weaknesses: `['HTML/CSS']`
  * Strengths: `['SQL/Databases', 'Python/Backend']`
  * Baseline Readiness Score: $\approx 28\%$ to $34\%$.
  * Generated Roadmap focuses directly on JavaScript ES6+, React Components & State, Node.js API development, and modern CSS layout.

---

## 5. Bi-directional Adaptive Remediation Loop

The adaptive engine continuously synchronizes user actions with curriculum planning in two operational directions:

```
+----------------------------------------------------------------------------------------------------+
|                           BI-DIRECTIONAL ADAPTIVE REMEDIATION LIFECYCLE                            |
+----------------------------------------------------------------------------------------------------+

[DOWNSTREAM PATHWAY: ASSESSMENT EVALUATION]
  1. Learner completes 5-question module quiz.
  2. Assessment Evaluator computes score:
     - IF score >= 70%:
       * Set Module Status = 'completed'
       * Set Next Module Status = 'in-progress'
       * Emit: ASSESSMENT_PASSED event
       * UI triggers celebratory confetti and module unlock animation.
     - IF score < 70%:
       * Set Module Status = 'failed'
       * Extract failed concept tags (e.g. ['async-await', 'event-loop'])
       * Emit: ASSESSMENT_FAILED event with { moduleId, score, failedConceptTags }
       * Curriculum Planner intercepts event:
         - Generates targeted mini-module (e.g. "Remedial Deep Dive: Async JavaScript & Event Loop")
         - Injects module at index (current_index + 1)
         - Flags module with isRemediation: true, badge: 'REMEDIATION' (amber styling)
       * AI Mentor posts automated encouragement in Live Feed and Chat.
       * Roadmap is persisted to StorageService.

[UPSTREAM PATHWAY: CAREER GOAL PIVOT]
  1. Learner switches target role in UI (e.g. "Full Stack Developer" -> "AI/ML Engineer").
  2. Dispatches GOAL_CHANGED event with { oldRoleId, newRoleId, currentProfile }.
  3. Skill Analyzer re-calculates readiness against new benchmark:
     * Completed modules from old path that match new benchmark skills are preserved as completed.
     * Non-transferable future un-started modules are retired.
  4. Curriculum Planner synthesizes updated module progression targeting new gaps.
  5. AI Mentor broadcasts transition summary explaining transferred credits.
  6. Updated Profile and Roadmap are saved to StorageService.
```

---

## 6. Dual-Mode Persistence Architecture

The platform guarantees zero configuration friction during local evaluation while offering seamless production synchronization when deployed with Google Cloud credentials.

### 6.1 StorageService Repository Pattern
All state reads and writes are encapsulated behind the `IStorageAdapter` contract:

```typescript
export interface IStorageAdapter {
  getProfile(userId: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<void>;
  getRoadmap(userId: string): Promise<Roadmap | null>;
  saveRoadmap(roadmap: Roadmap): Promise<void>;
  getAssessments(userId: string): Promise<AssessmentResult[]>;
  saveAssessmentResult(result: AssessmentResult): Promise<void>;
  getAgentFeed(userId: string): Promise<AgentFeedEvent[]>;
  appendFeedEvent(event: AgentFeedEvent): Promise<void>;
  resetToPreset(presetId: string): Promise<LearnerProfile>;
  isLiveConnected(): boolean;
  getMode(): 'firestore' | 'local_mock';
}
```

### 6.2 FirestoreAdapter (Live Mode)
- Configured using Firebase v13+ Client Web SDK (`firebase/app`, `firebase/firestore`).
- Reads credentials from environment variables:
  * `NEXT_PUBLIC_FIREBASE_API_KEY`
  * `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  * `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  * `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  * `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  * `NEXT_PUBLIC_FIREBASE_APP_ID`
- Firestore Collection Layout:
  * `/learners/{userId}`
  * `/learners/{userId}/roadmaps/{roadmapId}`
  * `/learners/{userId}/assessments/{assessmentResultId}`
  * `/learners/{userId}/feedEvents/{eventId}`

### 6.3 LocalStorageMockAdapter (Offline / Zero-Config Mode)
- **Automatic Engagement**: Engages when `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is missing or when Firestore initialization throws a network error.
- **Client Runtime**: Stores serialized JSON models in `window.localStorage` keyed by `ai_learning_platform:*`.
- **Server Runtime (SSR / API Routes)**: Stores models in a thread-safe in-memory map to guarantee SSR renders without hydration mismatches or node errors.
- **Event Dispatching**: Emits local storage custom events across browser windows to maintain UI reactivity.

### 6.4 Connection Status Badge
The UI header displays an interactive connection status pill:
- **Live Mode**: Green pill `● Cloud Sync (Firestore)`
- **Offline / Local Mode**: Amber pill `● Offline Mode (Local Storage)` with a popover explaining zero-config functionality.

---

## 7. Complete TypeScript Data Contracts

The entire system relies on strict, compile-time typed interfaces.

### 7.1 Learner Profile & Skills Contract
```typescript
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SkillCategory = 
  | 'frontend' 
  | 'backend' 
  | 'database' 
  | 'devops' 
  | 'ai_ml' 
  | 'cloud' 
  | 'security' 
  | 'mobile' 
  | 'fundamentals';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number;
  verified?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface LearnerProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string; // e.g., 'full-stack' | 'ai-engineer' | 'devops'
  weeklyCommitmentHours: number;
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
```

### 7.2 Role Benchmark & Gap Analysis Contract
```typescript
export interface BenchmarkSkill {
  id: string;
  name: string;
  category: SkillCategory;
  requiredProficiency: ProficiencyLevel;
  importanceTier: 1 | 2 | 3; // 1 = Nice to have, 2 = Important, 3 = Critical
  description: string;
}

export interface RoleBenchmark {
  id: string;
  title: string;
  category: string;
  description: string;
  marketDemand: 'high' | 'very_high' | 'critical';
  averageSalaryBand: string;
  requiredSkills: BenchmarkSkill[];
}

export interface AnalyzedSkill {
  skillId: string;
  skillName: string;
  category: SkillCategory;
  currentProficiency?: ProficiencyLevel;
  requiredProficiency: ProficiencyLevel;
  deficit: number;
  importanceTier: 1 | 2 | 3;
}

export interface GapAnalysisReport {
  roleId: string;
  roleTitle: string;
  readinessScore: number; // 0 - 100
  strengths: AnalyzedSkill[];
  weaknesses: AnalyzedSkill[];
  missingGaps: AnalyzedSkill[];
  generatedAt: string;
}
```

### 7.3 Multi-Agent Feed Event Contract
```typescript
export type AgentId = 'skill-analyzer' | 'curriculum-planner' | 'assessment-evaluator' | 'ai-mentor' | 'system';

export type EventType = 
  | 'thought' 
  | 'action' 
  | 'handoff' 
  | 'evaluation' 
  | 'remediation_trigger' 
  | 'roadmap_update' 
  | 'message';

export interface AgentFeedEvent {
  id: string;
  timestamp: string;
  agentId: AgentId;
  agentName: string;
  agentColor: string; // Hex color code
  type: EventType;
  title: string;
  summary: string;
  details?: string;
  metadata?: Record<string, unknown>;
  status?: 'pending' | 'success' | 'warning' | 'error';
}
```

### 7.4 Learning Roadmap & Remediation Contract
```typescript
export type ModuleStatus = 'locked' | 'ready' | 'in-progress' | 'completed' | 'failed';

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  contentMarkdown: string;
  codeSnippets?: {
    language: string;
    code: string;
    filename?: string;
  }[];
  completed: boolean;
}

export interface PracticalExercise {
  id: string;
  title: string;
  prompt: string;
  starterCode?: string;
  solutionCode?: string;
  instructionsMarkdown: string;
}

export interface RoadmapModule {
  id: string;
  order: number;
  title: string;
  targetSkill: string;
  category: SkillCategory;
  estimatedHours: number;
  status: ModuleStatus;
  isRemediation: boolean;
  remediationTriggeredByModuleId?: string;
  lessons: Lesson[];
  practicalExercise?: PracticalExercise;
  assessmentId?: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  roleId: string;
  roleTitle: string;
  totalEstimatedHours: number;
  modules: RoadmapModule[];
  createdAt: string;
  updatedAt: string;
}
```

### 7.5 Assessment Engine Contract
```typescript
export type QuestionType = 'multiple_choice' | 'code_analysis' | 'architecture_choice';

export interface AssessmentOption {
  id: string;
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options: AssessmentOption[];
  correctOptionId: string;
  explanation: string;
  conceptTag: string;
}

export interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  passingScoreThreshold: number; // 70
}

export interface AssessmentSubmission {
  assessmentId: string;
  moduleId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
}

export interface QuestionFeedback {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  conceptTag: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  moduleId: string;
  userId: string;
  score: number; // 0 - 100
  passed: boolean; // score >= 70
  threshold: number; // 70
  totalQuestions: number;
  correctCount: number;
  questionFeedback: QuestionFeedback[];
  failedConceptTags: string[];
  evaluatedAt: string;
}
```

---

## 8. Presets Catalog Specifications

To guarantee immediate verification, the platform ships with 3 pre-configured sample presets and a custom creation wizard.

### 8.1 Preset 1: Full Stack Transition (Canonical Benchmark)
- **Preset ID**: `preset-full-stack-transition`
- **Label**: `⚡ Full Stack Transition (Sample)`
- **Learner Name**: Alex Chen
- **Initial Skills**:
  * Python (Advanced, 3 years)
  * SQL (Intermediate, 2 years)
  * HTML (Beginner, 1 year)
- **Target Role**: Full Stack Developer
- **Expected Skill Gaps**: JavaScript, React, Node.js (Critical Missing), CSS (Weakness)
- **Initial Readiness**: 32%
- **Initial Roadmap**: 5 core modules (JS Modern Fundamentals -> React State & UI -> Node & Express APIs -> Database & ORM Integration -> Full Stack Capstone).

### 8.2 Preset 2: AI/ML Engineer Pivot
- **Preset ID**: `preset-ai-engineer-pivot`
- **Label**: `🤖 AI/ML Engineer Pivot`
- **Learner Name**: Priya Sharma
- **Initial Skills**:
  * Python (Advanced, 4 years)
  * Pandas & NumPy (Intermediate, 2 years)
  * SQL (Intermediate, 2 years)
- **Target Role**: AI/ML Engineer
- **Expected Skill Gaps**: PyTorch / Deep Learning, Vector Databases, LLM Orchestration (LangChain/LlamaIndex), MLOps.
- **Initial Readiness**: 40%

### 8.3 Preset 3: Cloud DevOps Architect
- **Preset ID**: `preset-cloud-devops-architect`
- **Label**: `☁️ Cloud DevOps Architect`
- **Learner Name**: Marcus Vance
- **Initial Skills**:
  * Linux Administration (Advanced, 5 years)
  * Bash Scripting (Advanced, 4 years)
  * Git & Version Control (Advanced, 4 years)
- **Target Role**: Cloud DevOps Engineer
- **Expected Skill Gaps**: Kubernetes Container Orchestration, Terraform Infrastructure-as-Code, AWS/GCP Cloud Architecture, Prometheus/Grafana Observability.
- **Initial Readiness**: 38%

### 8.4 Preset 4: Custom Onboarding Wizard
- **Trigger**: Click `✨ Custom Onboarding Wizard`
- **Flow**: Multi-step modal:
  1. Personal Profile & Career Goal selection.
  2. Interactive skill tagger with proficiency slider.
  3. Projects and certifications inputs.
  4. Immediate real-time gap analysis generation.

---

## 9. Verification & Acceptance Criteria Matrix

| Req ID | Requirement | Verification Method | Success Criteria |
|---|---|---|---|
| **AC-1** | Formal PRD Document | File inspection of `docs/PRD.md` | Contains 9 comprehensive sections, full formulas, architecture diagrams, and TypeScript schemas. |
| **AC-2** | UI/UX Design System | File inspection of `docs/UI_UX_DESIGN_SYSTEM.md` | Contains complete color token tables, 4-agent accent colors, typography scale, component hierarchy, wireframe. |
| **AC-3** | Learner Profile Model | Unit test `src/tests/profile.test.ts` | Stores skills, certifications, projects, and target career goal with valid TypeScript serialization. |
| **AC-4** | Gap Analysis Logic | Unit test `src/tests/gap-analysis.test.ts` | Evaluates Python + SQL + HTML against Full Stack benchmark; asserts JavaScript, React, Node.js are missing gaps. |
| **AC-5** | Multi-Agent Cluster | Integration test `src/tests/agents.test.ts` | All 4 agents execute roles; `AgentEventBus` records and streams collaboration events. |
| **AC-6** | Adaptive Remediation | Integration test `src/tests/adaptive-loop.test.ts` | Quiz score < 70% automatically inserts amber-badged remedial module after the failed module; role change recalculates roadmap. |
| **AC-7** | Dual-Mode Storage | Integration test `src/tests/storage-fallback.test.ts` | Seamlessly reads/writes in mock offline mode; connects to Firestore when credentials are supplied. |
| **AC-8** | Zero-Config Run | `npm run build` and `npx vitest run` | Compiles with 0 TypeScript errors and runs all unit tests cleanly without requiring external API keys. |

---

*End of Product Requirements Document.*
