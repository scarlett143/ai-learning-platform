import {
  IStorageAdapter,
  LearnerProfile,
  Roadmap,
  AssessmentResult,
  AgentMessage,
} from './types';

export const PRESET_FULL_STACK: LearnerProfile = {
  id: 'preset-fullstack',
  name: 'Full Stack Candidate',
  targetRoleId: 'fullstack-dev',
  skills: [
    { id: 's1', name: 'Python', proficiency: 'intermediate', category: 'Backend' },
    { id: 's2', name: 'SQL', proficiency: 'intermediate', category: 'Database' },
    { id: 's3', name: 'HTML', proficiency: 'beginner', category: 'Frontend' },
  ],
  certifications: [
    { id: 'c1', name: 'Python for Data & Web', issuer: 'Coursera', issueDate: '2025-01-15' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Inventory Script',
      description: 'Python CLI script for managing inventory records with SQLite.',
      techStack: ['Python', 'SQL', 'SQLite'],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const PRESET_AI_ML: LearnerProfile = {
  id: 'preset-aiml',
  name: 'AI / ML Specialist',
  targetRoleId: 'aiml-engineer',
  skills: [
    { id: 's1', name: 'Python', proficiency: 'advanced', category: 'Machine Learning' },
    { id: 's2', name: 'Linear Algebra', proficiency: 'intermediate', category: 'Machine Learning' },
    { id: 's3', name: 'Pandas', proficiency: 'intermediate', category: 'Machine Learning' },
  ],
  certifications: [
    { id: 'c1', name: 'Machine Learning Specialization', issuer: 'DeepLearning.AI', issueDate: '2025-06-10' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Customer Churn Predictor',
      description: 'Trained random forest classifier on customer dataset using Pandas and Scikit-Learn.',
      techStack: ['Python', 'Pandas', 'Scikit-Learn'],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const PRESET_DEVOPS: LearnerProfile = {
  id: 'preset-devops',
  name: 'DevOps Aspirant',
  targetRoleId: 'devops-engineer',
  skills: [
    { id: 's1', name: 'Linux', proficiency: 'intermediate', category: 'DevOps' },
    { id: 's2', name: 'Bash', proficiency: 'intermediate', category: 'DevOps' },
    { id: 's3', name: 'Git', proficiency: 'intermediate', category: 'DevOps' },
  ],
  certifications: [
    { id: 'c1', name: 'Linux Fundamentals', issuer: 'Linux Foundation', issueDate: '2025-03-20' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Automated Backup Daemon',
      description: 'Bash automation script to backup Postgres dumps to remote object store.',
      techStack: ['Linux', 'Bash', 'Git'],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export class LocalStorageMockAdapter implements IStorageAdapter {
  private inMemoryStore: Map<string, string> = new Map();
  private mode: 'firestore' | 'local_mock' = 'local_mock';
  private liveConnected: boolean = false;
  private simulateQuotaError: boolean = false;
  private simulateDisconnectError: boolean = false;

  constructor(initialMode: 'firestore' | 'local_mock' = 'local_mock') {
    this.mode = initialMode;
    this.liveConnected = initialMode === 'firestore';
  }

  public getMode(): 'firestore' | 'local_mock' {
    return this.mode;
  }

  public isLiveConnected(): boolean {
    return this.liveConnected;
  }

  public setSimulateQuotaError(val: boolean): void {
    this.simulateQuotaError = val;
  }

  public setSimulateDisconnectError(val: boolean): void {
    this.simulateDisconnectError = val;
  }

  public setMode(mode: 'firestore' | 'local_mock', connected: boolean): void {
    this.mode = mode;
    this.liveConnected = connected;
  }

  // Low-level key-value access with SSR in-memory fallback
  public getItem(key: string): string | null {
    if (this.simulateDisconnectError && this.mode === 'firestore') {
      // simulate fallback to local mock
      this.mode = 'local_mock';
      this.liveConnected = false;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.inMemoryStore.get(key) ?? null;
      }
    }
    return this.inMemoryStore.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    if (this.simulateQuotaError) {
      const err = new Error('The quota has been exceeded.');
      err.name = 'QuotaExceededError';
      throw err;
    }

    if (this.simulateDisconnectError && this.mode === 'firestore') {
      this.mode = 'local_mock';
      this.liveConnected = false;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        this.inMemoryStore.set(key, value);
      }
    } else {
      this.inMemoryStore.set(key, value);
    }
  }

  public removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        this.inMemoryStore.delete(key);
      }
    } else {
      this.inMemoryStore.delete(key);
    }
  }

  public clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {
        this.inMemoryStore.clear();
      }
    } else {
      this.inMemoryStore.clear();
    }
  }

  // Contract Methods

  public async getProfile(userId: string): Promise<LearnerProfile | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('ValidationError: userId cannot be null or empty');
    }
    const raw = this.getItem(`profile:${userId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LearnerProfile;
    } catch {
      // Corrupt JSON recovery: auto-reinitialize with a safe default
      console.warn(`Corrupt profile JSON detected for ${userId}, restoring default profile.`);
      const defaultProf = this.clonePreset(PRESET_FULL_STACK, userId);
      await this.saveProfile(defaultProf);
      return defaultProf;
    }
  }

  public async saveProfile(profile: LearnerProfile): Promise<void> {
    if (!profile || !profile.id) {
      throw new Error('ValidationError: profile and profile.id are required');
    }
    const cloned = JSON.parse(JSON.stringify(profile));
    cloned.updatedAt = new Date().toISOString();
    this.setItem(`profile:${profile.id}`, JSON.stringify(cloned));
  }

  public async getRoadmap(userId: string): Promise<Roadmap | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('ValidationError: userId cannot be null or empty');
    }
    const raw = this.getItem(`roadmap:${userId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Roadmap;
    } catch {
      return null;
    }
  }

  public async saveRoadmap(roadmap: Roadmap): Promise<void> {
    if (!roadmap || !roadmap.userId) {
      throw new Error('ValidationError: roadmap and roadmap.userId are required');
    }
    const cloned = JSON.parse(JSON.stringify(roadmap));
    cloned.updatedAt = new Date().toISOString();
    this.setItem(`roadmap:${roadmap.userId}`, JSON.stringify(cloned));
  }

  public async getAssessments(userId: string): Promise<AssessmentResult[]> {
    if (!userId) return [];
    const raw = this.getItem(`assessments:${userId}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AssessmentResult[];
    } catch {
      return [];
    }
  }

  public async saveAssessmentResult(result: AssessmentResult): Promise<void> {
    if (!result || !result.userId) {
      throw new Error('ValidationError: result and result.userId are required');
    }
    const existing = await this.getAssessments(result.userId);
    const updated = [...existing.filter(a => a.id !== result.id), result];
    this.setItem(`assessments:${result.userId}`, JSON.stringify(updated));
  }

  public async getAgentFeed(userId: string): Promise<AgentMessage[]> {
    if (!userId) return [];
    const raw = this.getItem(`feed:${userId}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AgentMessage[];
    } catch {
      return [];
    }
  }

  public async appendAgentMessage(message: AgentMessage): Promise<void> {
    if (!message || !message.userId) {
      throw new Error('ValidationError: message and message.userId are required');
    }
    const existing = await this.getAgentFeed(message.userId);
    existing.push(message);
    this.setItem(`feed:${message.userId}`, JSON.stringify(existing));
  }

  public async resetToPreset(presetId: string, targetUserId: string = 'default-user'): Promise<LearnerProfile> {
    const canonical = this.resolvePreset(presetId);
    const profile = this.clonePreset(canonical, targetUserId);
    await this.saveProfile(profile);

    // Also seed a default initial roadmap corresponding to preset
    const initialRoadmap: Roadmap = {
      id: `roadmap-${targetUserId}`,
      userId: targetUserId,
      targetRoleId: profile.targetRoleId,
      modules: this.createDefaultModulesForRole(profile.targetRoleId),
      totalHours: 40,
      completedHours: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.saveRoadmap(initialRoadmap);

    return profile;
  }

  private resolvePreset(presetId: string): LearnerProfile {
    const normalized = presetId.toLowerCase().replace(/_/g, '-');
    if (normalized.includes('full') || normalized.includes('stack')) {
      return PRESET_FULL_STACK;
    }
    if (normalized.includes('ai') || normalized.includes('ml')) {
      return PRESET_AI_ML;
    }
    if (normalized.includes('devops') || normalized.includes('ops')) {
      return PRESET_DEVOPS;
    }
    return PRESET_FULL_STACK;
  }

  private clonePreset(preset: LearnerProfile, userId: string): LearnerProfile {
    const copy: LearnerProfile = JSON.parse(JSON.stringify(preset));
    copy.id = userId;
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    return copy;
  }

  private createDefaultModulesForRole(roleId: string): Roadmap['modules'] {
    if (roleId === 'fullstack-dev') {
      return [
        {
          id: 'mod-fs-1',
          title: 'Modern JavaScript & TypeScript Fundamentals',
          description: 'Deep dive into ES6+, scoping, closures, async/await, and strong typing.',
          category: 'Frontend',
          status: 'in_progress',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: 'l1', title: 'ES6+ Syntax & Closures', durationMinutes: 45 },
            { id: 'l2', title: 'Promises & Async/Await', durationMinutes: 60 },
          ],
          codeSnippets: [
            { language: 'typescript', code: 'const sum = (a: number, b: number): number => a + b;' },
          ],
          exercises: [{ id: 'ex1', prompt: 'Refactor callback spaghetti to async/await.' }],
          quiz: {
            id: 'quiz-mod-fs-1',
            moduleId: 'mod-fs-1',
            title: 'Modern JS Quiz',
            questions: [
              {
                id: 'q1',
                question: 'What is the event loop in JavaScript?',
                options: ['A thread pool', 'A call-stack coordinator', 'A database engine', 'A compiler'],
                correctIndex: 1,
                concept: 'Event Loop',
              },
            ],
          },
          order: 1,
        },
        {
          id: 'mod-fs-2',
          title: 'React 19 & Component Architecture',
          description: 'State management, custom hooks, Server Components, and Virtual DOM reconciliation.',
          category: 'Frontend',
          status: 'locked',
          isRemedial: false,
          estimatedHours: 14,
          lessons: [{ id: 'l3', title: 'React Hooks Deep Dive', durationMinutes: 60 }],
          codeSnippets: [{ language: 'typescript', code: 'const [state, setState] = useState(0);' }],
          exercises: [{ id: 'ex2', prompt: 'Build a custom useDebounce hook.' }],
          order: 2,
        },
        {
          id: 'mod-fs-3',
          title: 'Node.js & Express REST APIs',
          description: 'Building robust, authenticated HTTP services with middleware and error handling.',
          category: 'Backend',
          status: 'locked',
          isRemedial: false,
          estimatedHours: 14,
          lessons: [{ id: 'l4', title: 'Express Middleware & Routing', durationMinutes: 60 }],
          codeSnippets: [{ language: 'typescript', code: 'app.use(express.json());' }],
          exercises: [{ id: 'ex3', prompt: 'Create JWT authentication middleware.' }],
          order: 3,
        },
      ];
    } else if (roleId === 'aiml-engineer') {
      return [
        {
          id: 'mod-ai-1',
          title: 'Linear Algebra & Statistics for Machine Learning',
          description: 'Vector spaces, matrix decomposition, eigenvalues, and Bayesian probability.',
          category: 'Machine Learning',
          status: 'in_progress',
          isRemedial: false,
          estimatedHours: 15,
          lessons: [{ id: 'l1', title: 'Vector & Matrix Operations', durationMinutes: 60 }],
          codeSnippets: [{ language: 'python', code: 'import numpy as np\nv = np.array([1, 2, 3])' }],
          exercises: [{ id: 'ex1', prompt: 'Compute dot product and cosine similarity.' }],
          order: 1,
        },
        {
          id: 'mod-ai-2',
          title: 'PyTorch & Deep Neural Architectures',
          description: 'Tensors, autograd, backpropagation, and CNNs/Transformers.',
          category: 'Machine Learning',
          status: 'locked',
          isRemedial: false,
          estimatedHours: 20,
          lessons: [{ id: 'l2', title: 'Building Neural Networks with PyTorch', durationMinutes: 75 }],
          codeSnippets: [{ language: 'python', code: 'import torch.nn as nn\nclass Net(nn.Module): pass' }],
          exercises: [{ id: 'ex2', prompt: 'Implement a forward pass in PyTorch.' }],
          order: 2,
        },
      ];
    } else {
      // devops-engineer
      return [
        {
          id: 'mod-do-1',
          title: 'Containerization with Docker',
          description: 'Images, layers, Dockerfile optimization, multi-stage builds, and Docker Compose.',
          category: 'DevOps',
          status: 'in_progress',
          isRemedial: false,
          estimatedHours: 10,
          lessons: [{ id: 'l1', title: 'Dockerfile & Multi-stage Builds', durationMinutes: 50 }],
          codeSnippets: [{ language: 'dockerfile', code: 'FROM node:20-alpine\nWORKDIR /app' }],
          exercises: [{ id: 'ex1', prompt: 'Optimize container image from 1GB down to 100MB.' }],
          order: 1,
        },
        {
          id: 'mod-do-2',
          title: 'Kubernetes Cluster Orchestration',
          description: 'Pods, Deployments, Services, Ingress, and ConfigMaps.',
          category: 'DevOps',
          status: 'locked',
          isRemedial: false,
          estimatedHours: 15,
          lessons: [{ id: 'l2', title: 'Deployments & Service Routing', durationMinutes: 60 }],
          codeSnippets: [{ language: 'yaml', code: 'apiVersion: apps/v1\nkind: Deployment' }],
          exercises: [{ id: 'ex2', prompt: 'Write a rolling update deployment manifest.' }],
          order: 2,
        },
      ];
    }
  }
}
