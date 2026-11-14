import { LearnerProfile } from '@/types';

export const PRESET_CUSTOM_WIZARD: LearnerProfile = {
  id: 'preset-custom-wizard',
  name: 'Jordan Lee',
  email: 'jordan.lee@example.com',
  targetRole: 'full-stack',
  targetRoleId: 'fullstack-dev',
  weeklyCommitmentHours: 10,
  skills: [
    {
      id: 'skill-custom-basics',
      name: 'Computer Science Fundamentals',
      category: 'fundamentals',
      proficiency: 'beginner',
      yearsOfExperience: 1,
      verified: false,
    },
  ],
  certifications: [],
  projects: [],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};
