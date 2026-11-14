# E2E Test Infra: AI-Powered Learning Platform

## 1. Test Philosophy & Principles
- **Opaque-Box & Requirement-Driven**: Tests validate public contracts, observable behaviors, state persistence, streaming tokens, and event bus emissions derived directly from `ORIGINAL_REQUEST.md` and `PROJECT.md`, without coupling to private implementation details.
- **Progressive Testability**: Verification does NOT depend on complex UI rendering or external live services; tests execute against high-fidelity in-memory mock adapters (`LocalStorageMockAdapter`, `MockLLMStreamProvider`) with zero configuration, while maintaining strict contract parity with live adapters (`FirestoreAdapter`, live LLM clients).
- **Hermetic Test Isolation**: Every test scenario executes within an isolated `TestContext` featuring unique user namespaces, clean event bus subscriptions, and reset storage state.
- **Strict Integrity & Zero-Cheating**: All assertions require genuine logic execution. Hardcoded strings, bypassed thresholds, or fake passing results are strictly detected and rejected.

---

## 2. Methodology & 4-Tier Architecture
Our testing framework implements a systematic 4-tier methodology based on Category-Partition, Boundary Value Analysis, Pairwise Interaction Testing, and Real-World Workload Simulation:

1. **Tier 1 — Feature Coverage (>=5 tests per core feature)**:
   - Enumerate all functional features from `PROJECT.md § Feature Inventory` and `ORIGINAL_REQUEST.md`.
   - Dedicated test suites covering positive happy-path flows, contract verification, data model serialization, and state mutations.
2. **Tier 2 — Boundary & Corner Cases (>=5 tests per boundary domain)**:
   - Extreme inputs, zero/empty states, overflow thresholds, null token handling, and precision boundaries (notably 69% failing vs 70% passing).
   - Storage disconnects, corrupted payloads, and rapid event bursts.
3. **Tier 3 — Cross-Feature Combinations (Pairwise Interaction Coverage)**:
   - Pairwise interactions between asynchronous subsystems: e.g. career goal pivot during active remediation, live streaming mentor chat during event bus broadcasts, preset switching during quiz grading.
4. **Tier 4 — Real-World Application Scenarios (End-to-End Workload Journeys)**:
   - Multi-step end-user journeys mimicking complete learner workflows from onboarding, gap analysis, dynamic roadmap synthesis, quiz evaluations, remedial loops, to AI mentor debugging.

---

## 3. Coverage Thresholds & Compliance Summary
| Tier | Category | Minimum Required | Planned Count | Status |
|------|----------|-----------------|---------------|--------|
| Tier 1 | Feature Coverage | ≥5 per core feature (65+) | **70** | ✅ Exceeds Threshold |
| Tier 2 | Boundary & Corner Cases | ≥5 per boundary area (35+) | **35** | ✅ Meets Threshold |
| Tier 3 | Cross-Feature Combinations | ≥10 major pairs | **10** | ✅ Meets Threshold |
| Tier 4 | Real-World Scenarios | ≥5 realistic workflows | **5** | ✅ Meets Threshold |
| **Total** | **Full E2E Suite** | **≥115 tests** | **120** | ✅ 100% Compliant |

---

## 4. Feature Inventory & Mapping
| # | Feature | Requirements Source | Tier 1 Tests | Tier 2 Boundary | Tier 3 Pairwise | Tier 4 Scenarios |
|---|---------|---------------------|:------------:|:---------------:|:---------------:|:----------------:|
| 1 | PRD Document | ORIGINAL_REQUEST §R1 | 2 | - | - | - |
| 2 | UI/UX Design System | ORIGINAL_REQUEST §R1 | 2 | - | - | - |
| 3 | Core Dependencies & Tooling | ORIGINAL_REQUEST §R5 | 1 | - | - | - |
| 4 | Learner Profile Model | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 5 | Role Benchmarks & Gap Analysis | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 6 | Dual-Mode Persistence | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 7 | 1-Click Presets Fixtures | ORIGINAL_REQUEST §R5 | 5 | - | ✓ | ✓ |
| 8 | Multi-Provider LLM Engine | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 9 | Skill Analyzer Agent | ORIGINAL_REQUEST §R3 | 5 | - | ✓ | ✓ |
| 10 | Curriculum Planner Agent | ORIGINAL_REQUEST §R3 | 5 | - | ✓ | ✓ |
| 11 | Assessment Evaluator Agent | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 12 | AI Mentor Agent | ORIGINAL_REQUEST §R3 | 5 | - | ✓ | ✓ |
| 13 | Live Agent Feed & Event Bus | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 14 | Bi-directional Adaptive Loop | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 15 | Unified Split Layout UI Contracts | ORIGINAL_REQUEST §R5 | 5 | - | - | ✓ |
| 16 | Zero-Config Fallback Resilience | ORIGINAL_REQUEST §R5 | 5 | - | ✓ | ✓ |
| 17 | Final Verification & Runner | ORIGINAL_REQUEST §AC | - | - | - | ✓ |

