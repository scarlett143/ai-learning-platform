import { LearnerProfile } from '@/types';

export const PRESET_FULL_STACK_ALEX: LearnerProfile = {
  id: 'preset-full-stack-transition',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  targetRole: 'full-stack',
  targetRoleId: 'fullstack-dev',
  weeklyCommitmentHours: 15,
  skills: [
    {
      id: 'skill-alex-python',
      name: 'Python',
      category: 'backend',
      proficiency: 'advanced',
      yearsOfExperience: 3,
      verified: true,
    },
    {
      id: 'skill-alex-sql',
      name: 'SQL',
      category: 'database',
      proficiency: 'intermediate',
      yearsOfExperience: 2,
      verified: true,
    },
    {
      id: 'skill-alex-html',
      name: 'HTML',
      category: 'frontend',
      proficiency: 'beginner',
      yearsOfExperience: 1,
      verified: false,
    },
  ],
  certifications: [
    {
      id: 'cert-alex-python',
      name: 'Python for Data & Web Development',
      issuer: 'Coursera',
      issueDate: '2025-02-10',
      credentialUrl: 'https://coursera.org/verify/alex-python',
    },
  ],
  projects: [
    {
      id: 'proj-alex-portal',
      title: 'University Student Course Portal',
      description: 'Flask & SQLite backend for student course registration, prerequisite validation, and GPA calculation.',
      techStack: ['Python', 'Flask', 'SQL', 'HTML'],
      githubUrl: 'https://github.com/alexchen/course-portal',
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

// Backwards compatibility alias
export const PRESET_FULL_STACK_CANDIDATE = PRESET_FULL_STACK_ALEX;
