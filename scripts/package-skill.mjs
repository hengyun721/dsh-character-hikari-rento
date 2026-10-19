#!/usr/bin/env node
/**
 * Package the skill edition into `dist/hikari-rento-skill-<version>.tgz`.
 *
 * The skill is generated from the same `character.json` as the plugin, so this
 * script first proves the artifacts are current (`build.mjs --check`), then
 * stages `packages/skill/` as `hikari-rento/` and tars it — so `tar -x` drops a
 * single skill folder into the host's skills directory.
 *
 * BSD tar (bundled with Windows) has no `--transform`, hence the staging copy.
 *
 *     npm run pack:skill
 */
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(fileURLToPath(new URL('packages/skill/package.json', ROOT)), 'utf8'));

// Fail loudly instead of shipping a skill that disagrees with character.json.
execFileSync(process.execPath, [fileURLToPath(new URL('scripts/build.mjs', ROOT)), '--check'], {
  stdio: 'inherit',
});

await mkdir(fileURLToPath(new URL('dist/', ROOT)), { recursive: true });

const stage = await mkdtemp(join(tmpdir(), 'hikari-rento-skill-'));
const staged = join(stage, 'hikari-rento');
await cp(fileURLToPath(new URL('packages/skill/', ROOT)), staged, { recursive: true });

const filename = `${pkg.name}-${pkg.version}.tgz`;
execFileSync('tar', ['-czf', fileURLToPath(new URL(`dist/${filename}`, ROOT)), '-C', stage, 'hikari-rento'], {
  stdio: 'inherit',
});

await rm(stage, { recursive: true, force: true });
console.log(`packaged dist/${filename}`);
