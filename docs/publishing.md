# 发行

从「本地能跑的 bundle」到「别人 `npm i` 就能装」，一共五步。

## 0. 仓库归属

本仓库已经指向 **`hengyun721/dsh-character-hikari-rento`**：README 徽章、`package.json` 的
`repository` / `homepage` / `bugs`、issue 模板里的链接都是这个地址。

要挂到别的账号或组织名下，先统一替换（把 `hengyun721` 换成你的名字）：

```powershell
Get-ChildItem -Recurse -File -Include *.md,*.json,*.yml | ForEach-Object {
  (Get-Content $_.FullName -Raw).Replace('hengyun721/dsh-character-hikari-rento', 'YOUR-NAME/dsh-character-hikari-rento') |
    Set-Content $_.FullName -NoNewline -Encoding utf8
}
```

```bash
# macOS / Linux
grep -rl 'hengyun721/dsh-character-hikari-rento' --include='*.md' --include='*.json' --include='*.yml' . \
  | xargs sed -i 's|hengyun721/dsh-character-hikari-rento|YOUR-NAME/dsh-character-hikari-rento|g'
```

替换后 `npm run verify` 仍然要全绿。

## 1. 建仓库

```bash
git init
git add .
git commit -m "chore: initial public release"
git branch -M main
git remote add origin https://github.com/hengyun721/dsh-character-hikari-rento.git
git push -u origin main
```

装了 `gh` 的话一步到位：

```bash
gh repo create hengyun721/dsh-character-hikari-rento --public --source=. --push
```

在仓库设置里补齐**发行样式**：

| 项 | 值 |
|---|---|
| About → Description | 把《这里是，终末停滞委员会。》的恋兔光装进 DeepSeek Harness 的人设插件 |
| Topics | `dsh` `dsh-plugin` `cordis` `deepseek-harness` `persona` `roleplay` `character-card` |
| Website | `https://www.npmjs.com/package/dsh-character-hikari-rento`（发布后） |
| Features | 打开 Issues；Discussions 可选；Wiki 不需要 |
| Social preview | 用 `assets/banner.svg` 导一张 PNG 上传 |

## 2. 发 npm

```bash
npm login
npm run verify        # 绿了再发
npm publish           # prepublishOnly 会再跑一遍 verify
```

- 包名 `dsh-character-hikari-rento` 已确认在 npm 上可用；换名字记得同步 `cordis.patch.yml`
  里 `name:` 那一行和 `scripts/index.template.js` 里的 `@module` 标记（都走 `npm run build`）。
- `exports` / `files` 决定装出来能拿到什么，`npm pack --dry-run` 可以先看一眼内容。
- 2.x 的 `dsh.engines.dsh` 是 `>=0.2.0-rc.1`；将来 DSH 改了 bundle 语义，这里要跟着改。

## 3. 打 tag 与 Release

```bash
git tag v2.0.0
git push origin v2.0.0
```

Release 说明直接从 `CHANGELOG.md` 对应小节抄；附上安装命令与已知限制。
标题建议 `v2.0.0 — 可以公开发行了`。

## 4. （可选）进创意工坊

DSH 的插件市场（dsh-web / dsh-market）用一份 workshop 清单描述插件：类型、集成方式、
生命周期、权限、兼容版本、能力与验证证据。本仓库没有预置那份文件，因为字段与市场版本绑定，
写死了反而会过期。需要提交时，按市场当期的模板补一份，与 `package.json` 的
`name` / `version` / `dsh.bundle.patch` 对齐即可。

## 5. 发版检查单

- [ ] `npm run verify` 全绿
- [ ] 仓库地址一致（`git grep hengyun721/dsh-character-hikari-rento` 全部指向这个仓库）
- [ ] `CHANGELOG.md` 写了这一版
- [ ] `package.json` 的 `version` 与 tag 一致
- [ ] `npm pack --dry-run` 的文件清单里没有多余东西（没有 `.bak`、没有工作区其他目录）
- [ ] README 的安装命令能照抄执行
- [ ] 装一遍（本地目录或 tgz），重启客户端，**新建会话**，问一句看是不是她

## 版本号约定

| 改动 | 版本 |
|---|---|
| 只改人设文本、参考档 | patch（`2.0.0` → `2.0.1`） |
| 新增配置项、新增段落、生成器行为变化 | minor |
| 包名、preset id、挂载方式、必填段落结构变化 | major |

人设改动也建议记进 `CHANGELOG.md`：谁在哪一版把哪句台词改了，日后校对时能救命。