---

## 5. Test Harness Architecture (`tests/e2e/harness/`)
The test harness provides an isolated, opaque-box runtime environment:

```
tests/e2e/
├── harness/
│   ├── index.ts              # Barrel export for TestHarness, context, and helpers
│   ├── types.ts              # Schemas for options, captures, results, and assertions
│   ├── test-harness.ts       # Global harness factory & singleton management
│   ├── context.ts            # Isolated per-test execution context (user, storage, event bus)
│   ├── storage-harness.ts    # Dual-mode storage manager with preset initialization
│   ├── llm-mock-harness.ts   # MockLLMStreamProvider controller & chunk collector
│   ├── event-bus-harness.ts  # EventBusSpy pub/sub subscriber, sequence matcher & waiter
│   ├── journey-helpers.ts    # High-level opaque user actions (applyPreset, submitQuiz, pivotGoal)
│   └── assertion-helpers.ts  # Domain assertions (assertGaps, assertRemedialModule, assertPassing)
├── tier1-features/           # Tier 1 Feature Coverage Suites (70 tests)
│   ├── profile.test.ts
│   ├── gap-analysis.test.ts
│   ├── storage.test.ts
│   ├── presets.test.ts
│   ├── llm-engine.test.ts
│   ├── agents.test.ts
│   ├── event-bus.test.ts
│   ├── adaptive-loop.test.ts
│   └── zero-config.test.ts
├── tier2-boundaries/         # Tier 2 Boundary & Corner Suites (35 tests)
│   ├── assessment-threshold.test.ts
│   ├── profile-boundaries.test.ts
│   ├── storage-boundaries.test.ts
│   └── event-bursts.test.ts
├── tier3-combinations/       # Tier 3 Cross-Feature Interaction Suites (10 tests)
│   └── pairwise-interactions.test.ts
├── tier4-workloads/          # Tier 4 Real-World Application Scenarios (5 tests)
│   └── user-journeys.test.ts
└── runner.ts                 # Standalone programmatic runner entrypoint
```

### Core Harness Interfaces
```typescript
export class TestHarness {
  public static async createContext(options?: TestContextOptions): Promise<TestContext>;
  public static resetGlobalSingletons(): void;
}

export class TestContext {
  public readonly userId: string;
  public readonly storage: IStorageAdapter;
  public readonly llm: ILLMClient;
  public readonly events: EventBusSpy;
  public readonly journey: JourneyHelpers;
  public readonly assert: AssertionHelpers;
  public async init(presetId?: string): Promise<void>;
  public async cleanup(): Promise<void>;
}
```

---

## 6. Comprehensive Test Case Catalog

### Tier 1: Feature Coverage (70 Test Cases)
- **Learner Profile (`profile.test.ts` - 5 tests)**:
  1. `E2E-T1-PROF-01`: Minimal profile creation, validation, and storage persistence.
  2. `E2E-T1-PROF-02`: Full profile schema with nested skills, certifications, and project portfolio.
  3. `E2E-T1-PROF-03`: Target career goal update and timestamp increment.
  4. `E2E-T1-PROF-04`: Skill list mutation (add, edit proficiency, remove).
  5. `E2E-T1-PROF-05`: Profile JSON serialization round-trip equality.
