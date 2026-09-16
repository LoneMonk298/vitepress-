[English](./README.en.md) | 中文

# Lonemonk 知识库

个人技术知识库 + 408 考研备考系统。文章以 Markdown 保存在 `docs` 目录，适合在 IDE 中编写、Git 管理并部署到静态托管平台。

项目由三部分组成：

- **内容站点**（VitePress）：文章、课程、复习资料与工具页
- **本地管理端**（独立 Vite App）：文章索引、Frontmatter 检查、置顶管理、分类创建、图片上传
- **408 备考板块**：复盘式讲义笔记、真题解析、思维导图、考点学习管理表、每日规划

文章正文仍在 IDE 中编辑，管理端不替代 Markdown 编辑器。

## 特性

### 站点与工程

- VitePress 文档站点与独立管理端
- 按分类、标签和归档浏览文章
- 自动生成文章导航和侧边栏
- 支持 `isTop: true` 管理置顶文章
- 文章 Frontmatter 问题检测、搜索、排序和筛选
- 一键复制文章项目路径，方便在 IDE 中打开
- 共享分类注册表：Frontmatter 使用稳定英文 ID，前台显示中文名称
- 管理端创建文章分类，并逐篇修复分类与标签规范问题
- 图片按日期目录上传，并复制 Markdown 可用路径
- 独立的课程内容目录：`docs/courses`
- Mermaid 流程图、Markdown 脚注和数学公式（MathJax）
- Waline 文章评论
- RSS 与 Sitemap 自动生成

### 408 备考

- **复盘式讲义笔记**：按考点驱动的改写版，含符号约定表、boxed 公式、易错清单与速记
- **历年真题解析**：从暴力解到最优解的完整推导路径
- **可编辑思维导图**：四科 26 章、4247 个节点，支持展开/折叠/拖拽编辑与多端同步
- **考点学习管理表**：考频热度、掌握程度、回归次数、艾宾浩斯复习提醒、云同步
- **每日规划**：日程看板、翻盘队列、卡壳记录
- **复习资料库**：试卷、答案、专题讲义等 PDF/XLSX 在线索引

## 目录结构

```text
.
├── docs/                       站点内容
│   ├── categories/             文章分类（awesome / data-structures / servers）
│   │   └── <分类 ID>/YYYY/M/D/ 按年月日归档的文章
│   ├── courses/                课程内容（course1：408 讲义 + 真题）
│   ├── drafts/                 草稿工作区（不参与前台/RSS/Sitemap 构建）
│   ├── public/                 静态资源与工具页（原样复制到站点根）
│   │   ├── mindmaps/           408 思维导图（可编辑，含 vendor 库与 data 数据）
│   │   ├── review/             复习资料库（PDF / XLSX）
│   │   ├── visualizers/        知识点可视化产物
│   │   ├── img/YYYY/M/D/       文章图片
│   │   ├── 考研408考点学习管理表.html
│   │   └── 每日规划.html
│   ├── review/                 复习资料索引页
│   ├── templates/              文章与课程模板
│   └── .vitepress/             站点配置与主题
├── admin/                      独立管理端（Vite 应用）
├── scripts/                    工程脚本
│   ├── doctor.mjs              环境与项目结构诊断
│   ├── generate-rss.mjs        RSS / Sitemap 生成
│   └── local-dev.mjs           前台 + 管理端一键启动
├── article.data.js             VitePress data loader：文章索引
├── review-files.data.js        VitePress data loader：复习资料索引
├── content.registry.json       分类与标签注册表（唯一来源）
└── content-registry.mjs        注册表加载与规范化工具
```

