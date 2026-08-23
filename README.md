[English](./README.en.md) | 中文

# Lonemonk 知识库

这是一个基于 VitePress 的个人技术知识库。文章以 Markdown 文件保存在 `docs` 目录中，适合在 IDE 中编写、Git 管理并部署到静态托管平台。

项目同时提供一个独立的本地管理端，用于查看文章索引、检查 Frontmatter、复制文章路径、管理置顶状态、创建分类以及上传图片。文章正文仍然在 IDE 中编辑，管理端不会替代 Markdown 编辑器。

## 特性

- VitePress 文档站点与独立管理端
- 按分类、标签和归档浏览文章
- 自动生成文章导航和侧边栏
- 支持 `isTop: true` 管理置顶文章
- 文章 Frontmatter 问题检测、搜索、排序和筛选
- 一键复制文章项目路径，方便在 IDE 中打开
- 管理端创建文章分类并写入 Frontmatter
- 图片按日期目录上传，并复制 Markdown 可用路径
- 独立的课程内容目录：`docs/courses`
- Mermaid 流程图、Markdown 脚注和数学公式
- Waline 文章评论

## 环境要求

- Node.js 18 或更高版本
- pnpm 8 或更高版本

安装依赖：

```bash
pnpm install
```

## 本地开发

一次启动 VitePress 前台和管理端：

```bash
pnpm local:dev
```

默认地址：

- 前台：<http://localhost:5173>
- 管理端：<http://localhost:4174>

端口被占用时，终端会显示实际地址。按 `Ctrl+C` 会同时停止两个服务。

只启动前台：

```bash
pnpm dev
```

只启动管理端：

```bash
pnpm admin:dev
```

## 文章结构

文章分类位于 `docs/categories/<category>`，建议按年月日继续分目录，例如：

```text
docs/categories/network/2026/8/23/example.md
```

课程内容位于 `docs/courses`，与文章分类和文章归档分开管理。

文章通常以 Frontmatter 开头：

```yaml
---
title: 示例文章
date: 2026-08-23
category: network
tags:
  - VitePress
isTop: false
---
```

具体文章建议复制 [文章模板](./docs/templates/article-template.md) 后，在 IDE 中继续编写。

图片可放在 `docs/public/img/YYYY/M/D`，在 Markdown 中使用站点根路径：

```markdown
![示例图片](/img/2026/8/23/example.png)
```

## 管理端说明

管理端只在本地开发服务中提供文件写入能力。它扫描 `docs/**/*.md`，显示文章的真实路径、分类、标签、归档日期和问题状态。

支持的操作包括：

- 复制文章路径并交给 IDE 打开
- 检查缺少标题、日期、分类或格式异常的文章
- 按标题、路径、修改时间、归档日期和问题数量排序
- 设置或取消文章置顶
- 新增文章分类并写入 Frontmatter
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

前台可以部署到 Vercel、Netlify、GitHub Pages、个人服务器等静态托管环境。Waline 服务端需要单独部署，并在 `docs/.vitepress/config/theme.ts` 的 `commentConfig.serverURL` 中填写 Waline 服务地址。

## 许可证

- 文章内容遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议。
- 项目源码遵循 [MIT](./LICENSE) 协议。
