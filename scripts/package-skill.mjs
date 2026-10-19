#!/usr/bin/env node
/**
 * Package the skill edition into `dist/hikari-rento-skill-<version>.tgz`.
 *
 * The skill is generated from the same `character.json` as the plugin, so this
 * script first proves the artifacts are current (`build.mjs --check`) and then
 * tars `skill/hikari-rento/` — the directory an agent installs as one skill.
 *
 *     npm run skill
 */
import { execFileSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(fileURLToPath(new URL('package.json', ROOT)), 'utf8'));

// Fail loudly instead of shipping a skill that disagrees with character.json.
execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', ROOT)), '--check'], {
  stdio: 'inherit',
});

await mkdir(fileURLToPath(new URL('dist/', ROOT)), { recursive: true });
const filename = `hikari-rento-skill-${pkg.version}.tgz`;

execFileSync(
  'tar',
  ['-czf', fileURLToPath(new URL(`dist/${filename}`, ROOT)), '-C', fileURLToPath(new URL('skill/', ROOT)), 'hikari-rento'],
  { stdio: 'inherit' },
);

console.log(`packaged dist/${filename}`);
