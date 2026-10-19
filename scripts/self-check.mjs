#!/usr/bin/env node
/**
 * Dependency-free structural checks for this bundle.
 *
 *     npm test        # node scripts/self-check.mjs
 *
 * These run anywhere Node 20 is available — no DSH install, no node_modules —
 * which is what CI needs. They cover the package manifest, the bundle patch,
 * the character definition, the reference files and the generated module.
 * Deeper behavioural tests that need `@deepseek-ai/schemastery` live in the
 * maintainer toolchain and are described in docs/testing.md.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFile(fileURLToPath(new URL(rel, ROOT)), 'utf8');
const exists = async (rel) => {
  try {
    await stat(fileURLToPath(new URL(rel, ROOT)));
    return true;
  } catch {
    return false;
  }
};

let passed = 0;
const failures = [];

function check(name, ok, detail = '') {
  if (ok) {
    passed += 1;
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}
const eq = (name, actual, expected) => check(name, actual === expected, `got ${JSON.stringify(actual)}`);

const pkg = JSON.parse(await read('package.json'));
const patch = await read('cordis.patch.yml');
const character = JSON.parse(await read('character.json'));
const index = await read('index.js');
const readme = await read('README.md');
const detailLevels = ['minimal', 'standard', 'full'];
const configFields = ['detail', 'fewShotEnabled', 'sectionName', 'sectionOrder', 'includeRuntimeContext'];

// --------------------------------------------------------------------------
// package.json
// --------------------------------------------------------------------------
check('package.json: name is publishable (no @local scope, lowercase, hyphenated)',
  /^[a-z0-9][a-z0-9-]*$/.test(pkg.name), pkg.name);
check('package.json: version is semver', /^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(pkg.version), pkg.version);
check('package.json: description present', typeof pkg.description === 'string' && pkg.description.length > 20);
check('package.json: license is MIT', pkg.license === 'MIT', pkg.license);
check('package.json: module type', pkg.type === 'module', pkg.type);
check('package.json: not marked private', pkg.private !== true);
check('package.json: publishConfig.access is public', pkg.publishConfig?.access === 'public');
check('package.json: repository points at a git URL', /^git\+https:\/\/github\.com\//.test(pkg.repository?.url ?? ''));
check('package.json: bugs URL present', typeof pkg.bugs?.url === 'string');
check('package.json: keywords include dsh and dsh-plugin',
  Array.isArray(pkg.keywords) && pkg.keywords.includes('dsh') && pkg.keywords.includes('dsh-plugin'));
check('package.json: dsh.bundle.patch declares the patch file', pkg.dsh?.bundle?.patch === './cordis.patch.yml');
check('package.json: dsh.engines pins a DSH range', typeof pkg.dsh?.engines?.dsh === 'string');
check('package.json: exports "." resolves to index.js', pkg.exports?.['.'] === './index.js');
check('package.json: exports exposes ./package.json',
  pkg.exports?.['./package.json'] === './package.json');
check('package.json: exports exposes character.json', pkg.exports?.['./character.json'] === './character.json');
check('package.json: exports exposes locale glob', pkg.exports?.['./locale/*.json'] === './locale/*.json');
check('package.json: icon declared', pkg.icon === './icon.svg');

const requiredInFiles = ['index.js', 'character.json', 'cordis.patch.yml', 'icon.svg', 'locale/*.json', 'references/*.md'];
const missingFiles = requiredInFiles.filter((entry) => !pkg.files?.includes(entry));
check('package.json: files[] ships every runtime artifact', missingFiles.length === 0, missingFiles.join(', '));
check('package.json: files[] does not ship the build scripts', !pkg.files?.some((f) => f.startsWith('scripts')));

// --------------------------------------------------------------------------
// bundle patch
// --------------------------------------------------------------------------
check('patch: mounts this package', patch.includes(`name: '${pkg.name}'`));
check('patch: does not leave the old @local scope behind', !patch.includes('@local/'));
check('patch: declares exactly one agent preset',
  (patch.match(/name: '@deepseek-ai\/dsh-agent-preset'/g) ?? []).length === 1);
check('patch: preset id is character-standard', patch.includes('id: character-standard'));
check('patch: preset display name is set', patch.includes('name: 角色：恋兔光'));
check('patch: does not mount @deepseek-ai/dsh-persona (section-name collision)',
  !patch.includes("name: '@deepseek-ai/dsh-persona'"));
check('patch: overrides the default agent preset', patch.includes('id: agent-preset-registry') &&
  patch.includes('default: character-standard'));
check('patch: is valid YAML-ish (no tab indentation)', !/^\t/m.test(patch));

// --------------------------------------------------------------------------
// character.json
// --------------------------------------------------------------------------
const sectionNames = ['core', 'speech', 'personality', 'values', 'dimension', 'relationships', 'conversation', 'roleplay', 'retrieval'];
const missingSections = sectionNames.filter((name) => typeof character.sections?.[name] !== 'string' || character.sections[name].trim() === '');
check('character.json: all nine sections present and non-empty', missingSections.length === 0, missingSections.join(', '));
check('character.json: id/name/source present',
  Boolean(character.id && character.name && character.source), `${character.id} / ${character.name}`);
check('character.json: summary present', typeof character.summary === 'string' && character.summary.length > 40);
check('character.json: no unresolved {{...}} placeholders outside retrieval',
  Object.entries(character.sections)
    .filter(([key]) => key !== 'retrieval')
    .every(([, text]) => !text.includes('{{')));
check('character.json: retrieval keeps the references placeholder',
  character.sections.retrieval.includes('{{REFERENCES_DIR}}'));
check('character.json: few-shot examples are objects with situation + short line',
  Array.isArray(character.fewShot) && character.fewShot.length >= 10 &&
    character.fewShot.every((item) => typeof item.situation === 'string' && typeof item.line === 'string' && item.line.length <= 60));
check('character.json: conversation discipline forbids stage directions', character.sections.conversation.includes('不要描写任何动作'));
check('character.json: forbidden self-reference is spelled out',
  character.sections.core.includes('「老子」') && character.sections.core.includes('「本小姐」'));

// --------------------------------------------------------------------------
// generated index.js
// --------------------------------------------------------------------------
check('index.js: named export apply()', /export function apply\(ctx, config\)/.test(index));
check('index.js: named export renderCharacterPrompt()', /export function renderCharacterPrompt\(/.test(index));
check('index.js: exports the character definition', /export const character = CHARACTER/.test(index));
check('index.js: declares Cordis plugin name', index.includes("export const name = 'character-hikari-rento'"));
check('index.js: injects systemPrompt', index.includes("export const inject = ['systemPrompt']"));
check('index.js: Config validates every documented field',
  configFields.every((field) => index.includes(`${field}: z.`)));
check('index.js: every detail level is wired', detailLevels.every((level) => index.includes(`'${level}'`)));
check('index.js: no placeholder survived generation', !index.includes('@@'));
check('index.js: module tag matches the published name', index.includes(`@module ${pkg.name}`));
check('index.js: embeds the current character summary', index.includes(character.summary));
check('index.js: references path is resolved from import.meta.url', index.includes("new URL('./references/', import.meta.url)"));
check('index.js: prompt interpolation is disabled for persona text', index.includes('interpolate: false'));

// --------------------------------------------------------------------------
// references, locale, docs
// --------------------------------------------------------------------------
for (const file of ['references/index.md', 'references/persona.md', 'references/guardrails.md', 'references/world-commons.md', 'references/team-abilities.md']) {
  check(`${file} exists`, await exists(file));
}
const refIndex = await read('references/index.md');
check('references/index.md links every reference file',
  ['persona.md', 'guardrails.md', 'world-commons.md', 'team-abilities.md'].every((f) => refIndex.includes(f)));
for (const [file, field] of [['locale/zh.json', 'title'], ['locale/en.json', 'title']]) {
  const locale = JSON.parse(await read(file));
  check(`${file} has ${field} + description`, Boolean(locale[field] && locale.description));
}
const iconStat = await stat(fileURLToPath(new URL('icon.svg', ROOT)));
check('icon.svg is under the 256 KiB manifest limit', iconStat.size < 256 * 1024, `${iconStat.size} B`);
check('README.md documents every config field', configFields.every((field) => readme.includes(field)));
check('README.md links the licence', readme.includes('LICENSE'));

// --------------------------------------------------------------------------
// skill edition (generated from the same character.json)
// --------------------------------------------------------------------------
const skillMd = await read('skill/hikari-rento/SKILL.md');
const frontmatter = skillMd.startsWith('---\n') ? skillMd.slice(4, skillMd.indexOf('\n---\n')) : '';
check('skill: SKILL.md opens with YAML frontmatter', frontmatter.length > 0);
check('skill: frontmatter is named hikari-rento', /^name: hikari-rento$/m.test(frontmatter));
check('skill: description is present and long enough', /^description: .{40,}$/m.test(frontmatter));
check('skill: description stays spoiler-free',
  !/宇宙决战|模拟世界|顶替|记忆抹消/.test(frontmatter));
check('skill: carries the translator credit', skillMd.includes('译者：明日风等'));
check('skill: routes to the reference files', skillMd.includes('references/guardrails.md') &&
  skillMd.includes('references/world-commons.md') && skillMd.includes('references/team-abilities.md') &&
  skillMd.includes('references/persona.md'));
check('skill: tells the model to stay inside the skill directory', skillMd.includes('不要读技能目录以外'));
check('skill: no generator markers left', !skillMd.includes('@@'));
check('skill: no absolute Windows paths baked in', !/[A-Za-z]:\\\\/.test(skillMd));
const skillRefs = (await readdir(fileURLToPath(new URL('skill/hikari-rento/references/', ROOT)))).sort();
check('skill: all five reference files are copied', skillRefs.length === 5, skillRefs.join(', '));
check('skill: NOTICE travels with it', (await read('skill/hikari-rento/NOTICE.md')).includes('译者：明日风等'));
check('skill: LICENSE travels with it', (await read('skill/hikari-rento/LICENSE')).includes('MIT License'));

// --------------------------------------------------------------------------
// repository hygiene
// --------------------------------------------------------------------------
for (const file of ['LICENSE', 'NOTICE.md', 'CHANGELOG.md', 'README.en.md', 'CONTRIBUTING.md', '.gitignore', 'docs/skill.md']) {
  check(`${file} exists`, await exists(file));
}
check('LICENSE is MIT text', (await read('LICENSE')).includes('MIT License'));
check('NOTICE.md carries the fan-work disclaimer', (await read('NOTICE.md')).includes('原作'));
check('.gitignore ignores packaged artifacts', (await read('.gitignore')).includes('dist/'));

// --------------------------------------------------------------------------
// report
// --------------------------------------------------------------------------
const total = passed + failures.length;
if (failures.length > 0) {
  console.error(`\n${failures.length} of ${total} checks failed:\n`);
  for (const failure of failures) console.error(`  FAIL  ${failure}`);
  process.exit(1);
}
console.log(`all ${total} checks passed`);
