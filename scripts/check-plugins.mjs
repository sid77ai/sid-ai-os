#!/usr/bin/env node
// Dependency-free structural smoke check for the SID AI-OS Hermes plugin pack.
// This does NOT verify runtime rendering, data persistence, or approval enforcement.
import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directories = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('sid-'))
  .map((entry) => entry.name)
  .sort();

const failures = [];
const tabPaths = new Set();

if (directories.length === 0) failures.push('No sid-* plugin directories found');

for (const name of directories) {
  const dashboardDir = path.join(root, name, 'dashboard');
  try {
    const manifest = JSON.parse(await readFile(path.join(dashboardDir, 'manifest.json'), 'utf8'));
    if (manifest.name !== name) failures.push(`${name}: manifest name mismatch`);
    if (typeof manifest.label !== 'string' || !manifest.label.trim()) {
      failures.push(`${name}: manifest label missing`);
    }
    const tab = manifest.tab?.path;
    if (typeof tab !== 'string' || !tab.startsWith('/')) {
      failures.push(`${name}: invalid tab.path`);
    } else if (tabPaths.has(tab)) {
      failures.push(`${name}: duplicate tab.path ${tab}`);
    } else {
      tabPaths.add(tab);
    }
    if (manifest.entry !== 'dist/index.js') {
      failures.push(`${name}: unexpected entry ${JSON.stringify(manifest.entry)}`);
      continue;
    }

    const bundlePath = path.join(dashboardDir, manifest.entry);
    const source = await readFile(bundlePath, 'utf8');
    const registration =
      source.includes(`.register('${name}',`) ||
      source.includes(`.register("${name}",`);
    if (!registration) failures.push(`${name}: registration not found in bundle`);

    const syntax = spawnSync(process.execPath, ['--check', bundlePath], { encoding: 'utf8' });
    if (syntax.error || syntax.status !== 0) {
      failures.push(`${name}: JavaScript syntax check failed: ${syntax.error?.message || syntax.stderr.trim()}`);
    }
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: ${directories.length} plugin manifests, unique tabs, registrations, and JavaScript syntax checked`);
  console.log('LIMITATION: no Hermes runtime rendering, behavior, persistence, or approval-gate validation');
}