> 根目录的 `*.data.js` 是 VitePress 的 [data loader](https://vitepress.dev/guide/data-loading) 约定文件，构建期运行、供页面 `import { data }` 消费，**不是构建产物**。

## 环境要求

- Node.js `22.14.0`
- pnpm `11.22.0`

项目已验证 Node.js `22.14.0` 和 pnpm `11.22.0`。建议使用对应版本，其他版本可能仍可运行，但诊断会给出警告。

安装依赖（推荐流程）：

```bash
nvm use
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install
```

Windows 没有使用 nvm 时，可以直接安装 Node.js `22.14.0`，然后执行：

```powershell
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install
```

复制环境变量模板并按部署环境修改：

```bash
copy .env.example .env
```

PowerShell 也可以使用：

```powershell
Copy-Item .env.example .env
```

`.env` 只保存在本地，不要提交到 Git；`.env.example` 是可以提交的配置模板。

关键变量：

- `VITEPRESS_SITE_URL`：前台站点地址
- `WALINE_SERVER_URL`：Waline 服务端根地址，不要填写 `feedback.html`

GitHub Actions 不会读取本地 `.env`，部署工作流会在构建阶段注入上述公开地址。博客和 GitHub Pages 使用 `blog.lonemonk.xyz`，`www.lonemonk.xyz` 保留为个人简介网站。

Node.js 和 pnpm 版本可通过 `.nvmrc` 与 `package.json` 查看。环境检查使用：

```bash
pnpm run doctor
```

`doctor` 会检查版本、项目目录、Markdown/图片数量以及 5173、4174 端口。Node 版本不一致属于警告；目录缺失或端口异常需要先处理。

## 本地开发

一次启动 VitePress 前台和管理端：

```bash
pnpm local:dev
```

默认地址：

- 前台：<http://localhost:5173>
- 管理端：<http://localhost:4174>

端口被占用时，终端会显示实际地址。按 `Ctrl+C` 会同时停止两个服务。

启动脚本会创建临时锁文件，阻止同一个仓库重复启动；前台和管理端均使用固定端口并启用严格端口模式，不会自动跳到 5174、5175 等端口。修改 `docs` 下的 Markdown 或根目录的 `content.registry.json` 后，脚本会防抖重启前台，使导航和文章索引重新扫描。

如果提示端口已占用，先运行：

```bash
pnpm run doctor
```

关闭旧的 `local:dev` 终端后再重试。异常中断后若仓库根目录残留 `.local-dev.lock`，确认没有其他 `local:dev` 进程后可以删除它。

只启动前台：

```bash
pnpm dev
```

只启动管理端：

```bash
pnpm admin:dev
```

管理端的分类、置顶、文章生成、文章移动和图片目录写入功能只在本地开发服务中可用。修改 Markdown 后若页面没有立即更新，可点击管理端的刷新索引，或重新执行 `pnpm local:dev`。

`pnpm doctor` 是 pnpm 自带的全局环境诊断命令；本项目诊断请使用 `pnpm run doctor` 或 `pnpm run project:doctor`。

## 文章结构

文章分类位于 `docs/categories/<category-id>`，建议按年月日继续分目录，例如：

```text
docs/categories/network/2026/8/23/example.md
```

课程内容位于 `docs/courses`，与文章分类和文章归档分开管理。

文章通常以 Frontmatter 开头：

```yaml
---
title: 示例文章
date: '2026/8/23 12:00'
categories:
  - network
tags:
  - VitePress
isTop: false
---
```

根目录的 `content.registry.json` 是分类与标签规范的唯一来源。分类的 `id` 使用稳定英文标识并对应目录名，`name` 只用于前台中文显示；课程注册表与文章分类彼此独立。`tagAliases` 用来统一标签大小写和命名格式。

具体文章建议复制 [文章模板](./docs/templates/article-template.md) 后，在 IDE 中继续编写。

图片可放在 `docs/public/img/YYYY/M/D`，在 Markdown 中使用站点根路径：

```markdown
![示例图片](/img/2026/8/23/example.png)
```

## 408 备考内容

### 讲义笔记（`docs/courses/course1/03-408讲义/`）

按**考点驱动 + 问题驱动**的复盘式写法：每个概念先问「为什么需要它 / 不用会怎样 / 容易误解成什么」，再给结论，最后收敛成「易错清单 + 速记」。使用符号约定表、boxed 公式与 tip/warning/details 容器。

### 真题解析（`docs/courses/course1/02-408真题/`）

从暴力解 → 复杂度浪费分析 → 最优解的完整推导路径，附评分维度与易错点。

### 思维导图（`docs/public/mindmaps/`）

四科 26 章、4247 个节点的可编辑思维导图：

- 左侧按科目/章节切换，点击加载对应章节
- 支持展开、折叠、拖拽与直接编辑
- 编辑结果自动保存到浏览器，可通过 jsonbin 多端同步
- 支持 URL 定位：`/mindmaps/#0-1|线性表的应用`

### 学习管理表（`docs/public/考研408考点学习管理表.html`）

考点级备考追踪，与思维导图联动：考点行的 🧠 按钮可直接打开对应导图并**定位到该考点节点**。

### 复习资料库（`docs/public/review/`）

试卷、答案、专题讲义等 PDF/XLSX 的在线索引页（`docs/review/index.md`），索引由 `review-files.data.js` 在构建期扫描生成。

## 管理端说明

管理端只在本地开发服务中提供文件写入能力。它扫描 `docs/**/*.md`，显示文章的真实路径、分类、标签、归档日期和问题状态。

支持的操作包括：

- 复制文章路径并交给 IDE 打开
- 检查缺少标题、日期、多个分类、未注册分类、目录不一致或标签格式异常的文章
- 按标题、路径、修改时间、归档日期和问题数量排序
- 设置或取消文章置顶
- 新增文章分类并同步写入 `content.registry.json`
- 逐篇将旧分类同步为所在目录的英文 ID，并规范、去重标签
- 从统一模板生成文章，自动创建年/月/日目录并复制 `/docs/...md` 路径
- 移动文章前预览路径、分类和图片引用变化，确认后再执行文件移动
- 将图片上传到指定日期目录并复制路径

静态部署的管理端只用于展示，不能直接写入服务器文件。文章正文和目录调整仍建议通过 IDE、Git 或 Hermes 等文件维护工具完成。

## 构建与预览

构建前台：

```bash
pnpm build
```

输出目录：`docs/.vitepress/dist`

构建并预览管理端：

```bash
pnpm admin:build
pnpm admin:preview
```

前台可以部署到 Vercel、Netlify、GitHub Pages、个人服务器等静态托管环境。本项目当前使用 GitHub Actions 构建并发布到 GitHub Pages，再由 Cloudflare 提供域名与缓存。Waline 服务端需要单独部署，并在 `docs/.vitepress/config/theme.ts` 的 `commentConfig.serverURL` 中填写 Waline 服务地址。

## 许可证

- 文章内容遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议。
- 项目源码遵循 [MIT](./LICENSE) 协议。
### 草稿、图片引用与安全删除

- `docs/drafts` 是独立草稿工作区，供 IDE、管理端和 Hermes 读取，不参与前台、RSS 或 Sitemap 构建。
- 图片管理支持日期、文件类型、已引用/未引用筛选，并可查看引用图片的文章或课程。
- 上传图片可在浏览器内压缩并转换 WebP，不需要额外图片处理服务。
- 文章、草稿、图片和分类删除均需先查看影响预览并二次确认；被引用图片默认禁止删除。
- 分类删除会递归删除 `docs/categories/<分类 ID>`，管理端不会执行或开放任意 PowerShell 命令。
