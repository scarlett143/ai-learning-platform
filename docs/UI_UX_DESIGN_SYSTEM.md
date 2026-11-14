# UI/UX Design System & Specification
## AI-Powered Adaptive Learning Platform

---

### Document Metadata
- **Document Version**: 1.0.0
- **Target Platform**: Next.js 15/16 App Router, React 19, Tailwind CSS v4
- **Aesthetic Benchmark**: High-Density Professional Developer Tooling (Linear / Vercel / Raycast aesthetic)
- **Anti-Slop Standards**: Strictly avoiding generic rounded placeholders, excessive floaty gradients, low-contrast text, unstyled borders, or empty card grids.

---

## 1. Visual Design Principles

1. **High Information Density & Purposeful Spacing**:
   - Engineered for engineers: immediate visibility of key metrics (readiness score, missing skills, active modules, agent activity) without unnecessary vertical scroll or decorative fluff.
   - Clean, mathematical hierarchy using 4px/8px rhythm (`gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6`).

2. **Distinct Architectural Layering**:
   - Depth created through border delineation and subtle surface contrasts (`border-border`, `bg-card`, `bg-card/50`) rather than heavy drop-shadows.
   - Subtle interactive micro-animations (Framer Motion spring transitions) providing visual feedback for unlocks, remediation alerts, and agent thoughts.

3. **Autonomous Agent Identity**:
   - Each of the 4 specialized AI agents carries a dedicated, consistent accent color and iconography across the application:
     * **Skill Analyzer**: Cyan (`#06b6d4`)
     * **Curriculum Planner**: Amber (`#f59e0b`)
     * **Assessment Evaluator**: Emerald (`#10b981`)
     * **AI Mentor**: Indigo (`#6366f1`)

4. **Bi-directional Feedback Clarity**:
   - System state transitions (such as falling below 70% in an assessment or changing a career goal) are visibly communicated with unmistakable color-coded badges, animated alert bars, and synchronized live feed items.

---

## 2. Color System & Design Tokens

The color palette is engineered with semantic token mapping supporting both Dark Mode (default for developer tools) and Light Mode.

### 2.1 Base Surface Tokens
| Token | Dark Mode (Default) | Light Mode | Tailwind Utility Class | Usage |
|---|---|---|---|---|
| `--canvas` | `#090d16` (Deep Charcoal) | `#f8fafc` (Slate 50) | `bg-background` | Global application canvas background |
| `--surface-card` | `#111827` (Gray 900) | `#ffffff` (Pure White) | `bg-card` | Primary container cards, modals, tabs |
| `--surface-subtle` | `#1e293b` (Slate 800) | `#f1f5f9` (Slate 100) | `bg-muted` | Secondary chips, code blocks, inactive tabs |
| `--border-subtle` | `#1f2937` (Gray 800) | `#e2e8f0` (Slate 200) | `border-border` | Standard card and section dividing lines |
| `--border-active` | `#374151` (Gray 700) | `#cbd5e1` (Slate 300) | `border-border-active` | Focused inputs, active module border |
| `--text-primary` | `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) | `text-foreground` | Main headers, active values, button labels |
| `--text-muted` | `#94a3b8` (Slate 400) | `#64748b` (Slate 500) | `text-muted-foreground`| Subtitles, timestamps, lesson counts |

### 2.2 Functional Semantic Tokens
| Role | Color Name | Hex Token | Dark Class | Light Class | UI Meaning |
|---|---|---|---|---|---|
| **Primary Brand** | Indigo | `#6366f1` / `#4f46e5` | `text-indigo-400 bg-indigo-500/10` | `text-indigo-600 bg-indigo-50` | Primary CTA, AI Mentor accent, focus ring |
| **Success / Passed** | Emerald | `#10b981` / `#059669` | `text-emerald-400 bg-emerald-500/10` | `text-emerald-700 bg-emerald-50` | Quiz score $\ge 70\%$, completed module, strengths |
| **Warning / Weakness**| Amber | `#f59e0b` / `#d97706` | `text-amber-400 bg-amber-500/10` | `text-amber-800 bg-amber-50` | Skill weakness (under-leveled), pending actions |
| **Remediation Trigger**| Purple | `#a855f7` / `#9333ea` | `text-purple-400 bg-purple-500/10` | `text-purple-800 bg-purple-50` | Remedial modules, adaptive loop interventions |
| **Destructive / Gap** | Rose | `#f43f5e` / `#e11d48` | `text-rose-400 bg-rose-500/10` | `text-rose-700 bg-rose-50` | Missing critical skill gap, failed quiz alert |
| **Informational** | Cyan | `#06b6d4` / `#0891b2` | `text-cyan-400 bg-cyan-500/10` | `text-cyan-700 bg-cyan-50` | Diagnostic logs, Skill Analyzer accent |

