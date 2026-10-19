# Skill 版

`packages/skill/` 是这份人设的**第二种发行形态**：给不跑 DSH 的 agent 用。
它和插件包是**并行发行**的两个包 —— 各自版本号、各自 tag（`skill-v*` / `plugin-v*`）、
各自 Release，但都由仓库根目录的 `character.json` 生成。

## 它长什么样

```
packages/skill/
├── package.json      # npm: hikari-rento-skill
├── SKILL.md          # 生成物：frontmatter + 人设（按 skill 的顺序重排）
├── references/       # 四份参考档 + 一页索引，从仓库根目录拷来
├── NOTICE.md         # 素材归属与译者署名，跟着技能走
└── LICENSE           # MIT，只覆盖打包代码，不覆盖角色素材
```

`SKILL.md` 的 `description` 写的是**什么时候该用它**（「和恋兔光说话」「恋兔光模式」等），
宿主的 skill 机制靠这段决定要不要加载。人设正文与插件同源，只是把 `retrieval` 段
换成了指向本目录 `references/` 的路由。

## 生成与打包

```bash
npm run build       # character.json → 两个包的全部产物
npm run check       # 逐个比对，任何一边漂了都失败
npm run pack:skill  # 打包成 dist/hikari-rento-skill-<version>.tgz
```

`npm run build` **同时**刷新插件与 skill；`npm run check` 会逐个文件比对，
所以「改了人设只更新了一边」这种事故会直接被 CI 拦下。

## 安装

把 `packages/skill/` 整个目录拷到宿主的 skills 目录即可（各宿主路径不同，
常见是用户级 `~/.<agent>/skills/` 或项目级 `./.skills/`）。也可以直接用 Release 里的
`hikari-rento-skill-<version>.tgz` 解开：

```bash
tar -xzf hikari-rento-skill-1.0.0.tgz -C ~/.claude/skills/
```

装完新开一个会话，说「恋兔光模式」试一句。

## 和插件的区别

| | `hikari-rento`（插件） | `hikari-rento-skill`（技能） |
|---|---|---|
| 身份 | **替换**会话人设（遮蔽部署级 persona） | **附加**：宿主决定何时加载 |
| 工具 | 与官方 `standard` 完全一致 | 用宿主自己的工具 |
| 参考档 | `detail: full` 时按路由按需读取 | 同样按路由按需读取，路径在本目录内 |
| 分发 | npm / 插件管理器 | 目录拷贝 / Release 里的 tgz |
| tag | `plugin-v*` | `skill-v*` |

内容同源，差别只在装载方式：插件是「换掉身份」，skill 是「按需借一副嗓子」。

## 注意

- skill 里含原作剧透（`references/` 就是剧本设定），别直接贴到公开讨论区。
- 打包产物在 `dist/`，已被 `.gitignore` 忽略；正式发布走 GitHub Release 的附件。