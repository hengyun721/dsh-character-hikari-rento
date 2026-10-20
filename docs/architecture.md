# 架构

## 它其实只做一件事

把一个**人设段落**注册进当前 agent 作用域的系统提示词，并且取一个能**遮蔽**部署级人设的名字。
剩下的都是围绕这一件事的包装。

```
安装 bundle
   │
   ├─ package.json  dsh.bundle.patch ─────────► cordis.patch.yml
   │                                              │
   │                                              ├─ insert: agent preset「character-standard」
   │                                              │     └─ plugins[] 里挂本包 + 官方 standard 的全套工具
   │                                              └─ override: agent-preset-registry.default
   │
   └─ index.js  apply(ctx, config)
         │
         ├─ renderCharacterPrompt(detail, fewShot)
         │     ├─ 取 DETAIL_SECTIONS[detail] 列出的段落，按顺序拼接
         │     ├─ 可选：把 fewShot 拼成【示例台词】
         │     └─ 把 {{REFERENCES_DIR}} 换成 references/ 的绝对路径
         │
         └─ ctx.systemPrompt.section({ name, order, text, interpolate: false })
               └─ name 默认 deployment:persona-prefix → 遮蔽部署级人设
```

## 为什么补丁要写一整个 preset

DSH 的 agent preset 是一份**插件清单**。要让「干活能力和官方 `standard` 一样」这句话成立，
清单就得逐行对照官方 `standard` 写全 —— 只把其中的 `@deepseek-ai/dsh-persona` 换成本插件。

两处刻意的选择：

1. **不挂 `@deepseek-ai/dsh-persona`。** 它自己也注册 `deployment:persona-prefix`，
   与本插件重名，同一作用域内会被提示词注册表直接判为 `agent-preset/invalid`。
   注册人设段落这件事只由本插件一行负责。
2. **不挂多余的插件。** 多一个工具就等于把「与 standard 等价」这句话变成假的。
   `scripts/self-check.mjs` 里有一条断言盯着「补丁里恰好一个 agent preset」。

## 生成链

```
character.json ──┬─（speechPools 并进 speech 段）──┐
references/ ─────┼────────────────────────────────┼─ scripts/build.mjs ─┬─► packages/plugin/（index.js、character.json、references/、README）
scripts/index.template.js ───────────────────────┘                     └─► packages/skill/（SKILL.md、references/、README）
```

- **`character.json` 与根目录 `references/` 是唯一真源。** 想改人设改这里。
- **两个包里的产物都是生成的**：插件的 `index.js` 内嵌角色定义（运行时不读文件），
  skill 的 `SKILL.md` 是全文本；参考档在两边各放一份副本，供各自的相对路径使用。
- **`speechPools`（口头池）在渲染时并进 `speech` 段**，所以插件与 skill 拿到的是同一份池子；
  包内的 `character.json` 仍是未合并的原始副本，避免重复合并。
- `npm run check` 会用同样的输入重算全部产物并逐字节比对，不一致就退出码 1 —— 这防止
  「人设改了但忘记重新生成」，以及「只更新了插件、漏了 skill」。

模板单独放一个文件的理由：生成物里有反引号、`${}` 和 `\\`，把它们塞进 JS 字符串模板会变成
一层套一层的转义迷宫；模板文件本身就是纯文本，替换三个 `@@...@@` 占位符即可，还顺带可读。

## 运行期的 IO 只有一处

`REFERENCES_DIR`：

```js
const REFERENCES_DIR = fileURLToPath(new URL('./references/', import.meta.url));
```

用 `import.meta.url` 而不是 `process.cwd()` 或写死路径，所以插件装到哪个目录、
换哪台机器、npm 还是本地目录，都对。`detail: full` 时这个绝对路径被写进路由段，
她照着它去读档案。

## 参考档路由是「提示词级」的

`retrieval` 段告诉她在哪四类问题上去读哪一份，以及一套纪律：一次只读一份、读到的只当依据
不许复述、档案里没有的就按「不知道」办、不许去翻原著全文。

**这是提示词，不是机制。** 她可能该读不读、也可能不该读却去读。想卡死在机制上，
得换成宿主的 skill 那一套（`skill` 工具 + `SKILL.md`）。这个限制写在 README 的「已知限制」里，
不做过度承诺。

## 文件职责一览

| 文件 | 谁是它的读者 | 职责 |
|---|---|---|
| `package.json` | DSH / npm | bundle 清单、导出、文件清单、发行元数据 |
| `cordis.patch.yml` | DSH Loader | 声明 preset 并挂载本插件 |
| `index.js` | DSH Host | 插件本体（生成物） |
| `character.json` | 维护者 / 生成器 | 角色定义，唯一真源 |
| `scripts/index.template.js` | 生成器 | 插件外壳（导出、Config、apply） |
| `scripts/build.mjs` | 维护者 / CI | 生成两个包的产物，`--check` 检测漂移 |
| `scripts/self-check.mjs` | CI / 维护者 | 零依赖结构自检 |
| `references/*.md` | 她在运行时 | 按需读取的设定档案 |
| `人设.md` | 人 | `character.json` 的可读版 |
| `证据与归属说明.md` | 维护者 | 逐卷证据与误归属警告 |
