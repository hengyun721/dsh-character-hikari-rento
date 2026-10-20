# Changelog

所有重要改动都记在这里。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [plugin 1.0.2 / skill 1.0.2] — 2026-10-19

### Added

- **`npm run privacy`**：扫本机绝对路径、回环地址、私有网段、访问令牌、邮箱与内部目录名；
  已并入 `npm run verify`，CI 自动执行。
- `conversation` 新增两条：**反应不必每次都有**（有就从口头池按语境随机挑，不复用）；
  **叙事用她的说法、事实不许改**（数字用比喻、失败自嘲、严重的事轻描淡写）。

### Fixed

- `证据与归属说明.md` 里指向本地工具链的路径改成「本地（不随仓库分发）」，
  不再暴露工作区目录结构。
- README / README.en / CONTRIBUTING / docs 同步口头池与隐私检查。
## [plugin 1.0.1 / skill 1.0.1] — 2026-10-19

### Added

- **口头池（`speechPools`）**：11 组、55 条按语境分组的短台词（得意／被夸／被质疑／嫌麻烦／甩锅／
  惊慌心虚／温柔／战斗／日常／被戳穿／挑衅），附在 `speech` 段后。
- 选句方式是「按语境随机挑一条」——不做查重、不记录用过哪条；语境错配才算错，说法不同不算错。

### Changed

- `build.mjs` 在渲染前把 `speechPools` 并进 `speech` 段，插件与 skill 共用同一份结果；
  包内 `character.json` 仍是未合并的原始副本。

### Fixed

- 池内条目已抽掉具体事件与专名：能原样用的（A 级）直接收，含情节的（B 级）改写为语气骨架，
  剧透过重的（C 级）弃用。逐条来源表留在本地，不随仓库分发。
## [plugin 1.0.0 / skill 1.0.0] — 2026-10-19

**改名 + 拆包：单仓双包，两套 tag。** 早先的 `dsh-character-hikari-rento` 2.x 系列到此为止。

### Changed（breaking）

- 项目改名：`dsh-character-hikari-rento` → `hikari-rento`；npm 包名同步改为 `hikari-rento`
  与 `hikari-rento-skill`。
- 拆成 monorepo：`packages/plugin`（DSH 插件）+ `packages/skill`（可移植 skill），
  共用根目录的 `character.json` 与 `references/`。两个包各自版本、各自 tag、各自 Release。
- 版本重置：插件 2.1.0 → **1.0.0**，skill 首次独立发行 **1.0.0**。
- tag 改为两套：`plugin-v*` / `skill-v*`。旧的 `v2.0.0` / `v2.1.0` 保留为历史，不再追加。
- 安装目标变为 `packages/plugin/`；`cordis.patch.yml` 里挂载的包名改为 `hikari-rento`。

### Added

- `scripts/package-plugin.mjs` 与 `scripts/package-skill.mjs`；`npm run pack` 一次打出两个包。
- 自检扩到 80 条：两个包的清单、patch、生成产物、参考档副本、README 一致性全覆盖。
- `packages/*/README.md` 改为生成物，随包版本自动更新。

### Removed

- 根目录不再是可以直接安装的 bundle：`index.js`、`cordis.patch.yml`、`locale/`、`icon.svg`
  都移进了 `packages/plugin/`。
## [2.1.0] — 2026-10-19

**并行发行 Skill 版。** 同一份 `character.json` 现在同时产出 DSH 插件与一份可移植 skill。

### Added

- `packages/skill/`：`SKILL.md`（frontmatter + 九段人设，`retrieval` 改写为技能内路由）、
  `references/`（四份参考档 + 索引的副本）、`NOTICE.md`（含**译者：明日风等**）、`LICENSE`。
- `scripts/package-skill.mjs` + `npm run skill`：打包成 `dist/hikari-rento-skill-<version>.tgz`。
- `docs/skill.md`：插件与 skill 的差别、生成/打包/安装方式。
- 自检新增 13 条 skill 断言（frontmatter、剧透-free 的 description、参考档齐全、NOTICE/许可证随包）。
- CI 增加「打包 skill 并上传 artifact」一步。

### Changed

- `scripts/build.mjs` 由「只出 `index.js`」升级为「出 9 个产物」，`npm run check` 逐个比对，
  插件与 skill 任何一边漂了都会失败。
- README／README.en 增加 Skill 版章节、目录结构与命令更新。

### Fixed

- README 去 banner 大图；补翻译署名；公开文档（README／README.en／CONTRIBUTING／CHANGELOG）去剧透，
  两个 README 顶部加剧透提示。

## [2.0.0] — 2026-10-18

**从「工作区里的私有 bundle」变成可以公开发行的插件。** 角色内容与 1.1.0 一致，改的是外壳。

### Changed

- **包名**：`@local/hikari-rento` → `hikari-rento`（`@local` 作用域发不上 npm）。
  `cordis.patch.yml` 里挂载本插件的那一行、`index.js` 的 `@module` 标记同步更新。
- `package.json` 补齐发行元数据：`repository`、`homepage`、`bugs`、`publishConfig`、`engines`、
  `dsh.engines`、`exports`（含 `character.json` 与 `cordis.patch.yml`）与准确的 `files[]`。
- README 重写为中文主档 + 英文副档（`README.en.md`），补徽章、banner、安装/配置/结构/限制/授权各节。

### Added

- `scripts/build.mjs` + `scripts/index.template.js`：**生成链进了仓库**。`character.json` 是唯一真源，
  `npm run build` 生成 `index.js`，`npm run check` 检测是否漂移。此前这步靠工作区里的 Python 脚本。
- `scripts/self-check.mjs`：50+ 条零依赖结构自检（清单、补丁、九个段落、生成物、参考档、locale、卫生）。
- `docs/`：安装、配置、架构、测试、发行五份说明。
- `CONTRIBUTING.md`、`NOTICE.md`（同人身份与素材归属）、`SECURITY.md`、`LICENSE`（MIT）。
- `.github/workflows/ci.yml`（Node 20 跑 `npm run verify`）、issue 模板、PR 模板。
- `.gitignore` / `.gitattributes`（统一 LF）。

### Removed

- 交付目录里的 `character.json.bak`（旧快照，已由 git 历史承担）。

## [1.1.0] — 2026-10-18

### Added

- **档案调用**：`detail: full` 在提示词末尾附一段路由，指向 `references/` 的四份参考档；
  路径由 `import.meta.url` 在加载时解析，不写死。

### Removed

- **`character-pure`（纯扮演）预设**：没有读文件工具，路由无从落地，只剩半套人设。

### Changed

- `character-standard` 改跑 `detail: full`。

## [1.0.1] — 2026-10-18

- 默认工具预设显示名改为「角色：恋兔光」。
- 工作流程统一为正常工程语气，只有最终回答转换为恋兔光口吻。
- `character.json`、`人设.md` 与生成的 `index.js` 同步。

## [1.0.0] — 2026-10-17

- 最终校对：统一了同名角色在不同次元的归属；补上「默认已被忘记」的记忆设定；
  把主次元与别次元的同名角色拆开处理。
- 补第六卷的人物关系网与知识边界四档标签。
- 新增 `world-commons.md`、`team-abilities.md`。
- 删除误归引用（「操纵人类……」「自由意志……」「你当我是谁啊？」等）。

## [0.9.0] — 2026-10-14

- 关系表自查第二轮：修正若干误归引用，人物关系的口径统一为「公开否认、私下亲近」。
- 补宿舍日常、后辈往事与几处卷末场面。
- 新增「不要认领没经历过的事」与「经历归属」防护块。
