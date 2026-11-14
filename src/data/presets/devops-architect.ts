import { LearnerProfile } from '@/types';

export const PRESET_DEVOPS_ARCHITECT: LearnerProfile = {
  id: 'preset-cloud-devops-architect',
  name: 'Marcus Vance',
  email: 'marcus.vance@example.com',
  targetRole: 'cloud-devops',
  targetRoleId: 'devops-engineer',
  weeklyCommitmentHours: 15,
  skills: [
    {
      id: 'skill-marcus-linux',
      name: 'Linux & Shell Scripting',
      category: 'devops',
      proficiency: 'advanced',
      yearsOfExperience: 5,
      verified: true,
    },
    {
      id: 'skill-marcus-docker',
      name: 'Docker',
      category: 'devops',
      proficiency: 'intermediate',
      yearsOfExperience: 3,
      verified: true,
    },
    {
      id: 'skill-marcus-git',
      name: 'Git',
      category: 'devops',
      proficiency: 'intermediate',
      yearsOfExperience: 4,
      verified: true,
    },
  ],
  certifications: [
    {
      id: 'cert-marcus-rhcsa',
      name: 'Red Hat Certified System Administrator (RHCSA)',
      issuer: 'Red Hat',
      issueDate: '2024-11-15',
      credentialUrl: 'https://redhat.com/verify/marcus-rhcsa',
    },
  ],
  projects: [
    {
      id: 'proj-marcus-backup',
      title: 'Multi-Server Automated Backup Daemon',
      description: 'Bash & Python cron utility for remote rsync snapshots and health heartbeats across 10 VPS hosts.',
      techStack: ['Bash', 'Linux', 'Python', 'Docker'],
      githubUrl: 'https://github.com/marcusvance/backup-daemon',
    },
  ],
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
};

// Backwards compatibility alias
export const PRESET_DEVOPS_TRANSITION = PRESET_DEVOPS_ARCHITECT;
