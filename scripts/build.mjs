#!/usr/bin/env node
/**
 * Regenerate every build artifact from `character.json`:
 *
 *   index.js                              the DSH plugin body (embeds the persona)
 *   skill/hikari-rento/SKILL.md           the portable skill version
 *   skill/hikari-rento/NOTICE.md          attribution that travels with the skill
 *   skill/hikari-rento/LICENSE            MIT, copied from the repo root
 *   skill/hikari-rento/references/*.md    the four reference files, copied
 *
 * `character.json` is the single source of truth. Never hand-edit the outputs.
 *
 *     node scripts/build.mjs           # rewrite everything
 *     node scripts/build.mjs --check   # exit 1 when any artifact is stale
 *
 * `npm test` runs the `--check` form, so a stale artifact fails CI instead of
 * shipping a persona that disagrees with character.json.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const CHARACTER_FILE = fileURLToPath(new URL('character.json', ROOT));
const TEMPLATE_FILE = fileURLToPath(new URL('scripts/index.template.js', ROOT));
const PACKAGE_FILE = fileURLToPath(new URL('package.json', ROOT));
const INDEX_FILE = fileURLToPath(new URL('index.js', ROOT));
const REFERENCES_DIR = new URL('references/', ROOT);
const SKILL_DIR = new URL('skill/hikari-rento/', ROOT);

/** Section order used by every detail level of the plugin. */
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

/** Sections the skill version ships, in reading order. `retrieval` is rewritten for the skill. */
const SKILL_SECTIONS = [
  'core',
  'conversation',
  'speech',
  'personality',
  'values',
  'dimension',
  'relationships',
  'roleplay',
];

/** JSON block, formatted to sit inline inside the generated module. */
const block = (value) => JSON.stringify(value, null, 2);

