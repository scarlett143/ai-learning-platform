import { LearnerProfile } from '@/types';

export const PRESET_AI_ML_PIVOT: LearnerProfile = {
  id: 'preset-ai-engineer-pivot',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  targetRole: 'ai-ml-engineer',
  targetRoleId: 'aiml-engineer',
  weeklyCommitmentHours: 20,
  skills: [
    {
      id: 'skill-priya-python',
      name: 'Python',
      category: 'backend',
      proficiency: 'advanced',
      yearsOfExperience: 4,
      verified: true,
    },
    {
      id: 'skill-priya-sql',
      name: 'SQL',
      category: 'database',
      proficiency: 'advanced',
      yearsOfExperience: 3,
      verified: true,
    },
    {
      id: 'skill-priya-pandas',
      name: 'Pandas & NumPy',
      category: 'ai_ml',
      proficiency: 'intermediate',
      yearsOfExperience: 2,
      verified: true,
    },
  ],
  certifications: [
    {
      id: 'cert-priya-data',
      name: 'Google Advanced Data Analytics',
      issuer: 'Google',
      issueDate: '2025-06-20',
      credentialUrl: 'https://coursera.org/verify/google-data-priya',
    },
  ],
  projects: [
    {
      id: 'proj-priya-churn',
      title: 'Customer Churn Predictor',
      description: 'Scikit-learn random forest classifier predicting telecom subscriber turnover with automated feature engineering.',
      techStack: ['Python', 'SQL', 'pandas', 'scikit-learn'],
      githubUrl: 'https://github.com/priyasharma/churn-predictor',
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

// Backwards compatibility alias
export const PRESET_AIML_TRANSITION = PRESET_AI_ML_PIVOT;