- **Role Benchmarks & Gap Analysis (`gap-analysis.test.ts` - 5 tests)**:
  6. `E2E-T1-GAP-01`: Canonical Full Stack Developer scenario (Python+SQL+HTML yields JS, React, Node.js gaps).
  7. `E2E-T1-GAP-02`: Quantitative readiness score calculation (weighted proficiency vs requirement).
  8. `E2E-T1-GAP-03`: Depth/proficiency gap detection (beginner skill vs advanced requirement).
  9. `E2E-T1-GAP-04`: Competency categorization into Frontend, Backend, Database, and DevOps taxonomies.
  10. `E2E-T1-GAP-05`: Benchmark registry query for all supported career roles.
- **Dual-Mode Persistence (`storage.test.ts` - 5 tests)**:
  11. `E2E-T1-STOR-01`: LocalStorageMockAdapter CRUD lifecycle in headless environment.
  12. `E2E-T1-STOR-02`: Automatic zero-config detection (fallback to local mock when Firebase keys omitted).
  13. `E2E-T1-STOR-03`: Firestore adapter configuration verification when credentials provided.
  14. `E2E-T1-STOR-04`: Graceful fallback to LocalStorageMockAdapter upon connection failure.
  15. `E2E-T1-STOR-05`: Multi-user storage isolation with no cross-user data leakage.
- **1-Click Presets Fixtures (`presets.test.ts` - 5 tests)**:
  16. `E2E-T1-PRES-01`: Canonical Full Stack Developer preset validation.
  17. `E2E-T1-PRES-02`: AI/ML Engineer preset structure and skill inventory.
  18. `E2E-T1-PRES-03`: DevOps Engineer preset structure and skill inventory.
  19. `E2E-T1-PRES-04`: Preset reset invocation (`resetToPreset`) restoring baseline state.
  20. `E2E-T1-PRES-05`: Immutability of preset fixtures against in-memory mutations.
- **Multi-Provider LLM Engine (`llm-engine.test.ts` - 5 tests)**:
  21. `E2E-T1-LLM-01`: Token-by-token streaming via `streamText()`.
  22. `E2E-T1-LLM-02`: Structured JSON generation conforming to target schema.
  23. `E2E-T1-LLM-03`: Provider identification (`mock` without keys, live provider with keys).
  24. `E2E-T1-LLM-04`: Deterministic domain generator output validation.
  25. `E2E-T1-LLM-05`: Pass-through of temperature, maxTokens, and system prompt options.
- **Specialized Agents Cluster (`agents.test.ts` - 20 tests)**:
  - *Skill Analyzer*:
    26. `E2E-T1-AG1-01`: End-to-end skill gap diagnostic synthesis.
    27. `E2E-T1-AG1-02`: Event bus emission (`started` -> `completed` with report payload).
    28. `E2E-T1-AG1-03`: Readiness score bounding (0 to 100 inclusive).
    29. `E2E-T1-AG1-04`: Prerequisite-first recommendation ordering.
    30. `E2E-T1-AG1-05`: Canonical normalization of skill aliases (e.g. JS -> JavaScript).
  - *Curriculum Planner*:
    31. `E2E-T1-AG2-01`: Personalized roadmap synthesis from gap analysis report.
    32. `E2E-T1-AG2-02`: Module content schema validation (lessons, snippets, exercises).
    33. `E2E-T1-AG2-03`: Curriculum generation event notification on event bus.
    34. `E2E-T1-AG2-04`: Targeted remedial module structure generation.
    35. `E2E-T1-AG2-05`: Total roadmap duration calculation.
  - *Assessment Evaluator*:
    36. `E2E-T1-AG3-01`: Dynamic quiz question synthesis matching module topics.
    37. `E2E-T1-AG3-02`: Quiz submission grading precision.
    38. `E2E-T1-AG3-03`: 70% passing threshold enforcement.
    39. `E2E-T1-AG3-04`: Identification of specific missed concepts.
    40. `E2E-T1-AG3-05`: Assessment result persistence and event broadcast.
  - *AI Mentor*:
    41. `E2E-T1-AG4-01`: Streaming conversational explanation delivery.
    42. `E2E-T1-AG4-02`: Socratic tutoring guidance rather than direct code answers.
    43. `E2E-T1-AG4-03`: Dynamic inclusion of learner profile context in mentor responses.
    44. `E2E-T1-AG4-04`: Career pivot guidance and transferable skill counseling.
    45. `E2E-T1-AG4-05`: Multi-turn conversational memory retention.
