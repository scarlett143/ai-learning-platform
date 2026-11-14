import { LearnerProfile } from '@/types';

export const PRESET_FULL_STACK_CANDIDATE: LearnerProfile = {
  id: 'preset-fullstack',
  name: 'Alex Rivera (CS Student)',
  targetRoleId: 'fullstack-dev',
  skills: [
    { id: 's1', name: 'Python', proficiency: 'intermediate', category: 'Backend' },
    { id: 's2', name: 'SQL', proficiency: 'intermediate', category: 'Database' },
    { id: 's3', name: 'HTML', proficiency: 'beginner', category: 'Frontend' },
  ],
  certifications: [
    { id: 'c1', name: 'Python for Data & Web Development', issuer: 'Coursera', issueDate: '2025-02-10' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'University Student Course Portal',
      description: 'Flask & SQLite backend for student course registration and GPA calculation.',
      techStack: ['Python', 'Flask', 'SQL', 'HTML'],
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

export const PRESET_AIML_TRANSITION: LearnerProfile = {
  id: 'preset-aiml',
  name: 'Priya Sharma (Data Analyst)',
  targetRoleId: 'aiml-engineer',
  skills: [
    { id: 's1', name: 'Python', proficiency: 'advanced', category: 'Backend' },
    { id: 's2', name: 'SQL', proficiency: 'advanced', category: 'Database' },
    { id: 's3', name: 'Linear Algebra & Statistics', proficiency: 'intermediate', category: 'Machine Learning' },
  ],
  certifications: [
    { id: 'c1', name: 'Google Advanced Data Analytics', issuer: 'Google', issueDate: '2025-06-20' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Customer Churn Predictor',
      description: 'Scikit-learn random forest classifier predicting subscriber turnover.',
      techStack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

export const PRESET_DEVOPS_TRANSITION: LearnerProfile = {
  id: 'preset-devops',
  name: 'Marcus Vance (System Administrator)',
  targetRoleId: 'devops-engineer',
  skills: [
    { id: 's1', name: 'Linux & Shell Scripting', proficiency: 'advanced', category: 'DevOps' },
    { id: 's2', name: 'Docker', proficiency: 'intermediate', category: 'DevOps' },
    { id: 's3', name: 'Git & REST APIs', proficiency: 'intermediate', category: 'Backend' },
  ],
  certifications: [
    { id: 'c1', name: 'Red Hat Certified System Administrator (RHCSA)', issuer: 'Red Hat', issueDate: '2024-11-15' },
  ],
  projects: [
    {
      id: 'p1',
      title: 'Multi-Server Automated Backup Daemon',
      description: 'Bash & Python cron utility for remote rsync snapshots across 10 VPS hosts.',
      techStack: ['Bash', 'Linux', 'Python', 'Docker'],
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

export const ALL_PRESETS = [
  {
    id: 'fullstack-dev',
    title: 'Sample Student Scenario',
    subtitle: 'Python + SQL + HTML -> Full Stack Developer',
    roleId: 'fullstack-dev',
    profile: PRESET_FULL_STACK_CANDIDATE,
  },
  {
    id: 'aiml-engineer',
    title: 'Data Analyst -> AI Engineer',
    subtitle: 'Python + SQL -> Deep Learning & PyTorch',
    roleId: 'aiml-engineer',
    profile: PRESET_AIML_TRANSITION,
  },
  {
    id: 'devops-engineer',
    title: 'SysAdmin -> Cloud DevOps',
    subtitle: 'Linux + Docker -> Kubernetes & CI/CD',
    roleId: 'devops-engineer',
    profile: PRESET_DEVOPS_TRANSITION,
  },
];
