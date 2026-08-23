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
- Shared category registry with stable English IDs and Chinese display names
- Creating categories and fixing category/tag normalization issues per article
- Date-based image uploads with copyable Markdown paths
- Separate course content under `docs/courses`
- Mermaid diagrams, Markdown footnotes, and math formulas
- Waline comments

## Requirements

- Node.js `22.14.0`
- pnpm `11.22.0`

The project is verified with Node.js `22.14.0` and pnpm `11.22.0`. Other versions may work, but the doctor check will report a warning.

Install dependencies (recommended):

```bash
nvm use
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install
```

On Windows without nvm, install Node.js `22.14.0`, then run:

```powershell
corepack enable
corepack prepare pnpm@11.22.0 --activate
pnpm install
```

Copy the environment template and adjust it for the deployment environment:

```bash
copy .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Keep `.env` local and do not commit it. The `.env.example` template is safe to commit.

Important variables:

- `VITEPRESS_SITE_URL`: public site URL
- `WALINE_SERVER_URL`: Waline server root URL, without `feedback.html`

GitHub Actions does not read the local `.env`; the deployment workflow injects these public URLs during the build. The blog and GitHub Pages use `blog.lonemonk.xyz`, while `www.lonemonk.xyz` remains the personal profile site.

The expected Node.js and pnpm versions are recorded in `.nvmrc` and `package.json`. Run the project environment check with:

```bash
pnpm run doctor
```

The doctor checks the runtime versions, project directories, Markdown/image counts, and ports 5173 and 4174. A Node version mismatch is a warning; missing directories or port errors should be fixed.

## Local development

Start both the VitePress site and the admin panel:

```bash
pnpm local:dev
```

Default URLs:

- Site: <http://localhost:5173>
- Admin panel: <http://localhost:4174>

If a port is already in use, use the URL printed by the terminal. Press `Ctrl+C` to stop both services.

The launcher creates a temporary lock file to prevent duplicate instances. Both services use fixed ports with strict port mode, so they will not silently move to 5174 or 5175. After a Markdown file under `docs` or the root `content.registry.json` changes, the launcher debounces the event and restarts the frontend so navigation and article indexes are rescanned.

If a port is occupied, run:

```bash
pnpm run doctor
```

Close an older `local:dev` terminal and try again. If `.local-dev.lock` remains after an abnormal stop, delete it only after confirming that no other `local:dev` process is running.

Start only the site:

```bash
pnpm dev
```

Start only the admin panel:

```bash
pnpm admin:dev
```

Category, pinning, article creation/moving, and image-directory writes are available only from the local development server. If an index does not update after editing Markdown, use the admin refresh action or restart with `pnpm local:dev`.

`pnpm doctor` is pnpm's own global environment diagnostic. Use `pnpm run doctor` or `pnpm run project:doctor` for this repository's checks.

## Article structure

Article categories live under `docs/categories/<category-id>`. A date-based directory layout is recommended:

```text
docs/categories/network/2026/8/23/example.md
```

Course content lives under `docs/courses` and is kept separate from article categories and archives.

Articles normally begin with Frontmatter:

```yaml
---
title: Example article
date: '2026/8/23 12:00'
categories:
  - network
tags:
  - VitePress
isTop: false
---
```

The repository-root `content.registry.json` is the single source of truth for category and tag conventions. A category `id` is a stable English identifier and directory name, while `name` is the Chinese label shown by the site. Courses are registered separately and cannot be used as article categories. `tagAliases` normalizes tag capitalization and naming.

Copy [the article template](./docs/templates/article-template.md) and continue writing in your IDE.

Images can be stored in `docs/public/img/YYYY/M/D` and referenced from Markdown with a site-root path:

```markdown
![Example image](/img/2026/8/23/example.png)
```

## Admin panel

The admin panel provides local file-writing capabilities only during local development. It scans `docs/**/*.md` and shows each article's real path, category, tags, archive date, and issue status.

Available operations include:

- Copy an article path and open it in an IDE
- Detect missing titles/dates, multiple or unknown categories, directory mismatches, and invalid tag formats
- Sort by title, path, modification time, archive date, or issue count
- Pin or unpin an article
- Create an article category and update `content.registry.json`
- Normalize an old article category to its directory ID and normalize/deduplicate tags after confirmation
- Generate an article from the shared template, create its year/month/day directory, and copy the `/docs/...md` path
- Preview article moves, category changes, and image-reference updates before applying the file move
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
### Drafts, image references, and safe deletion

- `docs/drafts` is a private draft workspace for the IDE, admin panel, and Hermes. It is excluded from the site, RSS, and Sitemap.
- Image management can filter by date, type, and reference state, and shows which articles or courses reference an image.
- Optional browser-side optimization converts uploaded raster images to WebP without an extra image service.
- Article, draft, image, and category deletion always requires an impact preview and a second confirmation. Referenced images are blocked by default.
- Deleting a category recursively removes `docs/categories/<category ID>`. The admin panel never exposes arbitrary PowerShell command execution.