- **Live Event Bus & Feed (`event-bus.test.ts` - 5 tests)**:
  46. `E2E-T1-FEED-01`: Singleton guarantee across distinct imports.
  47. `E2E-T1-FEED-02`: Pub/sub registration, delivery, and unsubscription.
  48. `E2E-T1-FEED-03`: Chronological event sequence tracking in feed history.
  49. `E2E-T1-FEED-04`: Event metadata and agent attribution validation.
  50. `E2E-T1-FEED-05`: Immutability of dispatched event payloads.
- **Adaptive Remediation Loop (`adaptive-loop.test.ts` - 5 tests)**:
  51. `E2E-T1-ADAP-01`: Remedial module injection on assessment score < 70%.
  52. `E2E-T1-ADAP-02`: Standard progression on assessment score >= 70%.
  53. `E2E-T1-ADAP-03`: Amber badge and remedial metadata marking on injected module.
  54. `E2E-T1-ADAP-04`: Dynamic roadmap recalculation on career goal pivot.
  55. `E2E-T1-ADAP-05`: Preservation of mastered skills across career pivots.
- **UI Contracts & Zero-Config (`zero-config.test.ts` - 15 tests)**:
  56-60. `E2E-T1-UI-01` to `05`: Unified split layout state, preset switching, command hub and visual arena contracts.
  61-65. `E2E-T1-CFG-01` to `05`: Out-of-the-box zero-config execution, mock streaming resilience, offline persistence.
  66-70. `E2E-T1-SPEC-01` to `05`: Documentation and tooling verification (PRD, UI/UX Design System, package scripts).

---

### Tier 2: Boundary & Corner Cases (35 Test Cases)
- **Assessment Scoring Boundary (`assessment-threshold.test.ts` - 5 tests)**:
  71. `E2E-T2-BND-01`: Strict 69.9% vs 70.0% boundary condition verification (69.9% fails and triggers remediation; 70.0% passes).
  72. `E2E-T2-BND-02`: 0% score handling (all incorrect or empty answers) triggers foundational remedial module.
  73. `E2E-T2-BND-03`: 100% perfect score handling advances module with mastery badge.
  74. `E2E-T2-BND-04`: Negative or >100% malformed score inputs rejected with validation error.
  75. `E2E-T2-BND-05`: Single-question quiz boundary (0% or 100%).
- **Profile & Skill Extremes (`profile-boundaries.test.ts` - 10 tests)**:
  76. `E2E-T2-BND-06`: Blank learner profile with 0 skills, 0 projects, 0 certifications.
  77. `E2E-T2-BND-07`: Extremely large profile with 100+ skills handled without performance degradation.
  78. `E2E-T2-BND-08`: Unknown/unregistered target career role ID gracefully falls back.
  79. `E2E-T2-BND-09`: Special characters, HTML tags, and unicode in learner names and project descriptions.
  80. `E2E-T2-BND-10`: Duplicate skill entries normalized and deduplicated.
  81-85. `E2E-T2-BND-11` to `15`: Gap analysis with identical skill sets (100% readiness) vs 0% overlap.
- **Storage & Network Disconnects (`storage-boundaries.test.ts` - 10 tests)**:
  86. `E2E-T2-BND-16`: Mid-session Firestore disconnection falls back to local storage without data loss.
  87. `E2E-T2-BND-17`: Corrupted JSON payload in local storage gracefully recovered.
  88. `E2E-T2-BND-18`: Storage quota exhaustion simulation.
  89. `E2E-T2-BND-19`: Concurrent read/write race condition safety.
  90. `E2E-T2-BND-20`: Querying non-existent entity IDs returns null cleanly.
  91-95. `E2E-T2-BND-21` to `25`: LLM stream interruptions, client abort signals, and empty token chunks.
- **Event Bus Burst & Concurrency (`event-bursts.test.ts` - 10 tests)**:
  96. `E2E-T2-BND-26`: Burst of 500 events published within 50ms processed without drop or memory leak.
  97. `E2E-T2-BND-27`: Subscriber throwing unhandled error does not crash dispatcher or affect sibling subscribers.
  98. `E2E-T2-BND-28`: Rapid subscribe/unsubscribe cycles during active event dispatch.
  99. `E2E-T2-BND-29`: Multi-tenant event filtering strictly isolates events by `userId`.
  100-105. `E2E-T2-BND-30` to `35`: Recursive remediation prevention (max 3 consecutive remedial loops per module).