### 2.3 Agent Distinct Color Palette
Every agent has an immutable signature color used in the Live Agent Feed, modal avatars, and event tags:
```
+-------------------------------------------------------------------------------+
| AGENT NAME           | HEX CODE  | BADGE STYLE (Dark Mode)                    |
+----------------------+-----------+--------------------------------------------+
| Skill Analyzer       | #06b6d4   | bg-cyan-500/15 text-cyan-300 border-cyan-500/30 |
| Curriculum Planner   | #f59e0b   | bg-amber-500/15 text-amber-300 border-amber-500/30 |
| Assessment Evaluator | #10b981   | bg-emerald-500/15 text-emerald-300 border-emerald-500/30 |
| AI Mentor            | #6366f1   | bg-indigo-500/15 text-indigo-300 border-indigo-500/30 |
+-------------------------------------------------------------------------------+
```

---

## 3. Typography Scale & Hierarchy

Using standard sans-serif (`Geist Sans` / `Inter`) paired with clean monospace (`Geist Mono` / `JetBrains Mono` / `Fira Code`):

| Level | Size | Weight | Line Height | Tracking | Tailwind Utility | Example Usage |
|---|---|---|---|---|---|---|
| **Display / Hero** | 30px / 1.875rem | 700 (Bold) | 1.2 | `-0.025em` | `text-2xl md:text-3xl font-bold tracking-tight` | Header title, Readiness score percentage |
| **Section Title** | 20px / 1.25rem | 600 (Semibold) | 1.3 | `-0.015em` | `text-xl font-semibold` | "Career Gap Analysis", "Active Roadmap" |
| **Card Header** | 16px / 1.0rem | 600 (Semibold) | 1.4 | `normal` | `text-base font-semibold` | "Roadmap Module 1", "Assessment Results" |
| **Body Regular** | 14px / 0.875rem | 400 (Regular) | 1.5 | `normal` | `text-sm text-foreground` | Lesson descriptions, chat messages, explanations |
| **Subhead / Muted** | 13px / 0.8125rem | 400 (Regular) | 1.4 | `normal` | `text-xs text-muted-foreground` | Timestamps, author badges, lesson count |
| **Pill / Badge** | 11px / 0.6875rem | 600 (Semibold) | 1.0 | `0.05em` | `text-[11px] font-semibold uppercase tracking-wider` | "REMEDIATION", "CRITICAL GAP", "COMPLETED" |
| **Code / Mono** | 13px / 0.8125rem | 500 (Medium) | 1.5 | `normal` | `font-mono text-xs bg-slate-950 p-2 rounded` | Code snippets, JSON payloads, terminal outputs |

---

## 4. Component Architecture

```
src/components/
├── navigation/
│   └── Header.tsx              # Top bar: Brand, Status Badge, Presets, Theme Toggle
├── presets/
│   └── PresetSelector.tsx      # Quick 1-click preset pills & custom wizard trigger
├── layout/
│   └── SplitLayout.tsx         # 45% (Left: Hub) / 55% (Right: Arena) flex/grid container
├── profile/
│   ├── ProfileCard.tsx         # Skills list with proficiency chips, certs, projects
│   └── OnboardingModal.tsx     # Step-by-step wizard for custom learner profile creation
├── analytics/
│   ├── GapAnalysisCard.tsx     # Circular match score, Strengths, Weaknesses, Missing Gaps
│   └── RoleSelector.tsx        # Career goal switcher triggering GOAL_CHANGED event
├── roadmap/
│   ├── RoadmapView.tsx         # Module node visualizer with status & connector lines
│   ├── ModuleCard.tsx          # Card with hours, lesson list toggle, "Take Quiz" action
│   └── LessonReaderModal.tsx   # Markdown lesson viewer with code snippets
├── assessment/
│   ├── AssessmentModal.tsx     # 5-question interactive quiz modal
│   ├── ResultCard.tsx          # Pass/Fail alert, percentage score, concept breakdowns
│   └── RemediationAlert.tsx    # Adaptive loop notification when score < 70%
├── mentor/
│   ├── ChatInterface.tsx       # AI Mentor streaming conversational interface
│   └── QuickPrompts.tsx        # Context-sensitive quick suggestion chips
├── feed/
│   ├── AgentFeed.tsx           # Chronological multi-agent collaboration stream
│   └── FeedEventCard.tsx       # Single agent event with expandable details & metadata
└── ui/
    ├── Badge.tsx               # Reusable status/agent badge
    ├── Button.tsx              # Primary, secondary, outline, ghost variants
    ├── Card.tsx                # Base surface container with clean borders
    ├── Modal.tsx               # Accessible dialog container (headless/framer)
    ├── ProgressBar.tsx         # Animated progress bar
    └── Tabs.tsx                # Left hub tab switcher [Profile | AI Mentor | Feed]
```

