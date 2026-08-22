import { execFile, spawn } from 'node:child_process';
import { watch } from 'node:fs';

const isWindows = process.platform === 'win32';
const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'pnpm';
const children = new Set();
let frontend;
let restartTimer;
let shuttingDown = false;
const watcherReadyAt = Date.now() + 1500;

function quoteWindowsArg(value) {
  const arg = String(value);
  return /^[\w.@%+=:,/-]+$/.test(arg) ? arg : `"${arg.replace(/(["\\])/g, '\\$1')}"`;
}

function pnpmArgs(args) {
  if (!isWindows) return args;
  // cmd.exe expects the command after /c as one argument. Passing each token
  // separately can leak pnpm's `--` separator to Vite and ignore --host.
  return ['/d', '/s', '/c', ['pnpm', ...args].map(quoteWindowsArg).join(' ')];
}

function start(label, args) {
  const child = spawn(command, pnpmArgs(args), {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
    windowsHide: true,
  });
  child.stdout.on('data', (chunk) => process.stdout.write(`[${label}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  children.add(child);
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (code && !signal) process.exitCode = code;
  });
  return child;
}

function stop(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  if (!isWindows) {
    child.kill('SIGTERM');
    return new Promise((resolve) => child.once('close', resolve));
  }
  return new Promise((resolve) => {
    let settled = false;
    let fallback;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      resolve();
    };
    fallback = setTimeout(finish, 3000);
    child.once('close', finish);
    execFile('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => {
      if (child.exitCode !== null) finish();
    });
  });
}

console.log('Starting local VitePress and admin services...');
console.log('Frontend: http://localhost:5173');
console.log('Admin:    http://localhost:4174 (or the next available port)');

frontend = start('frontend', ['run', 'dev', '--host', '127.0.0.1']);
start('admin', ['run', 'admin:dev', '--host', '127.0.0.1']);

const docsWatcher = watch('docs', { recursive: true }, (_event, filename) => {
  if (shuttingDown) return;
  if (Date.now() < watcherReadyAt) return;
  if (!filename || !String(filename).toLowerCase().endsWith('.md')) return;
  clearTimeout(restartTimer);
  restartTimer = setTimeout(async () => {
    if (shuttingDown) return;
    console.log('[local] Markdown changed, restarting frontend config...');
    const previous = frontend;
    frontend = null;
    await stop(previous);
    if (!shuttingDown) frontend = start('frontend', ['run', 'dev', '--host', '127.0.0.1']);
  }, 500);
});

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  docsWatcher.close();
  clearTimeout(restartTimer);
  await Promise.all([...children].map(stop));
}

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