---

### Tier 3: Cross-Feature Combinations (10 Test Cases)
- `E2E-T3-XFT-01`: Career Goal Pivot While In Remedial State (mastered skills preserved, remedial module replaced by new role's curriculum).
- `E2E-T3-XFT-02`: Streaming AI Mentor Chat Emitting Live Feed Events concurrently.
- `E2E-T3-XFT-03`: 1-Click Preset Switching During Ongoing Assessment grading.
- `E2E-T3-XFT-04`: Live Event Feed Synchronized with Local Storage Persistence across page reload.
- `E2E-T3-XFT-05`: Simultaneous Execution of All 4 Specialized Agents on a shared profile.
- `E2E-T3-XFT-06`: Offline-to-Online Storage Sync upon delayed Firebase credentials initialization.
- `E2E-T3-XFT-07`: Multi-turn Mentor Chat Informing Gap Analysis Re-evaluation.
- `E2E-T3-XFT-08`: Consecutive Assessment Failures triggering multi-tier remediation hierarchy.
- `E2E-T3-XFT-09`: Custom Onboarding Wizard Flow driving dynamic roadmap generation.
- `E2E-T3-XFT-10`: Split Layout UI State Synchronization across Command Hub and Visual Arena.

---

### Tier 4: Real-World Application Scenarios (5 Workload Journeys)
- `E2E-T4-APP-01`: **Canonical Full Stack Developer Journey**:
  Onboard with Python+SQL+HTML -> Apply Full Stack preset -> Skill Analyzer diagnoses JavaScript, React, Node.js gaps (readiness ~40%) -> Curriculum Planner synthesizes 4-module roadmap -> Complete Module 1 -> Score 85% on Quiz 1 -> Progression confirmed.
- `E2E-T4-APP-02`: **Remedial Recovery Loop Journey**:
  Start DevOps Engineer roadmap -> Module 2 "Docker & Containerization" -> Take Assessment -> Score 55% (<70%) -> Adaptive Loop triggers -> Amber remedial module "Container Fundamentals & Dockerfile Lab" inserted immediately after Module 2 -> Complete remedial exercises -> Retake assessment -> Score 80% (>=70%) -> Next module unlocked.
- `E2E-T4-APP-03`: **Mid-Curriculum Career Pivot Journey**:
  Learner halfway through Full Stack roadmap decides to pivot to AI/ML Engineer -> Consult AI Mentor -> Confirm career pivot -> Skill Analyzer reconciles Python strengths -> Curriculum Planner rebuilds roadmap retaining completed fundamentals and injecting Linear Algebra, PyTorch, Model Evaluation.
- `E2E-T4-APP-04`: **Zero-Config Resilient Onboarding & Execution**:
  Fresh environment with zero API keys -> Launch platform -> Verify zero crash -> Create custom profile -> Stream mentor chat via MockLLMStreamProvider -> Generate quizzes -> Complete full lifecycle in offline mock mode.
- `E2E-T4-APP-05`: **High-Velocity Multi-Agent Collaboration Session**:
  Concurrent execution where Skill Analyzer, Curriculum Planner, Assessment Evaluator, and AI Mentor interact simultaneously -> Live agent feed streams real-time coordination events -> All state persisted cleanly without deadlock.

---

## 7. Test Runner & Execution Specification
- **Test Runner Command**:
  ```bash
  npm run test:e2e
  ```
  or directly:
  ```bash
  npx tsx scripts/run-e2e.ts
  ```
- **Vitest Integration Runner**:
  ```bash
  npx vitest run tests/e2e
  ```
- **Pass/Fail Semantics**:
  - Exit Code `0`: All 120 test cases pass.
  - Exit Code `1`: Any assertion failure, type violation, or unhandled exception.
  - Formatted console report outputting breakdown of Tier 1, Tier 2, Tier 3, and Tier 4 counts, elapsed execution time, and threshold compliance status.
