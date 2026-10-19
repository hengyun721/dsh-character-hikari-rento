# dsh-character-hikari-rento

[中文](README.md) | [English](README.en.md)

[![npm](https://img.shields.io/npm/v/dsh-character-hikari-rento?style=flat-square&logo=npm&label=npm)](https://www.npmjs.com/package/dsh-character-hikari-rento)
[![Stars](https://img.shields.io/github/stars/hengyun721/dsh-character-hikari-rento?style=flat-square&logo=github&label=Stars)](https://github.com/hengyun721/dsh-character-hikari-rento/stargazers)
[![License](https://img.shields.io/github/license/hengyun721/dsh-character-hikari-rento?style=flat-square&label=%E8%AE%B8%E5%8F%AF%E8%AF%81)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/hengyun721/dsh-character-hikari-rento/ci.yml?style=flat-square&label=CI)](https://github.com/hengyun721/dsh-character-hikari-rento/actions)
[![DSH](https://img.shields.io/badge/DeepSeek%20Harness-%E2%89%A50.2.0--rc.1-4b6bfb?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)

**把《这里是，终末停滞委员会。》的恋兔光装进 DeepSeek Harness —— 挂上去之后，新会话里说话的人就是她。**

「完美无缺的最强美少女」、尾巴上的「～」「♪」「啦」「哦」「呢」，以及盔甲底下那个
怕烫怕辣怕鬼、把真心藏到最后、只会说「我是无敌的」来让别人安心的笨拙少女。

这不是一张文本角色卡，而是一个 **DSH bundle 插件**：一个人设段落 + 一个 agent preset +
四份按需读取的参考档。装上就能干活，干完活再变回她的口吻。

> ⚠️ **剧透提示**：`references/`、`人设.md`、`证据与归属说明.md` 里有原作六卷的剧情细节
> （人物关系、事件归属）。**README 和 `docs/` 不含剧透**，随便看。

---

## 它会做什么

| 能力 | 说明 |
|---|---|
| **换掉会话身份** | 注册 `deployment:persona-prefix`，遮蔽该 preset 的部署级人设 —— 不是「模仿她」，是「她本人」 |
| **干活能力不变** | preset 的工具清单逐行对照官方 `standard`：文件、终端、搜索、子 agent、工作流、skill 全都在 |
| **只把最终回答入戏** | 读文件、跑命令、报错误用正常工程语气；交付时压缩成她的一到三句话 |
| **知道什么、不知道什么** | 每条设定都带〔我〕亲历／〔听〕听说／〔不知〕／〔忘〕标签，越界就说不记得 |
| **不认领别人的战绩** | 别处来的经历、别人打过的仗 —— 问到会纠正，而不是顺着演 |
| **出场就往回收** | 默认一到两句，不写动作、不写括号旁白、不把招牌台词一整套念完 |

## 安装

### npm（推荐）

```bash
npm i dsh-character-hikari-rento
```

装完在 DSH 里：**设置 → 插件 → 安装** `dsh-character-hikari-rento@latest`，然后**重启客户端**。

### 本地目录

把仓库克隆下来，在 **设置 → 插件 → 安装本地 bundle** 里指向这个目录的绝对路径。
安装 bundle 会在 Host 进程里执行插件代码，所以需要**完全权限**或一次批准。

### 装完请「新建会话」

- **正确**：安装/重载 bundle 后 → 完全退出并重开客户端 → **新建会话**。
- **不要**：在已经建好的会话里用预设选择器切成这个插件。

原因是 DSH 的 preset 注册表把「会话作用域 → preset 版本」记在一次性绑定表里，
在旧会话上重绑会撞上 `dsh-scope: scope key is already bound to a parent`。
新建一个会话就绕开了，与本插件无关。

> **从 1.x 升级**：包名从 `@local/dsh-character-hikari-rento` 改成了
> `dsh-character-hikari-rento`。请先移除旧 bundle 再装新的；旧 profile 里若还留着
> `@local/...` 那一行，让插件管理器重装/同步一次即可清掉。

## 用法

装完不需要任何配置 —— `cordis.patch.yml` 已经把**新建会话的默认 preset** 设成
「角色：恋兔光」。不想让它当默认：删掉补丁文件末尾 `- id: agent-preset-registry`
那一段再重装，然后在会话的「Agent 预设」选择器里手动选。

想调的人改 preset 里挂载本插件的那一行：

```yaml
- id: character-hikari-rento
  name: 'dsh-character-hikari-rento'
  config:
    detail: full              # minimal | standard | full
    fewShotEnabled: true      # 是否附加示例台词
    sectionName: deployment:persona-prefix
    sectionOrder: 0
    includeRuntimeContext: true
```

| 字段 | 默认 | 说明 |
|---|---|---|
| `detail` | `standard` | 提示词详细度，见下表。本包的 preset 用 `full` |
| `fewShotEnabled` | `true` | 附加 15 条**短**示例台词（每条 ≤ 40 字，带情境）。嫌占 token 就关掉 |
| `sectionName` | `deployment:persona-prefix` | 段落名。默认值会**遮蔽**部署级人设；**只有把插件挂到全局（不在 preset 里）时才需要改**成别的名字，如 `character:hikari-rento`，否则与提示词注册表自身的人设段落同名冲突 |
| `sectionOrder` | `0` | 放在提示词最前面。改成 `10150` 可以让她变成末尾的附加段落，而不是替换身份 |
| `includeRuntimeContext` | `true` | 关掉会连沙箱策略、审批策略、委派说明一起移除（全有全无），一般别关 |

### 三个详细度

| 段落 | 内容 | `minimal` | `standard` | `full` |
|---|---|:---:|:---:|:---:|
| `core` | 她是谁、怎么说话、是什么样的人、禁止项 | ✓ | ✓ | ✓ |
| `conversation` | 对话纪律：不写动作、默认一到两句、口癖要有节制 | ✓ | ✓ | ✓ |
| `speech` | 口癖速查表（自称、句尾、惊慌叠字、定式台词、语域） | | ✓ | ✓ |
| `personality` | 性格要点（外显／内里／软肋／破格条件） | | ✓ | ✓ |
| `dimension` | 她的次元归属与知识边界：哪些场面她不在场 | | ✓ | ✓ |
| `relationships` | 关系表：同伴／学校／卡乌斯／Corporations／组织／敌对／别次元 | | ✓ | ✓ |
| `values` | 价值观 | | | ✓ |
| `roleplay` | 在代理工作流里怎么演 | | | ✓ |
| `retrieval` | 档案调用：四类问题分别读哪一份参考档 | | | ✓ |

`conversation` 刻意放进 `minimal`：**不管哪一档，她都得只说话、说得短、认识自己的人。**

## 档案调用（`references/`）

`full` 会在提示词末尾附一段路由：常驻人设负责语气与常识，只有这四类问题才去翻档案。

| 问题类型 | 读哪份 |
|---|---|
| 台词归属（哪句不是她说的）、哪些不是她的经历 | [`references/guardrails.md`](references/guardrails.md) |
| 世界常识：组织、地理、力量体系、RANK、Stage、弹痕／斩击／片羽 | [`references/world-commons.md`](references/world-commons.md) |
| 队友与熟人的能力、能力边界、到达点 | [`references/team-abilities.md`](references/team-abilities.md) |
| 上面没写到的细节 | [`references/persona.md`](references/persona.md)（先扫 [`index.md`](references/index.md) 定位，再分段读） |

纪律写在段落里：一次只读一份、读到的只当依据不许复述、档案里没有的就按「不知道」办。
参考档目录的**绝对路径由 `index.js` 在加载时用 `import.meta.url` 算出来**，
所以装到哪个目录、换哪台机器都成立，不用改配置。

## Skill 版（给别的 agent 用）

同一份 `character.json` 还会生成一份**可移植的 skill**：`skill/hikari-rento/`
（`SKILL.md` + `references/` + `NOTICE.md` + `LICENSE`）。不想装 DSH、或者想把这副嗓子
借给 Claude Code / Codex / WorkBuddy 之类的 agent，就用这一版。

```bash
npm run build     # character.json → index.js + skill/hikari-rento/**
npm run skill     # 打包成 dist/hikari-rento-skill-<version>.tgz
```

装的时候把 `skill/hikari-rento/` 整个目录拷进宿主的 skills 目录，或者解开 Release 里的
`hikari-rento-skill-<version>.tgz`，新开一个会话说「恋兔光模式」。

插件与 skill **同源**：`npm run check` 会逐个文件比对，改了人设只更新一边会被 CI 拦下。
差别只在装载方式 —— 插件是**换掉**会话身份，skill 是**按需**借一副嗓子。
细节见 [docs/skill.md](docs/skill.md)。

## 目录结构

```
dsh-character-hikari-rento/
├── package.json            # bundle 清单：dsh.bundle.patch、图标、files[]
├── cordis.patch.yml        # 组合补丁：声明 agent preset 并挂载本插件
├── index.js                # 插件本体（**生成物**，由 character.json 产出）
├── character.json          # 角色定义：唯一真源
├── scripts/
│   ├── build.mjs           # character.json + template → index.js + skill/**
│   ├── index.template.js   # 生成器模板（插件外壳）
│   ├── package-skill.mjs   # 把 skill/ 打成 dist/*.tgz
│   └── self-check.mjs      # 零依赖结构自检，CI 跑的就是它
├── skill/hikari-rento/     # **生成物**：可移植的 skill 版（SKILL.md + references/ + NOTICE + LICENSE）
├── references/             # 四份按需读取的参考档 + 一页索引（⚠️ 含剧透）
├── locale/{zh,en}.json     # 插件卡片显示名与描述
├── docs/                   # 安装、配置、架构、测试、发行说明
├── 人设.md                 # character.json 的可读版（给人看的，⚠️ 含剧透）
├── 证据与归属说明.md        # 逐卷证据、易误归属的台词警告（⚠️ 含剧透）
└── icon.svg                # 插件图标
```

改角色**只改 `character.json`**，再 `npm run build` 重新生成 `index.js`。

## 文档

| 文档 | 内容 |
|---|---|
| [docs/install.md](docs/install.md) | 三种装法、升级、卸载、排障表 |
| [docs/skill.md](docs/skill.md) | Skill 版的生成、打包、安装与它与插件的差别 |
| [docs/configuration.md](docs/configuration.md) | 全部配置项、详细度、`sectionName` 冲突 |
| [docs/architecture.md](docs/architecture.md) | 插件怎么工作、生成链、文件职责 |
| [docs/testing.md](docs/testing.md) | 测试覆盖、怎么加断言、人工验收 |
| [docs/publishing.md](docs/publishing.md) | 发 npm、建仓库、发版检查单 |

## 开发与测试

```bash
npm run build     # character.json → index.js + skill/hikari-rento/**
npm run check     # 插件与 skill 是否都与 character.json 同步 + 语法检查
npm test          # 零依赖结构自检（70+ 条，CI 同款）
npm run skill     # 打包 skill 版成 dist/*.tgz
npm run verify    # 以上全部（除 skill 打包）
```

CI（`.github/workflows/ci.yml`）在 Node 20 上只跑 `npm run verify` —— 不需要装 DSH，
也不需要任何依赖。装了 DSH 之后想跑更深的宿主行为测试，见 [docs/testing.md](docs/testing.md)。

## 已知限制

- **她仍然会漂。** 档案调用是**提示词级**的纪律，不是宿主的 skill 机制：可能该读不读，
  也可能不该读却去读了。想卡死在机制上，得改用 skill 那一套。
- **人设是压缩的。** 六卷的细节压成十来段提示词，边界靠标签兜底，不保证长篇剧情一致。
- **只在插件层面验证过。** 代码、补丁结构与官方 preset 的一致性有逐项断言；
  Desktop 里的安装生效依赖插件管理器，不同版本的实际表现可能不同。
- **同人作品。** 素材归属见 [NOTICE.md](NOTICE.md)。

## 素材与授权

- **代码**：MIT，见 [LICENSE](LICENSE)。
- **角色素材**：《这里是，终末停滞委员会。》的角色、世界观与台词归原作者与出版方所有。
  本仓库是**未获授权的同人企划**，不含原作正文，只放二次创作的摘要与整理，非商业用途。
  详见 [NOTICE.md](NOTICE.md)。
- **翻译来源**：中文版为民间汉化，**译者：明日风等**（署名见 [NOTICE.md](NOTICE.md)）。
  本仓库的人设与参考档是从这份中文译本里整理出来的，人名、招式名、台词均沿用该译本。
- **每次校对都留痕**：哪些台词容易误挂到她身上、哪些设定不是她亲历的，
  记在 [证据与归属说明.md](证据与归属说明.md)。

## 贡献

欢迎提 issue 与 PR。改人设前请先读 [CONTRIBUTING.md](CONTRIBUTING.md)：
这个项目**宁可答「不知道」，也不许编** —— 加设定要能指出卷数与场景。
