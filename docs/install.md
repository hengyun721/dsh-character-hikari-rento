# 安装与升级

四种装法、升级与卸载，以及一张排障表。装完记得**新建会话**，原因见下。

## 要求

| | |
|---|---|
| DeepSeek Harness | **≥ 0.2.0-rc.1**（`package.json` 的 `dsh.engines.dsh`） |
| Node | ≥ 20（只影响本地构建；装了插件本身不需要 Node） |
| 权限 | 安装 bundle 会在 Host 进程里执行插件代码，需要**完全权限**或一次批准 |

## 方式一：npm

```bash
npm i hikari-rento
```

然后在 DSH 里 **设置 → 插件 → 安装** `hikari-rento@latest`，**重启客户端**。

## 方式二：本地目录

```bash
git clone https://github.com/hengyun721/hikari-rento.git
```

**设置 → 插件 → 安装本地 bundle**，指向克隆出来的目录（绝对路径）。

## 方式三：从源码自己打

```bash
git clone https://github.com/hengyun721/hikari-rento.git
cd hikari-rento
npm run verify        # 先确认生成物与自检全绿
npm pack              # 产出 hikari-rento-2.0.0.tgz
```

装 tgz 与装本地目录等价；`files[]` 已经列清楚会打进包里的一切。

## 装完必须「新建会话」

- **正确**：安装/重载 bundle → 完全退出并重开客户端 → **新建会话**。
- **不要**：在已经建好的会话里用预设选择器切成这个插件。

原因：DSH 的 preset 注册表把「会话作用域 → preset 版本」的绑定记在 `dsh-scope` 的
一次性绑定表里（`scopeParents` 是 WeakMap，一个 key 只能绑一次），而绑定记录会随会话拆卸被清掉。
于是在旧会话上切换 preset 时，注册表会拿同一个作用域 key 再绑一次，直接命中
`dsh-scope: scope key is already bound to a parent` 这条不变式。换一个新建会话就绕开了 ——
这是注册表侧的边缘情况，与本插件无关。

## 升级

| 从 | 到 | 要做的事 |
|---|---|---|
| 2.x | 2.x | 直接装新版，重启，开新会话 |
| 1.x | 2.x | 包名变了（`@local/...` → `hikari-rento`）。先移除旧 bundle，再装新的；旧 profile 里若还留着 `@local/...` 那一行，让插件管理器重装/同步一次 |
| 任意 | 任意 | **不要**手写 `$DSH_HOME/profiles/<profile>/package.json`，也不要在 profile 目录里跑 pnpm —— 那些步骤由插件管理器负责 |

## 卸载

**设置 → 插件** 里移除本 bundle，重启客户端。
若之前把它设成了默认 preset，移除后默认 preset 会回到 DSH 自己的 `standard`。

`references/` 与 `character.json` 都是插件目录里的普通文件，移除 bundle 时一并带走，不会残留。

## 排障

| 症状 | 大概率原因 | 怎么做 |
|---|---|---|
| 预设列表里没有「角色：恋兔光」 | 没重启 / 装到了别的 profile | 完全退出客户端再开；确认当前 profile |
| 切预设时报 `scope key is already bound to a parent` | 在已存在的会话里切了 preset | 新建一个会话 |
| 她答得又长又像解说 | `detail` 太小 / 模型把「示例台词」当模板 | 调到 `full`；`fewShotEnabled: false` 试试 |
| 她会认领没经历过的剧情 | 参考档没被读到 | 确认 `detail: full`，且 `references/` 四份都在 |
| 提示词里出现「档案」「设定」这类出戏词 | 模型的自我解释习惯 | 属于概率性表现，`core` 里已有禁止项；可在 issue 里贴一段复现 |
| 干活时也用她的口吻报错 | `roleplay` 段没进提示词 | 需要 `detail: full` |

更多细节见 [配置](configuration.md) 与 [测试](testing.md)。
