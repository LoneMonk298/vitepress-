---
name: git-push
description: 检查变更、暂存、提交并推送到本项目的 GitHub 仓库。当用户说"帮我提交"、"推送代码"、"commit并push"时使用。不要用于创建新仓库或切换 remote。
---

# Git Push — 本项目一键提交推送

## 固定参数

- 工作目录：`d:\Repositories\vitepress-`
- 远程仓库：`origin → https://github.com/LoneMonk298/vitepress-.git`
- 推送分支：`main`
- Git 代理（已全局配置）：`http.proxy=http://127.0.0.1:7890`、`https.proxy=http://127.0.0.1:7890`

## 执行步骤

严格按顺序执行，每一步完成再进入下一步：

### 1. 检查状态

```powershell
cd d:\Repositories\vitepress-; git status
cd d:\Repositories\vitepress-; git diff
```

同时看暂存区和未暂存区的改动，确认变更范围。

### 2. 处理嵌套仓库

如果有未跟踪目录里含有 `.git` 子目录（嵌套仓库），必须先删除内层 `.git` 再添加：

```powershell
Remove-Item -Recurse -Force "<嵌套目录路径>\.git"
git add "<嵌套目录路径>/"
```

### 3. 暂存改动

- **全部提交**：`git add .`
- **部分提交**：按文件名或目录 `git add <path>`
- **已暂存 → 换暂存范围**：先 `git restore --staged .` 再重新 add

### 4. 生成 commit message 并提交

根据改动内容选择合适前缀：

| 前缀        | 适用场景                      |
| ----------- | ----------------------------- |
| `feat:`     | 新增功能、新页面、新组件      |
| `fix:`      | 修复 bug                      |
| `docs:`     | 文档更新、内容整理            |
| `style:`    | 纯样式/格式调整（不影响功能） |
| `refactor:` | 重构（不改外部行为）          |
| `chore:`    | 构建、配置、依赖、杂项        |

格式：`<prefix>: 中文简要描述`，例如 `feat: 导航栏新增AI赋能分类`。

提交命令：`git commit -m "<prefix>: 描述"`

### 5. 推送到远程

```powershell
git push origin main
```

### 6. 验证

```powershell
git status
```

应显示 `Your branch is up to date with 'origin/main'` 和 `nothing to commit, working tree clean`。

## 注意事项（PowerShell 5）

- 命令串联用 `;` 分隔，**不要用 `&&`**（PowerShell 5 不支持）
- 含中文或空格的路径用引号包裹
- `git push` 超时设为 120 秒以上，避免代理慢导致中断
- 如果 push 返回 403，说明凭据不对，提示用户清除凭据管理器中旧条目后重试

## 不要做的事

- 不要在用户没要求时创建新分支或切换分支
- 不要强制覆盖远程历史（`push --force`）
- 不要擅自修改 `.gitignore` 或 remote 配置
- 不要回滚/丢弃未提交的改动（除非用户明确要求）
