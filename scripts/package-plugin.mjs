#!/usr/bin/env node
/**
 * Package the plugin edition into `dist/<name>-<version>.tgz` with `npm pack`.
 *
 * Packaging is delegated to npm so the tarball matches exactly what `npm publish`
 * would upload (`files[]`, always-included files, etc.). `npm pack` runs inside
 * `packages/plugin`, then the tarball is moved into `dist/`.
 *
 *     npm run pack:plugin
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const PLUGIN_DIR = fileURLToPath(new URL('packages/plugin/', ROOT));
const pkg = JSON.parse(await readFile(fileURLToPath(new URL('packages/plugin/package.json', ROOT)), 'utf8'));

execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', ROOT)), '--check'], {
  stdio: 'inherit',
});

await mkdir(fileURLToPath(new URL('dist/', ROOT)), { recursive: true });

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
execFileSync(npm, ['pack'], {
  cwd: PLUGIN_DIR,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const filename = `${pkg.name}-${pkg.version}.tgz`;
await rename(
  fileURLToPath(new URL(`packages/plugin/${filename}`, ROOT)),
  fileURLToPath(new URL(`dist/${filename}`, ROOT)),
);

console.log(`packaged dist/${filename}`);
