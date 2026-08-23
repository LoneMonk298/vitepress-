English | [中文](./README.md)

# Lonemonk Knowledge Base

This is a personal technical knowledge base built with VitePress. Articles are Markdown files stored under `docs`, so the primary workflow is writing in an IDE, tracking changes with Git, and deploying the generated static site.

The repository also includes an independent local admin panel. It indexes articles, checks Frontmatter, copies project paths, manages pinned articles and categories, and uploads images. Article bodies are still edited in an IDE; the admin panel is not a browser Markdown editor.

## Features

- VitePress documentation site with an independent admin panel
- Article browsing by category, tag, and archive
- Generated navigation and sidebars
- Pinned articles through `isTop: true`
- Frontmatter diagnostics, search, sorting, and filtering
- One-click copying of the article path for IDE editing
- Creating article categories and writing them to Frontmatter
- Date-based image uploads with copyable Markdown paths
- Separate course content under `docs/courses`
- Mermaid diagrams, Markdown footnotes, and math formulas
- Waline comments

## Requirements

- Node.js 18 or newer
- pnpm 8 or newer

Install dependencies:

```bash
pnpm install
```

## Local development

Start both the VitePress site and the admin panel:

```bash
pnpm local:dev
```

Default URLs:

- Site: <http://localhost:5173>
- Admin panel: <http://localhost:4174>

If a port is already in use, use the URL printed by the terminal. Press `Ctrl+C` to stop both services.

Start only the site:

```bash
pnpm dev
```

Start only the admin panel:

```bash
pnpm admin:dev
```

## Article structure

Article categories live under `docs/categories/<category>`. A date-based directory layout is recommended:

```text
docs/categories/network/2026/8/23/example.md
```

Course content lives under `docs/courses` and is kept separate from article categories and archives.

Articles normally begin with Frontmatter:

```yaml
---
title: Example article
date: 2026-08-23
category: network
tags:
  - VitePress
isTop: false
---
```

Copy [the article template](./docs/templates/article-template.md) and continue writing in your IDE.

Images can be stored in `docs/public/img/YYYY/M/D` and referenced from Markdown with a site-root path:

```markdown
![Example image](/img/2026/8/23/example.png)
```

## Admin panel

The admin panel provides local file-writing capabilities only during local development. It scans `docs/**/*.md` and shows each article's real path, category, tags, archive date, and issue status.

Available operations include:

- Copy an article path and open it in an IDE
- Detect missing titles, dates, categories, and invalid formats
- Sort by title, path, modification time, archive date, or issue count
- Pin or unpin an article
- Create an article category and update Frontmatter
- Upload an image to a selected date directory and copy its path

A statically deployed admin build is read-only and cannot write files on the server. Use an IDE, Git, or a file-maintenance tool such as Hermes for article content and directory changes.

## Build and preview

Build the site:

```bash
pnpm build
```

Output: `docs/.vitepress/dist`

Build and preview the admin panel:

```bash
pnpm admin:build
pnpm admin:preview
```

The site can be deployed to Vercel, Netlify, GitHub Pages, or a personal server. Deploy Waline separately and set its service URL in `commentConfig.serverURL` in `docs/.vitepress/config/theme.ts`.

## License

- Article content is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Source code is licensed under [MIT](./LICENSE).
