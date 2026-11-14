import { RoleBenchmark } from '@/types';
import { FULL_STACK_BENCHMARK } from './full-stack';
import { AI_ML_BENCHMARK } from './ai-ml';
import { CLOUD_DEVOPS_BENCHMARK } from './devops';
import { DATA_ENGINEER_BENCHMARK } from './data-engineer';

export * from './types';
export * from './full-stack';
export * from './ai-ml';
export * from './devops';
export * from './data-engineer';
export * from './gap-analysis';

export const BENCHMARKS: RoleBenchmark[] = [
  FULL_STACK_BENCHMARK,
  AI_ML_BENCHMARK,
  CLOUD_DEVOPS_BENCHMARK,
  DATA_ENGINEER_BENCHMARK,
];

export const ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  'full-stack': FULL_STACK_BENCHMARK,
  'fullstack-dev': FULL_STACK_BENCHMARK,
  'ai-ml-engineer': AI_ML_BENCHMARK,
  'aiml-engineer': AI_ML_BENCHMARK,
  'cloud-devops': CLOUD_DEVOPS_BENCHMARK,
  'devops-engineer': CLOUD_DEVOPS_BENCHMARK,
  'data-engineer': DATA_ENGINEER_BENCHMARK,
};

export function listBenchmarks(): RoleBenchmark[] {
  return [...BENCHMARKS];
}

export function getBenchmark(roleId?: string | null): RoleBenchmark | null {
  if (!roleId) return null;
  const key = roleId.toLowerCase().trim();

  if (ROLE_BENCHMARKS[key]) {
    return ROLE_BENCHMARKS[key];
  }

  // Fallback matching
  for (const b of BENCHMARKS) {
    if (
      b.id.toLowerCase() === key ||
      b.title.toLowerCase() === key ||
      (b.roleName && b.roleName.toLowerCase() === key)
    ) {
      return b;
    }
  }

  return null;
}