---

## 5. 1-Click Presets Bar Specifications

The header features an instant 1-click preset bar enabling immediate verification of key scenarios without typing:

```
[⚡ Full Stack Transition]  [🤖 AI/ML Engineer Pivot]  [☁️ Cloud DevOps Architect]  [✨ Custom Onboarding]
```

### 5.1 Preset Buttons & Interaction Behavior
1. **⚡ Full Stack Transition (Canonical Benchmark)**:
   - Sets Profile: Alex Chen (Python Advanced, SQL Intermediate, HTML Beginner).
   - Target Role: Full Stack Developer.
   - Triggers: Skill Analyzer runs, outputs Readiness ~32%, flags JavaScript, React, and Node.js as Critical Gaps.
   - Generates: 5-stage Full Stack Roadmap.
2. **🤖 AI/ML Engineer Pivot**:
   - Sets Profile: Priya Sharma (Python Advanced, Pandas/NumPy Intermediate, SQL Intermediate).
   - Target Role: AI/ML Engineer.
   - Triggers: Flags PyTorch, Vector DBs, LLM Orchestration, MLOps as gaps.
3. **☁️ Cloud DevOps Architect**:
   - Sets Profile: Marcus Vance (Linux Advanced, Bash Scripting, Git).
   - Target Role: Cloud DevOps Engineer.
   - Triggers: Flags Kubernetes, Terraform, AWS/GCP, Prometheus as gaps.
4. **✨ Custom Onboarding Wizard**:
   - Opens multi-step modal to build a profile from scratch, pick custom target role, and trigger the live agent cluster.

---

## 6. Unified Split-Layout Wireframe & Layout Specifications

### 6.1 Desktop Split-Layout (45% Hub / 55% Arena)
On screen widths $\ge 1024\text{px}$ (`lg:`):
- **Left Panel (45%)**: Persistent interactive command hub. Allows switching between **Profile & Goals**, **AI Mentor (Streaming Chat)**, and **Live Agent Feed**.
- **Right Panel (55%)**: High-visibility execution arena. Top section displays **Career Gap Analysis Radar & Strengths/Gaps**, middle section displays **Roadmap Visualizer & Module Cards**, and bottom displays **Remediation Alerts / Assessment Actions**.

### 6.2 Mobile Responsive Collapse
On screen widths $< 1024\text{px}$:
- The layout stacks vertically into a single cohesive column.
- A secondary top tab bar switches between `[Visual Arena & Roadmap]` and `[Interactive Hub & AI Mentor]`.

### 6.3 Comprehensive ASCII Wireframe

