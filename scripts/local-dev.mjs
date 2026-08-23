import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { closeSync, existsSync, openSync, readFileSync, unlinkSync, watch, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const frontendPort = Number(process.env.VITEPRESS_PORT || 5173);
const adminPort = Number(process.env.ADMIN_PORT || 4174);
const vitepressBin = path.join(root, 'node_modules', 'vitepress', 'bin', 'vitepress.js');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const lockPath = path.join(root, '.local-dev.lock');
const children = new Set();
const expectedStops = new WeakSet();
let frontend;
let admin;
let docsWatcher;
let registryWatcher;
let restartTimer;
let restartPromise = Promise.resolve();
let shutdownPromise;
let shuttingDown = false;
const watcherReadyAt = Date.now() + 1500;

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
    await assertPortAvailable(label, port);
  }
}

async function assertPortAvailable(label, port) {
  const result = await checkPort(port);
  if (!result.available) throw new Error(`${label}端口 ${port} 已被占用。请运行 pnpm run doctor 检查，或停止占用该端口的进程。`);
}

async function waitForPortAvailable(label, port, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await checkPort(port);
    if (result.available) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`${label}端口 ${port} 在停止旧进程后仍未释放。请运行 pnpm run doctor 检查占用进程。`);
}

function serviceSpec(script, port) {
  if (script === 'dev') {
    return { command: process.execPath, args: [vitepressBin, 'dev', 'docs', '--host', '127.0.0.1', '--port', String(port), '--strictPort'] };
  }
  return { command: process.execPath, args: [viteBin, '--config', 'admin/vite.config.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'] };
}

function start(label, spec) {
  const child = spawn(spec.command, spec.args, { cwd: root, stdio: ['inherit', 'pipe', 'pipe'], windowsHide: true });
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
    try {
      if (!child.kill('SIGTERM')) finish();
    } catch {
      finish();
    }
  });
}

function scheduleFrontendRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartPromise = restartPromise.then(async () => {
      if (shuttingDown) return;
      console.log('[local] Content configuration changed, refreshing frontend index...');
      const previous = frontend;
      frontend = null;
      await stop(previous);
      if (shuttingDown) return;
      await waitForPortAvailable('前台', frontendPort);
      frontend = start('frontend', serviceSpec('dev', frontendPort));
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
    registryWatcher?.close();
    releaseLock();
    await Promise.all([...children].map(stop));
    if (exitCode) process.exitCode = exitCode;
  })();
  return shutdownPromise;
}

async function main() {
  acquireLock();
  try {
    if (!existsSync(vitepressBin) || !existsSync(viteBin)) throw new Error('本地 VitePress/Vite 依赖不存在，请先执行 pnpm install。');
    await assertPortsAvailable();
    console.log('Starting local VitePress and admin services...');
    console.log(`Frontend: http://127.0.0.1:${frontendPort}`);
    console.log(`Admin:    http://127.0.0.1:${adminPort}`);
    frontend = start('frontend', serviceSpec('dev', frontendPort));
    admin = start('admin', serviceSpec('admin:dev', adminPort));
    docsWatcher = watch(path.join(root, 'docs'), { recursive: true }, (_event, filename) => {
      if (shuttingDown || Date.now() < watcherReadyAt) return;
      if (filename && String(filename).toLowerCase().endsWith('.md')) scheduleFrontendRestart();
    });
    registryWatcher = watch(root, (_event, filename) => {
      if (shuttingDown || Date.now() < watcherReadyAt) return;
      if (filename && String(filename).replaceAll('\\', '/') === 'content.registry.json') scheduleFrontendRestart();
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
