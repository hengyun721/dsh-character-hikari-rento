#!/usr/bin/env node
/**
 * Privacy guard: fail when a tracked file leaks local machine details.
 *
 *     npm run privacy
 *
 * Checks for absolute Windows/Unix paths, home directories, loopback URLs,
 * access tokens, e-mail addresses and internal workspace folder names.
 * Runs in CI through `npm run verify`, so a stray `C:\Users\...` cannot be
 * committed by accident.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SELF = 'scripts/privacy-check.mjs';
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist']);
const TEXT_EXT = /\.(md|json|ya?ml|js|mjs|cjs|ts|txt|svg|html)$/;

/** Files that legitimately mention a pattern because they test for it. */
const EXEMPT = new Map([['scripts/self-check.mjs', new Set(['Windows 绝对路径'])]]);

const RULES = [
  ['Windows 绝对路径', /[A-Za-z]:\\[^\s"'`)]*/g],
  ['Unix 家目录', /\/(?:Users|home)\/[A-Za-z0-9._-]+\//g],
  ['本机回环地址', /\b(?:127\.0\.0\.1|localhost)(?::\d+)?\b/g],
  ['私有网段', /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g],
  ['访问令牌', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|npm_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16})\b/g],
  ['邮箱地址', /\b[\w.+-]+@(?!users\.noreply\.github\.com)(?![0-9])[\w-]+\.[a-z]{2,}\b/gi],
  ['内部目录名', /生产工具|cyber product/g],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else if (TEXT_EXT.test(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

const findings = [];

for await (const file of walk(ROOT)) {
  const rel = relative(ROOT, file).split('\\').join('/');
  if (rel === SELF) continue;

  const text = await readFile(file, 'utf8').catch(() => '');
  if (!text) continue;

  const lines = text.split('\n');
  for (const [label, pattern] of RULES) {
    if (EXEMPT.get(rel)?.has(label)) continue;
    lines.forEach((line, index) => {
      for (const match of line.matchAll(pattern)) {
        findings.push({ file: rel, line: index + 1, label, sample: match[0].slice(0, 60) });
      }
    });
  }
}

if (findings.length > 0) {
  console.error(`${findings.length} possible leak(s):\n`);
  for (const f of findings.slice(0, 40)) {
    console.error(`  ${f.file}:${f.line}  [${f.label}]  ${f.sample}`);
  }
  process.exit(1);
}

console.log('privacy check passed — no local paths, tokens or contact details');
