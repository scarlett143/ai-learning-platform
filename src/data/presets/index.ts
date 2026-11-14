import { LearnerProfile } from '@/types';
import { PRESET_FULL_STACK_ALEX } from './full-stack-alex';
import { PRESET_AI_ML_PIVOT } from './ai-ml-pivot';
import { PRESET_DEVOPS_ARCHITECT } from './devops-architect';
import { PRESET_CUSTOM_WIZARD } from './custom-wizard';

export * from './full-stack-alex';
export * from './ai-ml-pivot';
export * from './devops-architect';
export * from './custom-wizard';

export const PRESETS: LearnerProfile[] = [
  PRESET_FULL_STACK_ALEX,
  PRESET_AI_ML_PIVOT,
  PRESET_DEVOPS_ARCHITECT,
  PRESET_CUSTOM_WIZARD,
];

export const ALL_PRESETS = [
  {
    id: 'fullstack-dev',
    title: 'Sample Student Scenario',
    subtitle: 'Python + SQL + HTML -> Full Stack Developer',
    roleId: 'fullstack-dev',
    profile: PRESET_FULL_STACK_ALEX,
  },
  {
    id: 'aiml-engineer',
    title: 'Data Analyst -> AI Engineer',
    subtitle: 'Python + SQL -> Deep Learning & PyTorch',
    roleId: 'aiml-engineer',
    profile: PRESET_AI_ML_PIVOT,
  },
  {
    id: 'devops-engineer',
    title: 'SysAdmin -> Cloud DevOps',
    subtitle: 'Linux + Docker -> Kubernetes & CI/CD',
    roleId: 'devops-engineer',
    profile: PRESET_DEVOPS_ARCHITECT,
  },
];

export function getPresetById(id?: string | null): LearnerProfile | null {
  if (!id) return null;
  const key = id.toLowerCase().trim();

  // Match by preset ID
  for (const p of PRESETS) {
    if (p.id.toLowerCase() === key) {
      return JSON.parse(JSON.stringify(p));
    }
  }

  // Match by role / alias
  if (key === 'fullstack-dev' || key === 'full-stack' || key === 'preset-fullstack') {
    return JSON.parse(JSON.stringify(PRESET_FULL_STACK_ALEX));
  }
  if (key === 'aiml-engineer' || key === 'ai-ml-engineer' || key === 'preset-aiml') {
    return JSON.parse(JSON.stringify(PRESET_AI_ML_PIVOT));
  }
  if (key === 'devops-engineer' || key === 'cloud-devops' || key === 'preset-devops') {
    return JSON.parse(JSON.stringify(PRESET_DEVOPS_ARCHITECT));
  }
  if (key === 'custom' || key === 'wizard' || key === 'preset-custom-wizard') {
    return JSON.parse(JSON.stringify(PRESET_CUSTOM_WIZARD));
  }

  return null;
}
