# hikari-rento-skill

恋兔光（《这里是，终末停滞委员会。》）的 **角色扮演技能**（skill）。
给不跑 DeepSeek Harness 的 agent 用：Claude Code、Codex、WorkBuddy 之类。

> 这是 monorepo [hikari-rento](https://github.com/hengyun721/hikari-rento) 里的**技能包**。
> 姊妹项目：[hikari-rento](https://github.com/hengyun721/hikari-rento/tree/main/packages/plugin)（DSH 插件）。

## 安装

把本目录整个放进宿主的 skills 目录（用户级 `~/.<agent>/skills/` 或项目级 `./.skills/`），
或者解开 Release 里的 `hikari-rento-skill-<version>.tgz`：

```bash
tar -xzf hikari-rento-skill-1.0.1.tgz -C ~/.claude/skills/
```

然后新开一个会话，说「恋兔光模式」试一句。

## 内容

| 文件 | 作用 |
|---|---|
| `SKILL.md` | frontmatter + 人设正文（生成物，勿手改） |
| `references/` | 四份参考档 + 索引（⚠️ 含剧透） |
| `NOTICE.md` | 素材归属与译者署名 |

MIT（只覆盖打包代码）· 版本 1.0.1 · 素材归属见 [NOTICE.md](./NOTICE.md)
