import { execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const expectedNode = packageJson.engines?.node || 'unknown';
const expectedPnpm = packageJson.packageManager?.replace(/^pnpm@/, '') || packageJson.engines?.pnpm || 'unknown';
const frontendPort = Number(process.env.VITEPRESS_PORT || 5173);
const adminPort = Number(process.env.ADMIN_PORT || 4174);
let failed = false;

function status(label, ok, detail, warning = false) {
  const marker = ok ? 'OK' : warning ? 'WARN' : 'FAIL';
  console.log(`[${marker}] ${label}: ${detail}`);
  if (!ok && !warning) failed = true;
}

function commandVersion(command) {
  try {
    if (process.platform === 'win32' && command === 'pnpm') {
      return execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'pnpm --version'], { cwd: root, encoding: 'utf8' }).trim();
    }
    return execFileSync(command, ['--version'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function portState(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', (error) => resolve(error.code === 'EADDRINUSE' ? 'occupied' : `error:${error.code || 'unknown'}`));
    server.listen(port, '127.0.0.1', () => server.close(() => resolve('available')));
  });
}

function countFiles(directory, extension = '') {
  if (!existsSync(directory)) return 0;
  let count = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) count += countFiles(fullPath, extension);
    else if (!extension || entry.name.toLowerCase().endsWith(extension)) count += 1;
  }
  return count;
}

console.log('Lonemonk project doctor');
console.log(`Project: ${root}`);

const nodeVersion = process.versions.node;
status('Node.js', nodeVersion === expectedNode, `${nodeVersion} (expected ${expectedNode})`, nodeVersion !== expectedNode);
const pnpmVersion = commandVersion('pnpm');
status('pnpm', Boolean(pnpmVersion), `${pnpmVersion || 'not found'} (expected ${expectedPnpm})`, Boolean(pnpmVersion) && pnpmVersion !== expectedPnpm);

for (const directory of ['docs', 'docs/categories', 'docs/courses', 'docs/public/img', 'admin', 'docs/.vitepress']) {
  const present = existsSync(path.join(root, directory));
  status(`directory ${directory}`, present, present ? 'present' : 'missing');
}
status('Markdown files', true, `${countFiles(path.join(root, 'docs'), '.md')} found`);
status('image files', true, `${countFiles(path.join(root, 'docs/public/img'))} found`);

for (const [label, port] of [['frontend', frontendPort], ['admin', adminPort]]) {
  const state = await portState(port);
  status(`${label} port ${port}`, state === 'available', state === 'available' ? 'available' : state === 'occupied' ? 'already in use' : state, state === 'occupied');
}

if (failed) {
  console.log('Doctor found blocking problems. Fix them before running pnpm local:dev.');
  process.exitCode = 1;
} else {
  console.log('Doctor check completed. Warnings are non-blocking.');
}