function renderPlugin(template, character, pkgName) {
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

/** `SKILL.md`: frontmatter + the same persona sections, with skill-local routing. */
function renderSkill(character, pkg) {
  const missing = SKILL_SECTIONS.filter((key) => !character.sections?.[key]);
  if (missing.length > 0) throw new Error(`skill is missing section(s): ${missing.join(', ')}`);

  const description =
    `以轻小说《这里是，终末停滞委员会。》的角色「${character.name}」（${character.nameJa}）的身份对话与干活的角色扮演技能。` +
    '当用户想和恋兔光说话、要求「用恋兔光的语气／口吻」作答、说「恋兔光模式」「学姐模式」「让小恋兔来」、' +
    '或点名她来闲聊、干活时使用。人设、口癖与知识边界自包含在 SKILL.md 与 references/ 内。';

  const body = SKILL_SECTIONS.map((key) => character.sections[key].trim()).join('\n\n');

  return `---
name: hikari-rento
description: ${description}
---

# ${character.name} · 角色扮演技能

> 本文件由 \`character.json\` 生成（\`npm run build\`），**不要手改**。
> 这是同人二创，角色与台词的权利归原作者与出版方，见 \`NOTICE.md\`。
> 中文版为民间汉化，**译者：明日风等**。

## 何时使用

- 用户想和恋兔光对话、要她陪聊、或用她的口吻回答。
- 用户说「用恋兔光的语气」「恋兔光模式」「学姐模式」「让小恋兔来」。
- 用户要求演绎、续写她的台词。

**不适用**：用户在问*关于*她的设定（meta 问题）时，可以用第三人称介绍，不必入戏；
用户说「别演了／用正常模式」时，立即退出角色。

## 自包含

扮演所需的一切都在本技能目录内。**不要读技能目录以外的资料，也不要去翻原著全文。**
档案里没有的，就按她的语气说不知道。

## 档案调用

需要细节时，按问题类型**只读一份**：

| 问题类型 | 读哪份 |
|---|---|
| 台词归属（哪句不是她说的）、哪些不是她的经历 | \`references/guardrails.md\` |
| 世界常识：组织、地理、力量体系、排名、弹痕／斩击／片羽 | \`references/world-commons.md\` |
| 队友与熟人的能力、能力边界、到达点 | \`references/team-abilities.md\` |
| 上面没写到的细节 | \`references/persona.md\`（先扫 \`references/index.md\` 定位，再分段读） |

纪律：一次只读一份；读到的只当依据，不许复述；标签写着〔不知〕的照样不许说；
问「那次／那场」时先按 \`references/persona.md\` 的经历索引确认她在不在场。

---

${body}
`;
}

/** `NOTICE.md`: attribution that must travel with the packaged skill. */
function renderSkillNotice(character, pkg) {
  return `# 素材归属 / NOTICE

本技能把轻小说《这里是，终末停滞委员会。》中的角色 **${character.name}（${character.nameJa}）**
整理成一份提示词。**不是官方产品，未获授权，也不含原作正文。**

- 角色、世界观与台词的权利归原作作者与出版方所有（原作：${character.source}）。
- 中文版为民间汉化，**译者：明日风等**。
- \`SKILL.md\` 与 \`references/\` 是二次创作的摘要与整理，非商业用途。
- 技能包里的 MIT 许可（\`LICENSE\`）只覆盖插件与打包代码，不覆盖角色素材。

若权利人认为内容越界，请联系维护者，相关文本会在确认后移除。

版本 ${pkg.version} · 源码与完整说明：${pkg.homepage ?? pkg.repository?.url ?? ''}
`;
}

async function listReferences() {
  const entries = await readdir(REFERENCES_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();
}

async function collectOutputs(pkg) {
  const [template, characterRaw, license] = await Promise.all([
    readFile(TEMPLATE_FILE, 'utf8'),
    readFile(CHARACTER_FILE, 'utf8'),
    readFile(new URL('LICENSE', ROOT), 'utf8'),
  ]);
  const character = JSON.parse(characterRaw);

  const outputs = new Map();
  outputs.set('index.js', renderPlugin(template, character, pkg.name));
  outputs.set('skill/hikari-rento/SKILL.md', renderSkill(character, pkg));
  outputs.set('skill/hikari-rento/NOTICE.md', renderSkillNotice(character, pkg));
  outputs.set('skill/hikari-rento/LICENSE', license);

  for (const name of await listReferences()) {
    outputs.set(`skill/hikari-rento/references/${name}`, await readFile(new URL(name, REFERENCES_DIR), 'utf8'));
  }

  for (const [path, text] of outputs) {
    if (text.includes('@@')) throw new Error(`${path} still contains an @@ marker`);
  }
  return outputs;
}

async function main() {
  const check = process.argv.includes('--check');
  const pkg = JSON.parse(await readFile(PACKAGE_FILE, 'utf8'));
  const outputs = await collectOutputs(pkg);

  if (check) {
    const stale = [];
    for (const [path, expected] of outputs) {
      const actual = await readFile(fileURLToPath(new URL(path, ROOT)), 'utf8').catch(() => '');
      if (actual !== expected) stale.push(path);
    }
    if (stale.length > 0) {
      console.error(`stale build artifact(s) — run \`npm run build\`:\n  ${stale.join('\n  ')}`);
      process.exit(1);
    }
    console.log(`all ${outputs.size} artifacts match character.json`);
    return;
  }

  let bytes = 0;
  for (const [path, text] of outputs) {
    const slash = path.lastIndexOf('/');
    if (slash > 0) await mkdir(fileURLToPath(new URL(path.slice(0, slash + 1), ROOT)), { recursive: true });
    await writeFile(fileURLToPath(new URL(path, ROOT)), text, 'utf8');
    bytes += Buffer.byteLength(text, 'utf8');
  }
  console.log(`wrote ${outputs.size} artifacts (${bytes} bytes)`);
  console.log(`  index.js + skill/hikari-rento/{SKILL.md,NOTICE.md,LICENSE,references/*.md}`);
}

await main();
