import { RoleBenchmark } from '@/types';

export const ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  'fullstack-dev': {
    id: 'fullstack-dev',
    roleName: 'Full Stack Developer',
    description: 'Builds end-to-end web applications with modern frontend frameworks and robust backend APIs.',
    requiredSkills: [
      { name: 'JavaScript', minProficiency: 'intermediate', weight: 20, category: 'Frontend' },
      { name: 'React', minProficiency: 'intermediate', weight: 20, category: 'Frontend' },
      { name: 'Node.js', minProficiency: 'intermediate', weight: 20, category: 'Backend' },
      { name: 'HTML', minProficiency: 'intermediate', weight: 10, category: 'Frontend' },
      { name: 'SQL', minProficiency: 'intermediate', weight: 10, category: 'Database' },
      { name: 'TypeScript', minProficiency: 'beginner', weight: 10, category: 'Frontend' },
      { name: 'Git & REST APIs', minProficiency: 'intermediate', weight: 10, category: 'Backend' },
    ],
  },
  'aiml-engineer': {
    id: 'aiml-engineer',
    roleName: 'AI / Machine Learning Engineer',
    description: 'Designs, trains, and deploys deep learning models and agentic AI systems.',
    requiredSkills: [
      { name: 'Python', minProficiency: 'advanced', weight: 25, category: 'Backend' },
      { name: 'PyTorch', minProficiency: 'intermediate', weight: 20, category: 'Machine Learning' },
      { name: 'Linear Algebra & Statistics', minProficiency: 'intermediate', weight: 15, category: 'Machine Learning' },
      { name: 'Model Evaluation & LLMs', minProficiency: 'intermediate', weight: 15, category: 'Machine Learning' },
      { name: 'SQL', minProficiency: 'intermediate', weight: 15, category: 'Database' },
      { name: 'Docker & MLOps', minProficiency: 'beginner', weight: 10, category: 'DevOps' },
    ],
  },
  'devops-engineer': {
    id: 'devops-engineer',
    roleName: 'Cloud DevOps & Platform Engineer',
    description: 'Automates CI/CD, orchestrates cloud infrastructure, and manages platform reliability.',
    requiredSkills: [
      { name: 'Docker', minProficiency: 'intermediate', weight: 20, category: 'DevOps' },
      { name: 'Kubernetes', minProficiency: 'intermediate', weight: 20, category: 'DevOps' },
      { name: 'Linux & Shell Scripting', minProficiency: 'intermediate', weight: 20, category: 'DevOps' },
      { name: 'CI/CD Pipelines (GitHub Actions)', minProficiency: 'intermediate', weight: 15, category: 'DevOps' },
      { name: 'Cloud Infrastructure (GCP/AWS)', minProficiency: 'intermediate', weight: 15, category: 'DevOps' },
      { name: 'Terraform & IaC', minProficiency: 'beginner', weight: 10, category: 'DevOps' },
    ],
  },
  'data-engineer': {
    id: 'data-engineer',
    roleName: 'Data Platform Engineer',
    description: 'Constructs distributed streaming and batch data pipelines and warehouse schemas.',
    requiredSkills: [
      { name: 'SQL', minProficiency: 'advanced', weight: 25, category: 'Database' },
      { name: 'Python', minProficiency: 'intermediate', weight: 20, category: 'Backend' },
      { name: 'Data Warehousing & Modeling', minProficiency: 'intermediate', weight: 20, category: 'Database' },
      { name: 'Apache Spark / Distributed Compute', minProficiency: 'intermediate', weight: 15, category: 'Backend' },
      { name: 'ETL Orchestration (Airflow/Dagster)', minProficiency: 'intermediate', weight: 10, category: 'Backend' },
      { name: 'Kafka / Event Streaming', minProficiency: 'beginner', weight: 10, category: 'Backend' },
    ],
  },
};
