import { GapAnalysisReport, Roadmap, RoadmapModule, SkillGap } from '@/types';
import { AgentEventBus } from '@/lib/event-bus';

export class CurriculumPlannerAgent {
  public static planRoadmap(report: GapAnalysisReport): Roadmap {
    const bus = AgentEventBus.getInstance();

    bus.recordFeedEvent({
      userId: report.userId,
      agentName: 'Curriculum Planner',
      type: 'agent:curriculum-planner:started',
      message: `Synthesizing personalized milestone roadmap for ${report.targetRoleName || 'target role'}...`,
    });

    const modules: RoadmapModule[] = [];
    let orderCounter = 1;
    const handledSkills = new Set<string>();

    const missingSkills: SkillGap[] = report.missingSkills || [];

    // Helper to generate domain-specific modules for benchmark gaps
    for (const gap of missingSkills) {
      const name = gap.name.toLowerCase();
      if (handledSkills.has(gap.name)) continue;

      if (name.includes('javascript') || name.includes('es6') || name === 'js') {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Modern JavaScript (ES6+) & Asynchronous Engine',
          description: 'Master lexical scoping, closures, promises, async/await, and event loops.',
          category: gap.category || 'Frontend',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'ES6 Syntax, Destructuring & Rest Parameters', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Asynchronous JavaScript: Promises & Microtask Queue', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'DOM Manipulation & Modern Event Handlers', durationMinutes: 50 },
          ],
          codeSnippets: [
            {
              language: 'javascript',
              code: 'const fetchData = async () => {\n  const res = await fetch("/api/data");\n  return res.json();\n};',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Implement a Promise-based debounce utility function.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('react')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'React 19 Component Architecture & Declarative State',
          description: 'Build modern user interfaces using functional components, hooks, and context.',
          category: gap.category || 'Frontend',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 18,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Component Lifecycle & Pure Functions', durationMinutes: 55 },
            { id: `l-${orderCounter}-2`, title: 'State & Effects: useState, useEffect, useRef', durationMinutes: 70 },
            { id: `l-${orderCounter}-3`, title: 'Custom Hooks & Context API for Shared State', durationMinutes: 60 },
          ],
          codeSnippets: [
            {
              language: 'tsx',
              code: 'export function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Build an interactive search filter with debounced API queries.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('node') || (name.includes('backend') && !name.includes('python'))) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Node.js & Express RESTful API Engineering',
          description: 'Construct scalable backend services, middleware, and database connectivity.',
          category: gap.category || 'Backend',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 15,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Node.js Event-Driven Architecture & Buffers', durationMinutes: 50 },
            { id: `l-${orderCounter}-2`, title: 'Express Routing, Middleware & Error Handlers', durationMinutes: 65 },
            { id: `l-${orderCounter}-3`, title: 'Database Connectivity & JWT Authentication', durationMinutes: 70 },
          ],
          codeSnippets: [
            {
              language: 'javascript',
              code: 'import express from "express";\nconst app = express();\napp.use(express.json());\napp.get("/health", (req, res) => res.json({ status: "ok" }));',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Create an authenticated CRUD endpoint with JWT verification middleware.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('python')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Advanced Python & Asynchronous Data Computation',
          description: 'Master advanced Python 3.12+, async I/O coroutines, vectorized array computing, and packaging.',
          category: gap.category || 'Backend',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 14,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Advanced Typing, Generators & Context Managers', durationMinutes: 50 },
            { id: `l-${orderCounter}-2`, title: 'AsyncIO Event Loops & High-Concurrency Tasks', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'Vectorized Operations & Numerical Profiling', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'python',
              code: 'import asyncio\n\nasync def process_batch(items: list[str]) -> list[dict]:\n    tasks = [asyncio.create_task(fetch_feature(i)) for i in items]\n    return await asyncio.gather(*tasks)',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Implement an asynchronous pipeline processing concurrent data batches with backpressure.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('pytorch') || name.includes('tensorflow') || name.includes('deep learning')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'PyTorch Deep Learning & Neural Architecture Design',
          description: 'Construct, train, and optimize deep neural networks, custom loss functions, and GPU pipelines.',
          category: gap.category || 'Machine Learning',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 20,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Tensors, Autograd & Computation Graph Mechanics', durationMinutes: 60 },
            { id: `l-${orderCounter}-2`, title: 'Custom nn.Module Layers, Activations & Losses', durationMinutes: 75 },
            { id: `l-${orderCounter}-3`, title: 'Distributed GPU Training & Hyperparameter Tuning', durationMinutes: 65 },
          ],
          codeSnippets: [
            {
              language: 'python',
              code: 'import torch\nimport torch.nn as nn\n\nclass ResidualBlock(nn.Module):\n    def __init__(self, channels: int):\n        super().__init__()\n        self.conv = nn.Sequential(nn.Conv2d(channels, channels, 3, padding=1), nn.ReLU())\n    def forward(self, x): return x + self.conv(x)',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Train a convolutional neural network with residual connections and early stopping.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('llm') || name.includes('rag') || name.includes('orchestration')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'LLM Orchestration, Vector RAG & Autonomous Multi-Agent Systems',
          description: 'Engineer high-precision prompt architectures, semantic embeddings, and tool-augmented agent loops.',
          category: gap.category || 'Artificial Intelligence',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 16,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Prompt Schemas, Few-Shot Demonstrations & Output Parsing', durationMinutes: 50 },
            { id: `l-${orderCounter}-2`, title: 'Vector Stores, Hybrid Search & Semantic RAG', durationMinutes: 70 },
            { id: `l-${orderCounter}-3`, title: 'Multi-Agent Tool Calling & ReAct Execution Loops', durationMinutes: 60 },
          ],
          codeSnippets: [
            {
              language: 'typescript',
              code: 'interface AgentTool {\n  name: string;\n  description: string;\n  execute(params: Record<string, unknown>): Promise<string>;\n}',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Build a multi-agent orchestrator with dynamic tool dispatch and schema validation.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('linear algebra') || name.includes('calculus') || name.includes('math') || name.includes('statistics')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Applied Linear Algebra & Numerical Mathematics for ML',
          description: 'Ground AI architectures in vector spaces, matrix factorizations, eigenvalues, and gradient descent.',
          category: gap.category || 'Fundamentals',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Vector Spaces, Dot Products & Cosine Similarity', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Matrix Transformations, SVD & PCA Dimensionality Reduction', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'Multivariate Gradient Descent & Optimization Curvature', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'python',
              code: 'import numpy as np\n\ndef cosine_similarity(u: np.ndarray, v: np.ndarray) -> float:\n    return float(np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v)))',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Implement Principal Component Analysis (PCA) using SVD from scratch in NumPy.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('preprocessing') || name.includes('pandas') || name.includes('feature')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Data Preprocessing & Feature Engineering Pipelines',
          description: 'Cleanse raw telemetry datasets, engineer domain signals, and handle missing values at scale.',
          category: gap.category || 'Data Science',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 10,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Data Cleaning, Outlier Detection & Imputation', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Feature Scaling, Normalization & Categorical Encodings', durationMinutes: 50 },
            { id: `l-${orderCounter}-3`, title: 'Automated Sklearn Transformation Pipelines', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'python',
              code: 'from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\n\npipe = Pipeline([\n    ("scaler", StandardScaler()),\n])',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Construct an end-to-end scikit-learn ColumnTransformer handling numeric and categorical features.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('docker') || name.includes('container')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Docker Containerization & Production Image Optimization',
          description: 'Master reproducible container runtime environments, multi-stage builds, and minimal distroless images.',
          category: gap.category || 'DevOps',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Container Fundamentals & Linux Namespaces/Cgroups', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Multi-Stage Dockerfiles & Layer Cache Optimization', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'Container Networking, Volumes & Docker Compose Environments', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'dockerfile',
              code: 'FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM gcr.io/distroless/nodejs20-debian12\nWORKDIR /app\nCOPY --from=builder /app ./',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Author a hardened, non-root multi-stage Dockerfile with healthchecks.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('kubernetes') || name.includes('k8s')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Kubernetes Multi-Cluster Orchestration & Cloud Native Systems',
          description: 'Deploy, scale, and manage declarative state across Pods, Deployments, Services, and Ingresses.',
          category: gap.category || 'DevOps',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 18,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Pod Topology, ReplicaSets & Declarative Deployments', durationMinutes: 55 },
            { id: `l-${orderCounter}-2`, title: 'Cluster Networking, Services, Ingress & DNS Resolution', durationMinutes: 65 },
            { id: `l-${orderCounter}-3`, title: 'ConfigMaps, Secrets, PVCs & Helm Package Management', durationMinutes: 60 },
          ],
          codeSnippets: [
            {
              language: 'yaml',
              code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: microservice\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: app\n        image: app:v1.0.0',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Configure an auto-scaling Kubernetes Deployment with HorizontalPodAutoscaler and readiness probes.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('ci/cd') || name.includes('cicd') || name.includes('pipeline')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'CI/CD Automated Delivery Pipelines & GitOps',
          description: 'Construct automated verification gates, vulnerability scanning, and zero-downtime deployment workflows.',
          category: gap.category || 'DevOps',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 14,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'GitHub Actions Workflows, Triggers & Matrix Builds', durationMinutes: 50 },
            { id: `l-${orderCounter}-2`, title: 'Automated Test Matrix, Linting & Security Scans', durationMinutes: 55 },
            { id: `l-${orderCounter}-3`, title: 'Canary Deployments, Blue/Green Releases & GitOps Sync', durationMinutes: 65 },
          ],
          codeSnippets: [
            {
              language: 'yaml',
              code: 'name: CI/CD\non: [push]\njobs:\n  build-and-test:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - run: npm ci && npm test',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Build a multi-stage GitHub Actions workflow deploying to staging upon PR merge.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('terraform') || name.includes('iac')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Terraform Infrastructure as Code & State Architecture',
          description: 'Provision declarative cloud infrastructure with reusable modules, state locking, and plan verifications.',
          category: gap.category || 'Cloud',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 14,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'HCL Syntax, Providers & Resource Graph Mechanics', durationMinutes: 50 },
            { id: `l-${orderCounter}-2`, title: 'Remote State Backends, State Locking & Workspaces', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'Modular Infrastructure & Variable Validations', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'hcl',
              code: 'resource "aws_s3_bucket" "artifacts" {\n  bucket = "prod-platform-artifacts"\n  force_destroy = false\n}',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Author a reusable Terraform module provisioning a secure VPC with public/private subnets.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('aws') || name.includes('cloud')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Cloud Infrastructure Architecture & AWS Core Services',
          description: 'Architect fault-tolerant systems leveraging managed compute, IAM least privilege, and serverless backends.',
          category: gap.category || 'Cloud',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 15,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'AWS Global Infrastructure, VPC Networking & Subnets', durationMinutes: 55 },
            { id: `l-${orderCounter}-2`, title: 'IAM Roles, Policies, OIDC & Security Best Practices', durationMinutes: 65 },
            { id: `l-${orderCounter}-3`, title: 'Serverless Functions, SQS/SNS Queues & Event-Driven Clouds', durationMinutes: 60 },
          ],
          codeSnippets: [
            {
              language: 'json',
              code: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["s3:GetObject"],\n    "Resource": "arn:aws:s3:::app-data/*"\n  }]\n}',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Design an event-driven serverless architecture using S3 triggers and Lambda functions.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('linux') || name.includes('shell')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Linux Systems Engineering & Shell Automation',
          description: 'Master POSIX shell scripting, systemd daemons, process supervision, and networking diagnostics.',
          category: gap.category || 'DevOps',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 10,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Bash Scripting, Pipes, Redirections & Exit Trapping', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Process Lifecycle, Signals, Systemd Services & Cron', durationMinutes: 55 },
            { id: `l-${orderCounter}-3`, title: 'Network Diagnostics with curl, netstat, iptables & strace', durationMinutes: 50 },
          ],
          codeSnippets: [
            {
              language: 'bash',
              code: '#!/usr/bin/env bash\nset -euo pipefail\ntrap "echo Error occurred" ERR\necho "Running system audit..."',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Create an automated bash health-check script that monitors port availability and restarts failed systemd services.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else if (name.includes('sql') || name.includes('database')) {
        modules.push({
          id: `mod-${orderCounter}`,
          title: 'Relational Database Engineering & Query Optimization',
          description: 'Design normalized schemas, compose complex relational queries, and optimize query execution plans.',
          category: gap.category || 'Database',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: `l-${orderCounter}-1`, title: 'Relational Modeling, Foreign Keys & Constraints', durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: 'Complex JOINs, Window Functions & CTE Queries', durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: 'B-Tree Indexing, EXPLAIN ANALYZE & Query Optimization', durationMinutes: 55 },
          ],
          codeSnippets: [
            {
              language: 'sql',
              code: 'SELECT u.id, u.name, COUNT(p.id) as project_count\nFROM users u\nLEFT JOIN projects p ON u.id = p.user_id\nGROUP BY u.id, u.name\nHAVING COUNT(p.id) > 2;',
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: 'Analyze a slow query execution plan with EXPLAIN ANALYZE and add optimal composite indexes.' },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      } else {
        // Universal fallback for any other custom skill gap
        modules.push({
          id: `mod-${orderCounter}`,
          title: `${gap.name} Mastery: Core Principles & Application`,
          description: `Comprehensive module covering ${gap.name} competencies required for ${report.targetRoleName || 'target role'}.`,
          category: gap.category || 'Specialized',
          status: orderCounter === 1 ? 'in_progress' : 'locked',
          isRemedial: false,
          estimatedHours: 12,
          lessons: [
            { id: `l-${orderCounter}-1`, title: `${gap.name} Fundamentals & Architecture`, durationMinutes: 45 },
            { id: `l-${orderCounter}-2`, title: `Advanced Patterns & Best Practices in ${gap.name}`, durationMinutes: 60 },
            { id: `l-${orderCounter}-3`, title: `Production Engineering & Resilience with ${gap.name}`, durationMinutes: 50 },
          ],
          codeSnippets: [
            {
              language: 'typescript',
              code: `// Practical application of ${gap.name}\nexport function executeTask() {\n  console.log("Executing ${gap.name} production workflow");\n}`,
            },
          ],
          exercises: [
            { id: `ex-${orderCounter}-1`, prompt: `Design and implement a working project module demonstrating ${gap.name} in action.` },
          ],
          order: orderCounter++,
        });
        handledSkills.add(gap.name);
      }
    }

    // Determine Role-Specific Capstone Project Module
    const targetRole = (report.targetRoleId || report.targetRoleName || '').toLowerCase();
    let capstoneTitle = 'Full-Stack Integration Capstone: Real-Time Collaborative Hub';
    let capstoneDesc = 'Synthesize all newly acquired competencies into an end-to-end production application.';
    let capstoneCategory = 'Full-Stack Integration';
    let capstoneSnippet = 'docker build -t fullstack-app . && docker run -p 3000:3000 fullstack-app';
    let capstonePrompt = 'Deploy the full application to Google Cloud Run and verify health endpoints.';

    if (targetRole.includes('aiml') || targetRole.includes('ai') || targetRole.includes('machine learning')) {
      capstoneTitle = 'AI/ML Engineering Capstone: Autonomous Multi-Modal Intelligence Pipeline';
      capstoneDesc = 'Design, train, optimize, and deploy an end-to-end multi-modal inference pipeline with autonomous agent tools and vector retrieval.';
      capstoneCategory = 'Machine Learning & Production AI';
      capstoneSnippet = 'python -m pipeline.train --model resnet --dataset production && uvicorn serve:app --workers 4';
      capstonePrompt = 'Deploy the model serving pipeline to an inference cluster with auto-scaling and GPU acceleration.';
    } else if (targetRole.includes('devops') || targetRole.includes('cloud')) {
      capstoneTitle = 'Cloud DevOps Capstone: Multi-Cluster GitOps & High-Availability Platform';
      capstoneDesc = 'Architect a self-healing Kubernetes infrastructure with automated canary CI/CD rollouts and infrastructure-as-code provisioning.';
      capstoneCategory = 'Cloud & DevOps Infrastructure';
      capstoneSnippet = 'terraform apply -auto-approve && kubectl apply -k k8s/overlays/production';
      capstonePrompt = 'Deploy a zero-downtime canary rollout pipeline managed by ArgoCD across multi-region clusters.';
    } else if (targetRole.includes('data')) {
      capstoneTitle = 'Data Engineering Capstone: Real-Time Stream Ingestion & Lakehouse Pipeline';
      capstoneDesc = 'Build a distributed streaming architecture processing real-time telemetry with automated schema contracts.';
      capstoneCategory = 'Data Infrastructure';
      capstoneSnippet = 'spark-submit --master yarn --deploy-mode cluster stream_processor.py';
      capstonePrompt = 'Establish automated data quality tests and schema evolution verifications on streaming tables.';
    }

    modules.push({
      id: `mod-${orderCounter}`,
      title: capstoneTitle,
      description: capstoneDesc,
      category: capstoneCategory,
      status: modules.length === 0 ? 'in_progress' : 'locked',
      isRemedial: false,
      estimatedHours: 25,
      lessons: [
        { id: `l-${orderCounter}-1`, title: `${capstoneTitle} Architecture Planning`, durationMinutes: 60 },
        { id: `l-${orderCounter}-2`, title: 'System Integration & Automated Validation', durationMinutes: 90 },
        { id: `l-${orderCounter}-3`, title: 'Production Hardening & Cloud Deployment', durationMinutes: 60 },
      ],
      codeSnippets: [
        {
          language: 'bash',
          code: capstoneSnippet,
        },
      ],
      exercises: [
        { id: `ex-${orderCounter}-1`, prompt: capstonePrompt },
      ],
      order: orderCounter++,
    });

    const roadmap: Roadmap = {
      id: `roadmap-${Date.now()}`,
      userId: report.userId,
      targetRoleId: report.targetRoleId || 'target-role',
      targetRoleName: report.targetRoleName || 'Target Role',
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
