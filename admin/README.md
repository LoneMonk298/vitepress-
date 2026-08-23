# 知识库管理台

这是一个与 VitePress 前台独立的文章索引管理台。它扫描仓库的 `docs/**/*.md`，只读展示文章项目路径、分类、标签和归档信息；开发模式下保存 Markdown 后会自动刷新索引，不会在浏览器里编辑文章，也不会保存 GitHub Token。

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

启动脚本会检查 5173 和 4174 端口，并使用严格端口模式，不会自动递增到其他端口；同一仓库不能重复启动多个 `local:dev` 实例。修改 `docs` 下的 Markdown 后，前台会在防抖后重启并重新扫描配置与文章索引。

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
- 文章问题检测：Frontmatter 格式、标题、日期、日期格式和分类
- 按最近修改、归档日期、标题、路径或问题数量排序
- 显示本次索引扫描时间，并支持按问题类型筛选
- 一键复制文章项目路径，直接交给 IDE 打开
- 在本地开发服务中切换文章置顶状态
- 选择文章新增分类，并写回对应 Markdown 的 Frontmatter
- 在分类管理中删除分类，并从所有文章 Frontmatter 中移除该分类
- 按真实 Frontmatter 分类和标签筛选
- 分类管理、标签管理、归档管理
- 课程目录 `docs/courses` 与文章索引、文章分类隔离
- 打开对应的前台文章
- 响应式布局，支持窄屏操作

## 本地写入范围

索引生成集中在 `admin/vite.config.js` 的 `articleIndexPlugin`。它和 VitePress 的 `article.data.js` 一样读取 `docs/**/*.md` 与 Frontmatter，因此分类、标签、日期归档不会出现两套数据。文章需要修改时，点击路径旁的复制按钮，然后在 IDE 中打开对应的 `docs/...md` 文件即可。

置顶、新增分类和删除分类属于本地文件写入操作，仅在 `pnpm local:dev` 或 `pnpm admin:dev` 启动的本地管理服务中可用；静态构建部署不会暴露文件写入 API。删除分类只移除 Frontmatter 字段，不会删除文章或目录。文章正文仍建议在 IDE 中修改，管理端只负责索引、Frontmatter 和路径管理。
