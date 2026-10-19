# dsh-character-hikari-rento

[中文](README.md) | [English](README.en.md)

[![npm](https://img.shields.io/npm/v/dsh-character-hikari-rento?style=flat-square&logo=npm&label=npm)](https://www.npmjs.com/package/dsh-character-hikari-rento)
[![Stars](https://img.shields.io/github/stars/hengyun721/dsh-character-hikari-rento?style=flat-square&logo=github&label=Stars)](https://github.com/hengyun721/dsh-character-hikari-rento/stargazers)
[![License](https://img.shields.io/github/license/hengyun721/dsh-character-hikari-rento?style=flat-square&label=license)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/hengyun721/dsh-character-hikari-rento/ci.yml?style=flat-square&label=CI)](https://github.com/hengyun721/dsh-character-hikari-rento/actions)
[![DSH](https://img.shields.io/badge/DeepSeek%20Harness-%E2%89%A50.2.0--rc.1-4b6bfb?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)

**Rento Hikari from *This Is the Terminal Stagnation Committee* as your DeepSeek Harness session persona —
install it, open a new session, and the one talking is her.**

The self-proclaimed "flawless strongest beautiful girl", the trailing `～` `♪` `啦` `哦` `呢`,
and the girl underneath the armor: afraid of hot food, ghosts and her own feelings,
who says "I'm invincible" mostly so that everyone else can stop being scared.

This is not a text character card. It is a **DSH bundle plugin**: one persona section,
one agent preset, and four reference files read only when a question actually needs them.

> The character speaks Chinese in-fiction; the persona prompt and the reference files are
> written in Chinese on purpose (that is the voice being reproduced). This README is the
> English entry point for everything around it.

> ⚠️ **Spoilers**: `references/`, `人设.md` and `证据与归属说明.md` describe plot details from
> all six volumes. **README and `docs/` are spoiler-free.**

---

## What it does

| Capability | Detail |
|---|---|
| **Replaces the session persona** | Registers `deployment:persona-prefix`, shadowing the preset's deployment persona — she *is* the identity, not an impression of it |
| **Keeps the full toolset** | The preset's plugin list is a line-by-line copy of the official `standard` preset: files, shell, search, subagents, workflows, skills |
| **Stays in character only at the end** | Reading files, running commands and reporting errors use plain engineering language; the final answer is hers, one to three sentences |
| **Knows what she does not know** | Every fact carries a 〔我〕experienced / 〔听〕heard / 〔不知〕unknown / 〔忘〕erased tag; past the boundary she says she does not remember |
| **Refuses borrowed credit** | Experiences from elsewhere and battles others fought — she corrects you instead of playing along |
| **Short by default** | One or two sentences, no stage directions, no bracketed narration, no full catchphrase recital |

## Install

```bash
npm i dsh-character-hikari-rento
```

Then in DSH: **Settings → Plugins → install** `dsh-character-hikari-rento@latest`, and restart the client.

From a checkout instead: **Settings → Plugins → install local bundle**, pointing at this directory.
Installing a bundle runs plugin code inside the Host process, so it needs full access or one approval.

**Always open a new session after installing.** Switching the preset inside an existing session hits
`dsh-scope: scope key is already bound to a parent` — a preset-registry edge case, unrelated to this plugin.

> Upgrading from 1.x: the package was renamed from `@local/dsh-character-hikari-rento`.
> Remove the old bundle first; the plugin manager clears the stale row on reinstall.

## Configuration

No configuration is required — the bundle patch already makes **"角色：恋兔光"** the default preset for
new sessions. To opt out, delete the trailing `- id: agent-preset-registry` block from
`cordis.patch.yml` and pick the preset by hand in the session's preset picker.

Otherwise, tweak the row that mounts this plugin:

```yaml
- id: character-hikari-rento
  name: 'dsh-character-hikari-rento'
  config:
    detail: full              # minimal | standard | full
    fewShotEnabled: true      # append 15 short example lines
    sectionName: deployment:persona-prefix
    sectionOrder: 0
    includeRuntimeContext: true
```

| Field | Default | Meaning |
|---|---|---|
| `detail` | `standard` | Prompt verbosity; this bundle ships `full` |
| `fewShotEnabled` | `true` | Append 15 short few-shot lines (≤ 40 chars each, with context) |
| `sectionName` | `deployment:persona-prefix` | Section name. The default **shadows** the deployment persona; only change it when mounting the plugin globally instead of inside a preset |
| `sectionOrder` | `0` | `0` puts her at the very front of the prompt; `10150` appends her at the end instead of replacing the identity |
| `includeRuntimeContext` | `true` | Turning this off also removes sandbox, approval and delegation guidance — all or nothing |

### Detail levels

| Section | Content | `minimal` | `standard` | `full` |
|---|---|:---:|:---:|:---:|
| `core` | Who she is, how she talks, who she is as a person, prohibitions | ✓ | ✓ | ✓ |
| `conversation` | Conversation discipline: no stage directions, one or two sentences, restrained quirks | ✓ | ✓ | ✓ |
| `speech` | Speech-pattern cheat sheet | | ✓ | ✓ |
| `personality` | Personality: surface, interior, weak points, the one trigger | | ✓ | ✓ |
| `dimension` | Which continuity she is in, and where her knowledge stops | | ✓ | ✓ |
| `relationships` | Relationship table across allies, schools, organisations and other continuities | | ✓ | ✓ |
| `values` | Values | | | ✓ |
| `roleplay` | How to act while doing agent work | | | ✓ |
| `retrieval` | Which reference file answers which kind of question | | | ✓ |

## Reference routing (`references/`)

`full` appends a routing paragraph: the resident persona handles voice and common sense, and only four
kinds of questions go look something up.

| Question | File |
|---|---|
| Quote attribution, and which events are not hers | [`references/guardrails.md`](references/guardrails.md) |
| World common sense: organisations, geography, power system, ranks | [`references/world-commons.md`](references/world-commons.md) |
| Teammates' and acquaintances' abilities and their limits | [`references/team-abilities.md`](references/team-abilities.md) |
| Anything else | [`references/persona.md`](references/persona.md) |

The absolute path of `references/` is resolved at load time from `import.meta.url`,
so the plugin works wherever it is installed.

## Repository layout

```
dsh-character-hikari-rento/
├── package.json            # bundle manifest: dsh.bundle.patch, icon, files[]
├── cordis.patch.yml        # composition patch: declares the agent preset and mounts the plugin
├── index.js                # plugin body (GENERATED from character.json)
├── character.json          # character definition: the single source of truth
├── scripts/                # build.mjs, index.template.js, self-check.mjs
├── references/             # four reference files + a one-page index (⚠️ spoilers)
├── locale/{zh,en}.json     # plugin card title and description
├── docs/                   # install, configuration, architecture, testing, publishing
├── 人设.md                 # human-readable version of character.json (⚠️ spoilers)
├── 证据与归属说明.md        # per-volume evidence and quote-attribution warnings (⚠️ spoilers)
└── icon.svg
```

Edit `character.json`, then `npm run build` to regenerate `index.js`.

## Docs

| File | Contents |
|---|---|
| [docs/install.md](docs/install.md) | Install paths, upgrades, uninstall, troubleshooting |
| [docs/configuration.md](docs/configuration.md) | Every config field, detail levels, the `sectionName` collision |
| [docs/architecture.md](docs/architecture.md) | How the bundle works, the generation chain, file responsibilities |
| [docs/testing.md](docs/testing.md) | What the checks cover and how to add one |
| [docs/publishing.md](docs/publishing.md) | npm publish, repo setup, release checklist |

## Development

```bash
npm run build     # character.json + template → index.js
npm run check     # index.js is in sync + syntax check
npm test          # dependency-free structural checks (50+)
npm run verify    # all of the above
```

CI runs `npm run verify` on Node 20 with no dependencies installed.

## Known limitations

- **She still drifts.** Reference routing is a prompt-level discipline, not a host skill mechanism.
- **The persona is compressed.** Six volumes into a dozen prompt sections; long-form continuity is not guaranteed.
- **Verified at the plugin level.** Code, patch structure and parity with the official preset are asserted;
  whether the Desktop install activates correctly depends on the plugin manager version.
- **Fan work.** See [NOTICE.md](NOTICE.md).

## License and credits

- **Code**: MIT — see [LICENSE](LICENSE).
- **Character material**: the characters, setting and lines of *This Is the Terminal Stagnation Committee*
  belong to the original author and publisher. This repository is an **unofficial fan project**, ships no
  novel text, and is non-commercial. See [NOTICE.md](NOTICE.md).
- **Translation**: the Chinese edition was a fan translation — **translator: 明日风 et al.**
  (credits in [NOTICE.md](NOTICE.md)). Names, move names and lines in this repository follow that edition.
- **Contributing**: read [CONTRIBUTING.md](CONTRIBUTING.md) first. This project would rather answer
  "I don't know" than invent canon.
