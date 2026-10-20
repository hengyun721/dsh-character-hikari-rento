# hikari-rento

[中文](README.md) | [English](README.en.md)

[![npm: hikari-rento](https://img.shields.io/npm/v/hikari-rento?style=flat-square&logo=npm&label=plugin)](https://www.npmjs.com/package/hikari-rento)
[![npm: hikari-rento-skill](https://img.shields.io/npm/v/hikari-rento-skill?style=flat-square&logo=npm&label=skill)](https://www.npmjs.com/package/hikari-rento-skill)
[![Stars](https://img.shields.io/github/stars/hengyun721/hikari-rento?style=flat-square&logo=github&label=Stars)](https://github.com/hengyun721/hikari-rento/stargazers)
[![License](https://img.shields.io/github/license/hengyun721/hikari-rento?style=flat-square&label=%E8%AE%B8%E5%8F%AF%E8%AF%81)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/hengyun721/hikari-rento/ci.yml?style=flat-square&label=CI)](https://github.com/hengyun721/hikari-rento/actions)

**把《这里是，终末停滞委员会。》的恋兔光做成人设，两个发行形态：DeepSeek Harness 插件，和一份可移植的 skill。**

「完美无缺的最强美少女」、尾巴上的「～」「♪」「啦」「哦」「呢」，以及盔甲底下那个
怕烫怕辣怕鬼、把真心藏到最后、只会说「我是无敌的」来让别人安心的笨拙少女。

两者**并行发行、同源生成**：`character.json` 是唯一真源，插件包与技能包各自版本号、
各自 tag、各自 Release，谁也不是谁的附属产物。

> ⚠️ **剧透提示**：`references/`、`人设.md`、`证据与归属说明.md` 以及两个包里的
> `references/` 副本都有原作六卷的剧情细节。**README 和 `docs/` 不含剧透**。

## 两种形态

| | [`hikari-rento`](packages/plugin) | [`hikari-rento-skill`](packages/skill) |
|---|---|---|
| 是什么 | DeepSeek Harness **bundle 插件** | 可移植 **skill** 包 |
| 怎么加载 | 声明 agent preset，**替换**会话人设 | 宿主按需加载，**借**一副嗓子 |
| 工具 | 与官方 `standard` preset 完全一致 | 用宿主自己的工具 |
| 装法 | `npm i hikari-rento` / 插件管理器 | 拷目录 / 解开 `.tgz` |
| tag | `plugin-v*` | `skill-v*` |

## 安装

### 插件（DSH）

```bash
npm i hikari-rento
```

装完在 DSH 里 **设置 → 插件 → 安装** `hikari-rento@latest`，**重启客户端**，然后**新建会话**。
从源码装则指向 `packages/plugin/` 目录。

### Skill（任意 agent）

把 [`packages/skill/`](packages/skill) 整个目录拷进宿主的 skills 目录，或者解开 Release 里的
`hikari-rento-skill-<version>.tgz`：

```bash
tar -xzf hikari-rento-skill-1.0.0.tgz -C ~/.claude/skills/
```

然后新开一个会话，说「恋兔光模式」。

### 装完请「新建会话」

- **正确**：安装/重载 bundle 后 → 完全退出并重开客户端 → **新建会话**。
- **不要**：在已经建好的会话里用预设选择器切成这个插件。

DSH 的 preset 注册表把「会话作用域 → preset 版本」记在一次性绑定表里，旧会话重绑会撞上
`dsh-scope: scope key is already bound to a parent`。新建一个会话就绕开了。

## 插件会做什么

| 能力 | 说明 |
|---|---|
| **换掉会话身份** | 注册 `deployment:persona-prefix`，遮蔽该 preset 的部署级人设 —— 不是「模仿她」，是「她本人」 |
| **干活能力不变** | preset 的工具清单逐行对照官方 `standard`：文件、终端、搜索、子 agent、工作流、skill 全都在 |
| **只把最终回答入戏** | 读文件、跑命令、报错误用正常工程语气；交付时压缩成她的一到三句话 |
| **知道什么、不知道什么** | 每条设定都带〔我〕亲历／〔听〕听说／〔不知〕／〔忘〕标签，越界就说不记得 |
| **不认领别人的战绩** | 别处来的经历、别人打过的仗 —— 问到会纠正，而不是顺着演 |
| **出场就往回收** | 默认一到两句，不写动作、不写括号旁白、不把招牌台词一整套念完 |
| **口头有素材池** | 11 组按语境分好的短台词，挑一句走；不复用、不复读，语境错配才算错 |

## 配置

装完不需要任何配置 —— `cordis.patch.yml` 已把**新建会话的默认 preset** 设成「角色：恋兔光」。
不想让它当默认：删掉补丁末尾 `- id: agent-preset-registry` 那一段再重装。

想调的人改 preset 里挂载插件的那一行：

```yaml
- id: character-hikari-rento
  name: 'hikari-rento'
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
| `fewShotEnabled` | `true` | 附加 15 条**短**示例台词。嫌占 token 就关掉 |
| `sectionName` | `deployment:persona-prefix` | 段落名。默认值会**遮蔽**部署级人设；**只有全局挂载时才需要改**成别的名字 |
| `sectionOrder` | `0` | 放在提示词最前面；改成 `10150` 变成末尾的附加段落 |
| `includeRuntimeContext` | `true` | 关掉会连沙箱策略、审批策略一起移除（全有全无） |

### 三个详细度

| 段落 | 内容 | `minimal` | `standard` | `full` |
|---|---|:---:|:---:|:---:|
| `core` | 她是谁、怎么说话、是什么样的人、禁止项 | ✓ | ✓ | ✓ |
| `conversation` | 对话纪律：不写动作、默认一到两句、口癖要有节制 | ✓ | ✓ | ✓ |
| `speech` | 口癖速查表 | | ✓ | ✓ |
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
| 台词归属（哪句不是她说的）、哪些不是她的经历 | `references/guardrails.md` |
| 世界常识：组织、地理、力量体系、RANK、Stage、弹痕／斩击／片羽 | `references/world-commons.md` |
| 队友与熟人的能力、能力边界、到达点 | `references/team-abilities.md` |
| 上面没写到的细节 | `references/persona.md`（先扫 `references/index.md` 定位） |

纪律写在段落里：一次只读一份、读到的只当依据不许复述、档案里没有的就按「不知道」办。
参考档目录的**绝对路径由 `index.js` 在加载时用 `import.meta.url` 算出来**，装到哪都成立。

## 目录结构

```
hikari-rento/
├── character.json          # 角色定义：唯一真源
├── references/             # 四份参考档（源头，⚠️ 含剧透）
├── packages/
│   ├── plugin/             # npm: hikari-rento —— DSH 插件
│   │   ├── index.js        # 生成物：插件本体
│   │   ├── cordis.patch.yml
│   │   ├── character.json  # 生成的副本
│   │   └── references/     # 生成的副本
│   └── skill/              # npm: hikari-rento-skill —— 技能包
│       ├── SKILL.md        # 生成物：frontmatter + 人设
│       └── references/     # 生成的副本
├── scripts/                # build / self-check / package-plugin / package-skill
├── docs/                   # 安装、配置、架构、测试、发行、skill
├── 人设.md                 # character.json 的可读版（⚠️ 含剧透）
├── 证据与归属说明.md        # 逐卷证据（⚠️ 含剧透）
└── .github/workflows/ci.yml
```

改人设**只改 `character.json`**（要改设定细节则同时改 `references/`），再 `npm run build`：
插件包与技能包一起重生成，`npm run check` 逐个比对。

## 文档

| 文档 | 内容 |
|---|---|
| [docs/install.md](docs/install.md) | 两种形态的装法、升级、卸载、排障表 |
| [docs/skill.md](docs/skill.md) | Skill 版与插件的差别、打包、安装 |
| [docs/configuration.md](docs/configuration.md) | 全部配置项、详细度、`sectionName` 冲突 |
| [docs/architecture.md](docs/architecture.md) | 插件怎么工作、生成链、文件职责 |
| [docs/testing.md](docs/testing.md) | 测试覆盖、怎么加断言、人工验收 |
| [docs/publishing.md](docs/publishing.md) | 发 npm、两套 tag、发版检查单 |

## 开发与测试

```bash
npm run build      # character.json → 两个包的全部产物
npm run check      # 产物是否与 character.json 同步
npm test           # 零依赖结构自检（80 条，CI 同款）
npm run pack       # 打包 plugin 与 skill 到 dist/
npm run privacy    # 扫本机路径、密钥、邮箱
npm run verify     # check + test + privacy
```

CI（`.github/workflows/ci.yml`）在 Node 20 / 22 上跑 `npm run verify`，再把两个包各打一份
artifact —— 不需要装 DSH，也不需要任何依赖。

## 发版

两套 tag，互不牵连：

```bash
# 插件
npm version patch -w packages/plugin
git tag plugin-v$(node -p "require('./packages/plugin/package.json').version")

# 技能
npm version patch -w packages/skill
git tag skill-v$(node -p "require('./packages/skill/package.json').version")
```

细节与检查单见 [docs/publishing.md](docs/publishing.md)。

## 已知限制

- **她仍然会跑偏。** 档案调用是**提示词级**的纪律，不是宿主的 skill 机制。
- **人设是压缩的。** 六卷的细节压成十来段提示词，边界靠标签兜底。
- **只在包层面验证过。** 产物一致性与补丁结构有逐项断言；DSH 里的实际安装生效依赖插件管理器版本。
- **同人作品。** 素材归属见 [NOTICE.md](NOTICE.md)。

## 素材与授权

- **代码**：MIT，见 [LICENSE](LICENSE)。
- **角色素材**：《这里是，终末停滞委员会。》的角色、世界观与台词归原作者与出版方所有。
  本仓库是**未获授权的同人企划**，不含原作正文，只放二次创作的摘要与整理，非商业用途。
- **翻译来源**：中文版为民间汉化，**译者：明日风等**（详见 [NOTICE.md](NOTICE.md)）。
- **每次校对都留痕**：哪些台词容易被误挂到她身上，记在 [证据与归属说明.md](证据与归属说明.md)。

## 贡献

欢迎提 issue 与 PR。改人设前请先读 [CONTRIBUTING.md](CONTRIBUTING.md)：
这个项目**宁可答「不知道」，也不许编** —— 加设定要能指出卷数与场景。