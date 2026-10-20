# hikari-rento

恋兔光（《这里是，终末停滞委员会。》）的 **DeepSeek Harness 插件**。
装上之后，新会话里说话的人就是她。

> 这是 monorepo [hikari-rento](https://github.com/hengyun721/hikari-rento) 里的**插件包**。
> 完整说明、配置项、素材归属与姊妹项目（skill 版）见仓库主页。

## 安装

本目录就是 DSH 的组合包（`dsh.bundle.patch` → `cordis.patch.yml`）。
**安装目标是本目录，不是 monorepo 的仓库根** —— 根 `package.json` 没有 `dsh.bundle`。

- **本地目录**：DSH → **设置 → 插件 → 安装本地 bundle** → 选本目录
- **tgz**：装 Release 里的 `hikari-rento-1.0.3.tgz`
- **npm**：已发布，在插件管理器里填 `hikari-rento`（版本 1.0.3）；锁版本就写 `hikari-rento@1.0.3`

装完**重启客户端**，并且**新建一个会话**（不要在旧会话里切 preset）。

## 配置

```yaml
- id: character-hikari-rento
  name: 'hikari-rento'
  config:
    detail: full              # minimal | standard | full
    fewShotEnabled: true
    sectionName: deployment:persona-prefix
    sectionOrder: 0
    includeRuntimeContext: true
```

## 这个包里有什么

| 文件 | 作用 |
|---|---|
| `index.js` | 插件本体（由 `character.json` 生成，勿手改） |
| `cordis.patch.yml` | 声明 agent preset 并挂载本插件 |
| `character.json` | 本包内嵌的角色定义副本 |
| `references/` | 按需读取的四份参考档（⚠️ 含剧透） |
| `locale/`、`icon.svg` | 插件卡片的显示名与图标 |

MIT · 版本 1.0.3 · 同人企划，素材归属见 [NOTICE.md](https://github.com/hengyun721/hikari-rento/blob/main/packages/plugin/NOTICE.md)
