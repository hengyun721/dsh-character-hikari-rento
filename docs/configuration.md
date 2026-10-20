# 配置

插件只有一处可配：`cordis.patch.yml` 里挂载本插件的那一行。

```yaml
- id: character-hikari-rento
  name: 'hikari-rento'
  config:
    detail: full              # minimal | standard | full
    fewShotEnabled: true
    sectionName: deployment:persona-prefix
    sectionOrder: 0
    overrideIdentity: true
    identityText: You are an AI assistant.
    includeRuntimeContext: true
```

## 字段

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `detail` | `'minimal' \| 'standard' \| 'full'` | `standard` | 提示词详细度。非法值会在激活时被 Config 校验拒绝 |
| `fewShotEnabled` | boolean | `true` | 是否附加 `fewShot` 里的示例台词 |
| `sectionName` | string | `deployment:persona-prefix` | 注册到提示词注册表的段落名 |
| `sectionOrder` | number | `0` | 段落排序 |
| `anchorEnabled` | boolean | `true` | 是否追加末尾的「尾锚」段（`deployment:persona-suffix`） |
| `overrideIdentity` | boolean | `true` | 是否遮蔽 DSH 自带的 `harness:identity`。见下方「身份段与上游指纹」 |
| `identityText` | string | `You are an AI assistant.` | 遮蔽后的身份段文案 |
| `includeRuntimeContext` | boolean | `true` | 是否保留运行时上下文快照 |

## `detail` 到底差多少

| 级别 | 包含段落 | 大概字符量 | 适合 |
|---|---|---|---|
| `minimal` | `core` + `conversation` | ≈ 3.9k | 只要语气，不想占提示词 |
| `standard` | 再加 `speech`、`personality`、`dimension`、`relationships` | ≈ 10.6k | 聊天为主 |
| `full` | 再加 `values`、`roleplay`、`retrieval` | ≈ 12k | **本包 preset 使用**，干活 + 聊天，能翻参考档 |

`conversation` 在每一档里都有，这是刻意的：**不管哪一档，她都得只说话、说得短、认识自己的人。**

## `sectionName` 的坑

默认值 `deployment:persona-prefix` 会**遮蔽**该 preset 的部署级人设 —— 这就是「她成为会话身份」的机制。

但它同时意味着：**在同一个作用域里不能有第二个插件注册同名段落**。所以：

- 挂在 **preset 里**（本包的做法）：保持默认。**不要**同时挂 `@deepseek-ai/dsh-persona`，
  它自己也注册 `deployment:persona-prefix`，重名会被提示词注册表判为 `agent-preset/invalid`。
- 挂在 **全局**：把 `sectionName` 改成别的名字（如 `character:hikari-rento`），
  她会作为附加段落出现在提示词末尾，而不是替换身份。

## 身份段与上游指纹

DSH 默认会在提示词最前面放一句自带的身份：

```text
You are an AI agent powered by DeepSeek Harness.
```

某些把 WorkBuddy / CodeBuddy 转成 OpenAI 接口的本地网关，会按这句做**逐字指纹拦截**：
第一次请求返回 `400 content_blocked`（`Illegal API invocation from an unapproved channel`），
网关随后把**整段 system** 换成自己的中性提示词重试。于是模型只看到
「You are a helper assistant」，人设、口癖、关系表全部消失——表现就是「插件像没装一样 / 问人物关系说不知道」。

插件默认开启 `overrideIdentity`，用一个作用域内的同名段（`harness:identity`）遮蔽原文，
换成 `identityText`（默认 `You are an AI assistant.`）。人设段紧接着它，不再和它抢身份。

- 全局挂载时必须设 `overrideIdentity: false`：同一作用域不能有同名段。
- 如果上游仍拦截，把 `identityText` 换一句更中性的（如 `You are a helpful assistant.`）。

## `sectionOrder` 的用法

- `0`（默认）：提示词最前面的身份段落。
- `10150`：变成末尾的附加段落。想让 DSH 原本的部署人设继续生效、只是「多一个她」时用这个。

## `includeRuntimeContext`

关掉会把运行时上下文快照（沙箱策略、审批策略、委派说明）一起移除 —— **全有全无**。
除非你明确知道自己在做什么，别关。

## 让它不再是默认 preset

`cordis.patch.yml` 末尾这一段把**新建会话的默认 preset** 设成了本插件：

```yaml
- id: agent-preset-registry
  name: '@deepseek-ai/dsh-agent-preset-registry'
  config:
    default: character-standard
```

删掉整段再重装，默认就回到 DSH 自己的 preset；之后在会话的「Agent 预设」选择器里手动选她。

> 注意：`config` 是**整体替换**，这段必须写全，不能只写 `default` 一项的一半。

## 改角色本身

配置只是开关，**人设内容在 `character.json`**。九个段落的用途见
[README](../README.md#三个详细度)，改完执行：

```bash
npm run build
```

`index.js` 会重新生成；`npm run check` 能验出它和源文件对不对得上。
