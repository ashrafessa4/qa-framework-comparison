import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this benchmark through `npm run benchmark`.');
}
const dotnet = process.env.DOTNET_CMD ?? 'dotnet';
const environment = { ...process.env };
delete environment.ELECTRON_RUN_AS_NODE;

const frameworks = [
  {
    name: 'Playwright',
    command: process.execPath,
    args: [npmCli, 'run', 'test:playwright'],
  },
  {
    name: 'Cypress',
    command: process.execPath,
    args: [npmCli, 'run', 'test:cypress'],
  },
  {
    name: 'Selenium + C#',
    command: dotnet,
    args: ['test', 'QaFrameworkComparison.sln', '--configuration', 'Release'],
  },
];

const results = [];
for (const framework of frameworks) {
  const startedAt = performance.now();
  const execution = spawnSync(framework.command, framework.args, {
    cwd: process.cwd(),
    env: environment,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (execution.error) {
    console.error(`${framework.name} could not start: ${execution.error.message}`);
  }
  results.push({
    framework: framework.name,
    durationSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(2)),
    passed: execution.status === 0,
  });
}

const benchmark = {
  createdAt: new Date().toISOString(),
  platform: `${process.platform}-${process.arch}`,
  node: process.version,
  scenarioCount: 5,
  methodology: 'One cold sequential CLI run per framework against SauceDemo; startup included.',
  results,
};

mkdirSync('results', { recursive: true });
writeFileSync('results/latest.json', `${JSON.stringify(benchmark, null, 2)}\n`);
const markdown = [
  '# Latest local comparison',
  '',
  `Measured ${benchmark.createdAt} on ${benchmark.platform} with ${benchmark.scenarioCount} scenarios.`,
  '',
  '| Framework | Wall-clock duration | Result |',
  '| --- | ---: | --- |',
  ...results.map(
    (result) =>
      `| ${result.framework} | ${result.durationSeconds.toFixed(2)} s | ${result.passed ? 'PASS' : 'FAIL'} |`,
  ),
  '',
  benchmark.methodology,
  '',
  'These numbers describe one environment, not a universal performance ranking.',
  '',
];
writeFileSync('results/latest.md', markdown.join('\n'));

if (results.some((result) => !result.passed)) {
  process.exitCode = 1;
}
