/// <reference types="node" />
/**
 * One entrypoint for E2E Python deps + pytest (local only — CI starts servers in the workflow).
 *
 *   npx tsx test/scripts/run-e2e.ts install   — venv + pip (CI calls this; no npm script)
 *   npx tsx test/scripts/run-e2e.ts headless  — pytest default (headless; no --headed flag)
 *   npx tsx test/scripts/run-e2e.ts headed    — pytest --headed (visible Chrome)
 */
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.resolve(SCRIPT_DIR, '..');
const CLIENT_ROOT = path.resolve(TEST_DIR, '..');
const isWin = process.platform === 'win32';
const venvBin = path.join(CLIENT_ROOT, '.venv', isWin ? 'Scripts' : 'bin');
const PYTHON = path.join(venvBin, isWin ? 'python.exe' : 'python');
const PIP = path.join(venvBin, isWin ? 'pip.exe' : 'pip');

function resolvePython(): string {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    return 'python3';
  } catch {
    return 'python';
  }
}

function run(cmd: string, args: string[], cwd = CLIENT_ROOT): void {
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function cmdInstall(): void {
  const venvPath = path.join(CLIENT_ROOT, '.venv');
  const py = resolvePython();
  if (!fs.existsSync(venvPath)) {
    console.log('Creating .venv in client/...');
    run(py, ['-m', 'venv', venvPath]);
  }
  console.log('Installing test dependencies...');
  run(PIP, ['install', '-r', 'test/requirements.txt']);
}

function pytestArgs(): string[] {
  return ['src', '--ignore=src/pages/profile', '-v', '--tb=short'];
}

function cmdPytest(headless: boolean): void {
  if (!fs.existsSync(PYTHON)) {
    console.error('Missing venv. From client/: npx tsx test/scripts/run-e2e.ts install');
    process.exit(1);
  }
  const args = ['-m', 'pytest', ...pytestArgs()];
  if (!headless) {
    args.push('--headed');
  }
  const result = spawnSync(PYTHON, args, {
    cwd: TEST_DIR,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  });
  process.exit(result.status ?? 1);
}

const cmd = process.argv[2];
if (cmd === 'install') {
  cmdInstall();
} else if (cmd === 'headless') {
  cmdPytest(true);
} else if (cmd === 'headed') {
  cmdPytest(false);
} else {
  console.error('Usage: npx tsx test/scripts/run-e2e.ts <install|headless|headed>');
  process.exit(1);
}
