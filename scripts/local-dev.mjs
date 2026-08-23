import { execFile, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { closeSync, existsSync, openSync, readFileSync, unlinkSync, watch, writeFileSync } from 'node:fs';
import path from 'node:path';

const isWindows = process.platform === 'win32';
const command = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'pnpm';
const root = process.cwd();
const frontendPort = Number(process.env.VITEPRESS_PORT || 5173);
const adminPort = Number(process.env.ADMIN_PORT || 4174);
const lockPath = path.join(root, '.local-dev.lock');
const children = new Set();
const expectedStops = new WeakSet();
let frontend;
let admin;
let docsWatcher;
let restartTimer;
let restartPromise = Promise.resolve();
let shutdownPromise;
let shuttingDown = false;
const watcherReadyAt = Date.now() + 1500;

function quoteWindowsArg(value) {
  const arg = String(value);
  return /^[\w.@%+=:,/-]+$/.test(arg) ? arg : `"${arg.replace(/(["\\])/g, '\\$1')}"`;
}

function pnpmArgs(args) {
  if (!isWindows) return args;
  return ['/d', '/s', '/c', ['pnpm', ...args].map(quoteWindowsArg).join(' ')];
}

function acquireLock() {
  try {
    const handle = openSync(lockPath, 'wx');
    closeSync(handle);
    writeFileSync(lockPath, String(process.pid), 'utf8');
    return;
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
  }

  const existingPid = Number.parseInt(readFileSync(lockPath, 'utf8'), 10);
  if (existingPid && existingPid !== process.pid) {
    try {
      process.kill(existingPid, 0);
      throw new Error(`已有 local:dev 进程运行中（PID ${existingPid}）。请先停止它。`);
    } catch (error) {
      if (error?.code !== 'ESRCH') throw error;
    }
  }
  unlinkSync(lockPath);
  acquireLock();
}

function releaseLock() {
  try {
    if (existsSync(lockPath) && readFileSync(lockPath, 'utf8').trim() === String(process.pid)) unlinkSync(lockPath);
  } catch {
    // Cleanup should not hide the original process exit.
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (error) => resolve({ available: false, error }));
    server.listen(port, '127.0.0.1', () => server.close(() => resolve({ available: true })));
  });
}

async function assertPortsAvailable() {
  for (const [label, port] of [['前台', frontendPort], ['管理端', adminPort]]) {
    const result = await checkPort(port);
    if (!result.available) throw new Error(`${label}端口 ${port} 已被占用。请运行 pnpm run doctor 检查，或停止占用该端口的进程。`);
  }
}

function serviceArgs(script, port) {
  return ['run', script, '--host', '127.0.0.1', '--port', String(port), '--strictPort'];
}

function start(label, args) {
  const child = spawn(command, pnpmArgs(args), { cwd: root, stdio: ['inherit', 'pipe', 'pipe'], windowsHide: true });
  children.add(child);
  child.stdout.on('data', (chunk) => process.stdout.write(`[${label}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${label}] ${chunk}`));
  child.once('error', (error) => {
    console.error(`[${label}] 启动失败：${error.message}`);
    void shutdown(1);
  });
  child.once('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown && !expectedStops.has(child)) {
      if (code || signal) console.error(`[${label}] 已退出（code=${code ?? 'null'}, signal=${signal ?? 'null'}）。`);
      void shutdown(code || 1);
    }
  });
  return child;
}

function stop(child) {
  if (!child || child.exitCode !== null) return Promise.resolve();
  expectedStops.add(child);
  return new Promise((resolve) => {
    let settled = false;
    const fallback = setTimeout(finish, 5000);
    function finish() {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      resolve();
    }
    child.once('close', finish);
    if (!isWindows) {
      child.kill('SIGTERM');
      return;
    }
    execFile('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => {
      if (child.exitCode !== null) finish();
    });
  });
}

function scheduleFrontendRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartPromise = restartPromise.then(async () => {
      if (shuttingDown) return;
      console.log('[local] Markdown changed, refreshing frontend index...');
      const previous = frontend;
      frontend = null;
      await stop(previous);
      if (shuttingDown) return;
      await assertPortsAvailable();
      frontend = start('frontend', serviceArgs('dev', frontendPort));
    }).catch((error) => {
      console.error(`[local] 前台刷新失败：${error.message}`);
      void shutdown(1);
    });
  }, 500);
}

async function shutdown(exitCode = 0) {
  if (shutdownPromise) return shutdownPromise;
  shuttingDown = true;
  shutdownPromise = (async () => {
    clearTimeout(restartTimer);
    docsWatcher?.close();
    await Promise.all([...children].map(stop));
    releaseLock();
    if (exitCode) process.exitCode = exitCode;
  })();
  return shutdownPromise;
}

async function main() {
  acquireLock();
  try {
    await assertPortsAvailable();
    console.log('Starting local VitePress and admin services...');
    console.log(`Frontend: http://127.0.0.1:${frontendPort}`);
    console.log(`Admin:    http://127.0.0.1:${adminPort}`);
    frontend = start('frontend', serviceArgs('dev', frontendPort));
    admin = start('admin', serviceArgs('admin:dev', adminPort));
    docsWatcher = watch(path.join(root, 'docs'), { recursive: true }, (_event, filename) => {
      if (shuttingDown || Date.now() < watcherReadyAt) return;
      if (filename && String(filename).toLowerCase().endsWith('.md')) scheduleFrontendRestart();
    });
  } catch (error) {
    console.error(`[local] ${error.message}`);
    await shutdown(1);
  }
}

process.once('SIGINT', () => void shutdown(130));
process.once('SIGTERM', () => void shutdown(143));
process.once('exit', releaseLock);

await main();
