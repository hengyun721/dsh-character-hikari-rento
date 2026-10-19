# Changelog

所有重要改动都记在这里。格式参照 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [2.1.0] — 2026-10-19

**并行发行 Skill 版。** 同一份 `character.json` 现在同时产出 DSH 插件与一份可移植 skill。

### Added

- `skill/hikari-rento/`：`SKILL.md`（frontmatter + 九段人设，`retrieval` 改写为技能内路由）、
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

- **包名**：`@local/dsh-character-hikari-rento` → `dsh-character-hikari-rento`（`@local` 作用域发不上 npm）。
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