```
+==================================================================================================================+
|  [AI-LEARNING-PLATFORM]  |  ● Cloud Sync (Firestore)  |  PRESETS: [⚡ Full Stack] [🤖 AI/ML] [☁️ DevOps] [✨ Custom]  | [🌙/☀️] |
+==================================================================================================================+
|                                                                                                                  |
|  LEFT PANEL: INTERACTION HUB (45% Width)               |  RIGHT PANEL: VISUAL ARENA & EXECUTION (55% Width)      |
|  ----------------------------------------------------  |  -----------------------------------------------------  |
|  [ TABS: (1) Profile & Goals | (2) AI Mentor | (3) Feed ]|  SECTION 1: CAREER GAP ANALYSIS & MATCH RADAR           |
|                                                        |  +---------------------------------------------------+  |
|  -- IF TAB 1: PROFILE & GOALS ACTIVE --                |  | Target Goal: [ Full Stack Developer v ]           |  |
|  +--------------------------------------------------+  |  | Overall Readiness Match: [ 32% ] (Circle/Bar)    |  |
|  | Alex Chen                                        |  |  +-------------------------------------------------+ |  |
|  | Target: Full Stack Developer (Weekly: 10 hrs)    |  |  | STRENGTHS (Met/Exceeded):                       |  |
|  | Current Skills:                                   |  |  |  • Python (Advanced)  • SQL (Intermediate)      |  |
|  |  [Python: Advanced]  [SQL: Intermed] [HTML: Beg] |  |  | WEAKNESSES (Under-Leveled):                     |  |
|  | Certifications:                                  |  |  |  • HTML/CSS (Beginner -> Intermed required)     |  |
|  |  • AWS Certified Cloud Practitioner              |  |  | CRITICAL MISSING GAPS:                           |  |
|  | Projects:                                        |  |  |  [!] JavaScript  [!] React  [!] Node.js          |  |
|  |  • Data ETL Pipeline (Python + PostgreSQL)       |  |  +-------------------------------------------------+ |  |
|  +--------------------------------------------------+  |  +---------------------------------------------------+  |
|                                                        |                                                         |
|  -- IF TAB 2: AI MENTOR (STREAMING CHAT) ACTIVE --     |  SECTION 2: INTERACTIVE LEARNING ROADMAP                |
|  +--------------------------------------------------+  |  +---------------------------------------------------+  |
|  | [AI Mentor Avatar (Indigo)]                       |  |  | [ROADMAP PROGRESS: 1/5 Modules Completed]         |  |
|  | "Welcome Alex! I see you know Python and SQL.    |  |  |                                                   |  |
|  |  To become a Full Stack Developer, our priority |  |  | [Module 1: JavaScript & ES6 Deep Dive]           |  |
|  |  is mastering modern JavaScript and React.       |  |  |  Status: COMPLETED (Score: 85%)                   |  |
|  |  Let's start with asynchronous promises!"        |  |  |                                                   |  |
|  |                                                  |  |  | [Module 2: React State & Component Architecture]  |  |
|  | Suggestions:                                     |  |  |  Status: IN-PROGRESS (12 hrs estimated)          |  |
|  |  [Explain Closures] [How do Promises work?]       |  |  |  [Take Module Assessment Quiz]                   |  |
|  | ------------------------------------------------ |  |  |                                                   |  |
|  | Input: [ Ask your AI Mentor a question... ] [Send]|  |  |                                                   |  |
|  +--------------------------------------------------+  |  | [!] REMEDIAL MODULE (If Quiz < 70% Triggered):    |  |
|                                                        |  |  [REMEDIATION: React Hooks & Memory Leaks]        |  |
|  -- IF TAB 3: LIVE AGENT COLLABORATION FEED --         |  |   Status: READY TO RETRY (Amber Badge)           |  |
|  +--------------------------------------------------+  |  |                                                   |  |
|  | 10:14:02 [Skill Analyzer] (Cyan)                  |  |  | [Module 3: Node.js & Express REST APIs] (LOCKED)  |  |
|  |  Evaluated profile against Full Stack benchmark.  |  |  | [Module 4: PostgreSQL & Prisma ORM] (LOCKED)      |  |
|  | 10:14:03 [Curriculum Planner] (Amber)             |  |  | [Module 5: Full Stack Capstone Project] (LOCKED)  |  |
|  |  Synthesized 5-module progressive roadmap.        |  |  +---------------------------------------------------+  |
|  | 10:14:05 [Assessment Evaluator] (Emerald)         |  |                                                         |
|  |  Generated 5-question diagnostic quiz.            |  |  SECTION 3: REMEDIATION ALERT BANNER (Conditional)     |
|  +--------------------------------------------------+  |  +---------------------------------------------------+  |
|                                                        |  | [!] RE-EVALUATION REQUIRED (< 70% Threshold)      |  |
|                                                        |  | Module 2 scored 60%. A focused remedial module    |  |
|                                                        |  | has been injected into your roadmap. Retake quiz. |  |
|                                                        |  +---------------------------------------------------+  |
+==================================================================================================================+
```

---

## 7. Modal & Overlay Specifications

### 7.1 Assessment Quiz Modal (`AssessmentModal.tsx`)
- **Dimensions**: Centered modal, max-width `max-w-2xl`, full height scrollable on mobile.
- **Header**: Shows Module Name, Question Counter (`Question 3 of 5`), and Progress Bar.
- **Body**:
  * Question prompt in clear, legible type (`text-base font-medium`).
  * Optional Syntax-highlighted code block in dark monospace container.
  * 4 selectable radio options styled as interactive surface cards (`border border-border hover:border-indigo-500 cursor-pointer p-3 rounded-lg`).
- **Footer**:
  * Action Button: `Next Question ->` or `Submit Assessment (Evaluate)`.
- **Result State (`ResultCard.tsx`)**:
  * If $\ge 70\%$: Displays green celebration banner, score chip (e.g. `85% PASS`), correct question count, and `Unlock Next Module` button.
  * If $< 70\%$: Displays amber alert banner, score chip (e.g. `60% FAILED - REMEDIATION REQUIRED`), list of missed concepts, and explanation of the newly injected remedial module.

### 7.2 Onboarding Wizard Modal (`OnboardingModal.tsx`)
- **Step 1: Identity & Target Role**: Name, email, career target select (`Full Stack`, `AI/ML`, `DevOps`).
- **Step 2: Skills & Proficiency**: Dynamic tag input with level selector (`Beginner`, `Intermediate`, `Advanced`, `Expert`).
- **Step 3: Certifications & Projects**: Add title, tech stack, and experience.
- **Step 4: Real-Time Synthesis**: Shows animated agent thought cards as Skill Analyzer and Curriculum Planner compute the profile and roadmap.

---

*End of UI/UX Design System Document.*
