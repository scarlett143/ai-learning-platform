import { GapAnalysisReport, Roadmap, RoadmapModule } from '@/types';
import { AgentEventBus } from '@/lib/event-bus';

export class CurriculumPlannerAgent {
  public static planRoadmap(report: GapAnalysisReport): Roadmap {
    const bus = AgentEventBus.getInstance();

    bus.recordFeedEvent({
      userId: report.userId,
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum-planner:started',
      message: `Synthesizing personalized milestone roadmap for ${report.targetRoleName}...`,
    });

    const modules: RoadmapModule[] = [];
    let orderCounter = 1;

    // Check if this is Full Stack Dev or includes JS / React / Node.js
    const missingNames = report.missingSkills.map(g => g.name.toLowerCase());

    if (missingNames.some(s => s.includes('javascript') || s.includes('js'))) {
      modules.push({
        id: `mod-${orderCounter}`,
        title: 'Modern JavaScript (ES6+) & Asynchronous Engine',
        description: 'Master lexical scoping, closures, promises, async/await, and event loops.',
        category: 'Frontend',
        status: 'in_progress',
        isRemedial: false,
        estimatedHours: 12,
        lessons: [
          { id: 'l1', title: 'ES6 Syntax, Destructuring & Rest Parameters', durationMinutes: 45 },
          { id: 'l2', title: 'Asynchronous JavaScript: Promises & Microtask Queue', durationMinutes: 60 },
          { id: 'l3', title: 'DOM Manipulation & Modern Event Handlers', durationMinutes: 50 },
        ],
        codeSnippets: [
          {
            language: 'javascript',
            code: 'const fetchData = async () => {\n  const res = await fetch("/api/data");\n  return res.json();\n};',
          },
        ],
        exercises: [
          { id: 'ex1', prompt: 'Implement a Promise-based debounce utility function.' },
        ],
        order: orderCounter++,
      });
    }

    if (missingNames.some(s => s.includes('react'))) {
      modules.push({
        id: `mod-${orderCounter}`,
        title: 'React 19 Component Architecture & Declarative State',
        description: 'Build modern user interfaces using functional components, hooks, and context.',
        category: 'Frontend',
        status: 'locked',
        isRemedial: false,
        estimatedHours: 18,
        lessons: [
          { id: 'l4', title: 'Component Lifecycle & Pure Functions', durationMinutes: 55 },
          { id: 'l5', title: 'State & Effects: useState, useEffect, useRef', durationMinutes: 70 },
          { id: 'l6', title: 'Custom Hooks & Context API for Shared State', durationMinutes: 60 },
        ],
        codeSnippets: [
          {
            language: 'tsx',
            code: 'export function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}',
          },
        ],
        exercises: [
          { id: 'ex2', prompt: 'Build an interactive search filter with debounced API queries.' },
        ],
        order: orderCounter++,
      });
    }

    if (missingNames.some(s => s.includes('node') || s.includes('backend'))) {
      modules.push({
        id: `mod-${orderCounter}`,
        title: 'Node.js & Express RESTful API Engineering',
        description: 'Construct scalable backend services, middleware, and database connectivity.',
        category: 'Backend',
        status: 'locked',
        isRemedial: false,
        estimatedHours: 15,
        lessons: [
          { id: 'l7', title: 'Node.js Event-Driven Architecture & Buffers', durationMinutes: 50 },
          { id: 'l8', title: 'Express Routing, Middleware & Error Handlers', durationMinutes: 65 },
          { id: 'l9', title: 'Database Connectivity & JWT Authentication', durationMinutes: 70 },
        ],
        codeSnippets: [
          {
            language: 'javascript',
            code: 'import express from "express";\nconst app = express();\napp.use(express.json());\napp.get("/health", (req, res) => res.json({ status: "ok" }));',
          },
        ],
        exercises: [
          { id: 'ex3', prompt: 'Create an authenticated CRUD endpoint with JWT verification middleware.' },
        ],
        order: orderCounter++,
      });
    }

    // Capstone Project Module
    modules.push({
      id: `mod-${orderCounter}`,
      title: 'Full-Stack Integration Capstone: Real-Time Collaborative Hub',
      description: 'Synthesize all newly acquired competencies into an end-to-end production application.',
      category: 'Full-Stack Integration',
      status: 'locked',
      isRemedial: false,
      estimatedHours: 25,
      lessons: [
        { id: 'l10', title: 'Full-Stack Architecture Planning & Data Contracts', durationMinutes: 60 },
        { id: 'l11', title: 'Connecting React Client to Node.js / SQL Backend', durationMinutes: 90 },
        { id: 'l12', title: 'Production Containerization & Cloud Deployment', durationMinutes: 60 },
      ],
      codeSnippets: [
        {
          language: 'bash',
          code: 'docker build -t fullstack-app . && docker run -p 3000:3000 fullstack-app',
        },
      ],
      exercises: [
        { id: 'ex4', prompt: 'Deploy the full application to Google Cloud Run and verify health endpoints.' },
      ],
      order: orderCounter++,
    });

    const roadmap: Roadmap = {
      id: `roadmap-${Date.now()}`,
      userId: report.userId,
      targetRoleId: report.targetRoleId,
      targetRoleName: report.targetRoleName,
      generatedAt: new Date().toISOString(),
      readinessScore: report.readinessScore,
      modules,
    };

    bus.recordFeedEvent({
      userId: report.userId,
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum-planner:completed',
      message: `Generated ${modules.length} tailored learning modules leading to Capstone Project.`,
      payload: roadmap,
    });

    return roadmap;
  }
}
