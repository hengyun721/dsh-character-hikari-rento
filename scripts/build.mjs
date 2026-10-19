#!/usr/bin/env node
/**
 * Regenerate `index.js` from `character.json` and `scripts/index.template.js`.
 *
 * `index.js` embeds the whole character definition, so the plugin needs no
 * runtime file reads. `character.json` is the source of truth and the template
 * only holds the plugin shell — never hand-edit the generated `index.js`.
 *
 *     node scripts/build.mjs           # rewrite index.js
 *     node scripts/build.mjs --check   # exit 1 when index.js is stale
 *
 * `npm test` runs the `--check` form, so a stale index.js fails CI instead of
 * silently shipping a personа that disagrees with character.json.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const CHARACTER_FILE = fileURLToPath(new URL('character.json', ROOT));
const TEMPLATE_FILE = fileURLToPath(new URL('scripts/index.template.js', ROOT));
const PACKAGE_FILE = fileURLToPath(new URL('package.json', ROOT));
const OUTPUT_FILE = fileURLToPath(new URL('index.js', ROOT));

/** Section order used by every detail level. */
const ORDER = [
  'core',
  'speech',
  'personality',
  'values',
  'dimension',
  'relationships',
  'conversation',
  'roleplay',
  'retrieval',
];

/**
 * Which sections each `detail` level ships.
 *  - minimal  — identity + conversation discipline only
 *  - standard — adds the speech table, personality, dimension and relationships
 *  - full     — adds values, DSH role-play rules and the reference-file routing
 */
const DETAIL = {
  full: [
    'core',
    'speech',
    'personality',
    'values',
    'dimension',
    'relationships',
    'conversation',
    'roleplay',
    'retrieval',
  ],
  standard: ['core', 'speech', 'personality', 'dimension', 'relationships', 'conversation'],
  minimal: ['core', 'conversation'],
};

/** JSON block, formatted to sit inline inside the generated module. */
const block = (value) => JSON.stringify(value, null, 2);

function render(template, character, pkgName) {
  const sections = character.sections ?? {};
  const unknown = Object.keys(sections).filter((key) => !ORDER.includes(key));
  if (unknown.length > 0) {
    throw new Error(
      `character.json has section(s) that the generator does not know: ${unknown.join(', ')}\n` +
        'Add them to ORDER and DETAIL in scripts/build.mjs.',
    );
  }

  const embedded = {
    id: character.id,
    name: character.name,
    nameJa: character.nameJa,
    source: character.source,
    summary: character.summary,
    sections,
    fewShot: character.fewShot,
  };

  const out = template
    .replace('@@PACKAGE@@', pkgName)
    .replace('@@CHARACTER@@', block(embedded))
    .replace('@@DETAIL@@', block(DETAIL))
    .replace('@@FEWSHOT@@', block(character.fewShot ?? []));

  if (out.includes('@@')) throw new Error('placeholder substitution left a @@ marker behind');
  return out;
}

async function main() {
  const check = process.argv.includes('--check');
  const [template, characterRaw, pkgRaw] = await Promise.all([
    readFile(TEMPLATE_FILE, 'utf8'),
    readFile(CHARACTER_FILE, 'utf8'),
    readFile(PACKAGE_FILE, 'utf8'),
  ]);

  const output = render(template, JSON.parse(characterRaw), JSON.parse(pkgRaw).name);

  if (check) {
    const current = await readFile(OUTPUT_FILE, 'utf8').catch(() => '');
    if (current !== output) {
      console.error('index.js is out of date — run `npm run build`.');
      process.exit(1);
    }
    console.log('index.js matches character.json');
    return;
  }

  await writeFile(OUTPUT_FILE, output, 'utf8');
  console.log(`wrote index.js (${Buffer.byteLength(output, 'utf8')} bytes)`);
}

await main();
