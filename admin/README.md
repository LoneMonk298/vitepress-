# 知识库管理台

这是一个与 VitePress 前台独立的本地内容管理台。它扫描仓库的 `docs/**/*.md`，展示文章项目路径、分类、标签和归档信息；开发模式下保存 Markdown 后会自动刷新索引。管理端只处理路径、目录和少量 Frontmatter，不在浏览器里编辑正文，也不会保存 GitHub Token。

## 运行

首次使用时，在仓库根目录复制 `.env.example` 为 `.env`，配置 `VITEPRESS_SITE_URL` 和 `WALINE_SERVER_URL`。

运行项目环境检查：

```bash
pnpm run doctor
```

推荐在仓库根目录一次启动前台和管理端：

```bash
pnpm local:dev
```

然后打开管理端（默认 <http://localhost:4174>，端口被占用时使用终端输出的地址）和前台（<http://localhost:5173>）。按 `Ctrl+C` 会同时停止两个服务。

启动脚本会检查 5173 和 4174 端口，并使用严格端口模式，不会自动递增到其他端口；同一仓库不能重复启动多个 `local:dev` 实例。修改 `docs` 下的 Markdown 或根目录的 `content.registry.json` 后，前台会在防抖后重启并重新扫描配置与文章索引。

如果端口被占用或启动失败，先执行：

```bash
pnpm run doctor
```

异常中断后，如果根目录残留 `.local-dev.lock`，确认没有其他 `local:dev` 进程后再删除该文件。

也可以只启动管理端：

```bash
pnpm admin:dev
```

浏览器打开 <http://localhost:4174>。

也可以构建静态管理端：

```bash
pnpm admin:build
pnpm admin:preview
```

## 当前能力

- 文章列表、标题/路径/标签搜索
- 文章问题检测：Frontmatter 格式、标题、日期、分类 ID、目录分类和标签格式
- 按最近修改、归档日期、标题、路径或问题数量排序
- 显示本次索引扫描时间，并支持按问题类型筛选
- 一键复制文章项目路径，直接交给 IDE 打开
- 在本地开发服务中切换文章置顶状态
- 使用稳定英文分类 ID，前台显示对应中文名称
- 新增分类时同步创建目录、索引页并写入 `content.registry.json`
- 文章生成器选择分类和日期后自动创建年/月/日目录
- 从 `docs/templates/article-template.md` 生成文章，并写入标题、描述、分类与规范标签
- 自动生成安全文件名，完成后复制 `/docs/...md` 路径供 IDE 打开
- 移动文章前生成源路径、目标路径、分类字段和图片引用变更预览
- 确认移动后自动更新 Frontmatter，并在图片相对路径确有变化时同步改写
- 逐篇修复中文旧分类、多分类、未知分类、课程分类和目录不一致问题
- 逐篇规范标签大小写、空格并移除重复标签
- 按真实 Frontmatter 分类和标签筛选
- 分类管理、标签管理、归档管理
- 课程目录 `docs/courses` 与文章索引、文章分类隔离
- 打开对应的前台文章
- 响应式布局，支持窄屏操作

## 本地写入范围

索引生成集中在 `admin/vite.config.js` 的 `articleIndexPlugin`。它和 VitePress 的 `article.data.js` 一样读取 `docs/**/*.md`、Frontmatter 与根目录的 `content.registry.json`，因此分类、标签和日期归档不会出现两套数据。文章需要修改时，点击路径旁的复制按钮，然后在 IDE 中打开对应的 `docs/...md` 文件即可。

置顶、新增分类、分类/标签规范化、文章生成和文章移动属于本地文件写入操作，仅在 `pnpm local:dev` 或 `pnpm admin:dev` 启动的本地管理服务中可用；静态构建部署不会暴露文件写入 API。文章正文仍建议在 IDE 中修改，管理端只负责索引、Frontmatter 和路径管理。

## 分类与标签规范

`content.registry.json` 是文章分类的唯一注册表：

- `categories[].id` 是稳定英文 ID，同时也是 `docs/categories/<id>` 的目录名。
- `categories[].name` 是前台和管理端显示的中文名称。
- 文章 Frontmatter 的 `categories` 只写一个英文 ID，例如 `servers`。
- `courses` 与文章分类独立，课程 ID 或名称不能写入文章分类。
- `tagAliases` 用于统一标签大小写和命名，例如 `linux` 会显示并规范为 `Linux`。

旧文章不会被批量改写。管理端会标记问题文章，并在文章行中提供“同步目录分类”和“规范标签”按钮，由使用者逐篇确认。
## 草稿、图片与删除操作

管理端的“草稿管理”对应 `docs/drafts`。草稿支持 `idea`、`writing`、`paused`、`done` 四种状态，适合在 IDE 或交给 Hermes 读取和维护。草稿不会进入 VitePress 前台、文章索引、RSS 或 Sitemap。

图片管理支持按日期、PNG/JPEG/WebP/SVG 类型和文章引用状态筛选；每张图片可复制 `![图片说明](/img/...)`，查看引用它的文章，并识别未引用图片。上传时可选择浏览器压缩并转换 WebP。被文章或课程引用的图片默认禁止删除，必须先处理引用并明确勾选强制删除。

文章、图片、草稿和分类删除都必须先查看删除预览，再二次确认。服务端只允许操作 `docs/categories`、`docs/public/img` 和 `docs/drafts` 内的目标，不能通过管理端删除任意系统路径。删除分类会递归删除该分类目录中的全部文件。
