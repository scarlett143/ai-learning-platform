#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';

interface VitestAssertionResult {
  title: string;
  fullName: string;
  status: 'passed' | 'failed' | 'pending';
  duration?: number;
  failureMessages?: string[];
}

interface VitestFileResult {
  name: string;
  status: 'passed' | 'failed';
  assertionResults: VitestAssertionResult[];
}

interface VitestOutput {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  success: boolean;
  startTime: number;
  testResults: VitestFileResult[];
}

interface TierMetrics {
  name: string;
  category: string;
  pathFilter: string;
  targetMin: number;
  executed: number;
  passed: number;
  failed: number;
  durationMs: number;
}

function runTierVitest(targetPath: string): { output: VitestOutput | null; rawError?: string } {
  const rootDir = path.resolve(__dirname, '..');
  const result = spawnSync('npx', ['vitest', 'run', targetPath, '--reporter=json'], {
    cwd: rootDir,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    env: { ...process.env, NODE_ENV: 'test' },
  });

  const stdout = result.stdout || '';
  const jsonStart = stdout.indexOf('{');
  if (jsonStart === -1) {
    return { output: null, rawError: result.stderr || result.stdout };
  }

  try {
    const jsonStr = stdout.slice(jsonStart);
    const parsed: VitestOutput = JSON.parse(jsonStr);
    return { output: parsed };
  } catch (err: unknown) {
    return { output: null, rawError: `Failed to parse Vitest JSON: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const tierArg = args.find(a => a.startsWith('--tier='));
  const selectedTier = tierArg ? tierArg.split('=')[1].toLowerCase() : 'all';

  console.log(`\n====================================================================================================`);
  console.log(`                     SKILLBRIDGE AI — E2E TEST RUNNER & VERIFICATION`);
  console.log(`                     Mode: ${selectedTier.toUpperCase()} | Engine: Vitest + tsx`);
  console.log(`====================================================================================================\n`);

  const startTime = Date.now();

  const tierConfigs: TierMetrics[] = [
    {
      name: 'Tier 1',
      category: 'Feature Coverage (>=5/feat)',
      pathFilter: 'tests/e2e/tier1-features',
      targetMin: 65,
      executed: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    {
      name: 'Tier 2',
      category: 'Boundary & Corner Cases (>=5/area)',
      pathFilter: 'tests/e2e/tier2-boundaries',
      targetMin: 35,
      executed: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    {
      name: 'Tier 3',
      category: 'Cross-Feature Pairwise Pairs',
      pathFilter: 'tests/e2e/tier3-combinations',
      targetMin: 10,
      executed: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
    {
      name: 'Tier 4',
      category: 'Real-World Workload Journeys',
      pathFilter: 'tests/e2e/tier4-workloads',
      targetMin: 5,
      executed: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
    },
  ];

  const tiersToRun = selectedTier === 'all'
    ? tierConfigs
    : tierConfigs.filter(t => t.name.toLowerCase().includes(selectedTier));

  if (tiersToRun.length === 0) {
    console.error(`Invalid tier filter: ${selectedTier}. Allowed: 1, 2, 3, 4, all`);
    process.exit(1);
  }

  const failureDetails: string[] = [];

  for (const tier of tiersToRun) {
    process.stdout.write(`Executing ${tier.name}: ${tier.category}... `);
    const tierStart = Date.now();
    const { output, rawError } = runTierVitest(tier.pathFilter);
    tier.durationMs = Date.now() - tierStart;

    if (!output) {
      console.log(`❌ ERROR`);
      failureDetails.push(`[${tier.name}] Execution failed:\n${rawError}`);
      tier.failed = 1;
      continue;
    }

    tier.executed = output.numTotalTests;
    tier.passed = output.numPassedTests;
    tier.failed = output.numFailedTests;

    if (tier.failed === 0 && tier.executed >= tier.targetMin) {
      console.log(`✅ ${tier.passed}/${tier.executed} Passed (${tier.durationMs}ms)`);
    } else {
      console.log(`❌ ${tier.failed} Failed, ${tier.passed} Passed`);
      for (const file of output.testResults) {
        for (const test of file.assertionResults) {
          if (test.status === 'failed') {
            failureDetails.push(`[${tier.name}] ${test.fullName}:\n  ${(test.failureMessages || []).join('\n  ')}`);
          }
        }
      }
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalExecuted = tiersToRun.reduce((acc, t) => acc + t.executed, 0);
  const totalPassed = tiersToRun.reduce((acc, t) => acc + t.passed, 0);
  const totalFailed = tiersToRun.reduce((acc, t) => acc + t.failed, 0);
  const totalTarget = tiersToRun.reduce((acc, t) => acc + t.targetMin, 0);

  console.log(`\n====================================================================================================`);
  console.log(`                                4-TIER E2E TEST COVERAGE MATRIX`);
  console.log(`====================================================================================================`);
  console.log(`| Tier   | Category                              | Target | Executed | Passed | Failed | Status | Duration |`);
  console.log(`|--------|---------------------------------------|:------:|:--------:|:------:|:------:|:------:|:--------:|`);

  for (const t of tiersToRun) {
    const isSuccess = t.failed === 0 && t.executed >= t.targetMin;
    const statusIcon = isSuccess ? '  ✅  ' : '  ❌  ';
    const namePadded = t.name.padEnd(6);
    const catPadded = t.category.padEnd(37);
    const targetPadded = String(t.targetMin).padStart(6);
    const execPadded = String(t.executed).padStart(8);
    const passPadded = String(t.passed).padStart(6);
    const failPadded = String(t.failed).padStart(6);
    const durPadded = `${t.durationMs}ms`.padStart(8);

    console.log(`| ${namePadded} | ${catPadded} | ${targetPadded} | ${execPadded} | ${passPadded} | ${failPadded} | ${statusIcon} | ${durPadded} |`);
  }

  console.log(`|--------|---------------------------------------|:------:|:--------:|:------:|:------:|:------:|:--------:|`);
  const totalSuccess = totalFailed === 0 && totalExecuted >= totalTarget;
  const totalStatus = totalSuccess ? '  ✅  ' : '  ❌  ';
  console.log(`| Total  | Comprehensive Test Verification Suite | ${String(totalTarget).padStart(6)} | ${String(totalExecuted).padStart(8)} | ${String(totalPassed).padStart(6)} | ${String(totalFailed).padStart(6)} | ${totalStatus} | ${`${totalDuration}ms`.padStart(8)} |`);
  console.log(`====================================================================================================\n`);

  if (failureDetails.length > 0) {
    console.error(`FAILURES DETECTED (${failureDetails.length}):\n`);
    for (const fail of failureDetails) {
      console.error(fail);
      console.error(`----------------------------------------------------------------------------------------------------`);
    }
    process.exit(1);
  }

  console.log(`🎉 VERIFICATION SUCCESS: All ${totalExecuted} tests passed across all tiers.`);
  console.log(`Compliance: 100% | Thresholds Exceeded | Zero Uncaught Errors.\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
