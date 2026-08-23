import './styles.css';
import articles, { categoryDirectories, contentRegistry, courses, drafts, images, indexMeta } from 'virtual:admin-articles';

const state = { view: 'articles', query: '', category: 'all', tag: 'all', issue: 'all', top: 'all', sort: 'modified-desc', imageDate: 'all', imageType: 'all', imageReference: 'all', notice: '', sidebarCollapsed: false, dialog: null };
const app = document.querySelector('#app');
const frontendUrl = import.meta.env.VITEPRESS_SITE_URL || import.meta.env.VITEPRESS_URL || 'http://localhost:5173';
let noticeTimer;

render();

function render() {
  const categories = collectCategories();
  const tags = collectTags();
  const filtered = sortArticles(filterArticles());
  app.innerHTML = `<div class="admin-shell ${state.sidebarCollapsed ? 'is-collapsed' : ''}">${sidebar(categories, tags)}<main class="main-panel">${topbar()}${content(filtered, categories, tags)}</main>${state.dialog ? (state.dialog.type === 'upload' ? uploadDialog() : dialogView(state.dialog)) : ''}${state.notice ? `<div class="toast">${icon('check')}${escapeHtml(state.notice)}</div>` : ''}</div>`;
  bindEvents();
}

function sidebar(categories, tags) {
  return `<aside class="sidebar"><div class="brand"><div class="brand-mark">L</div><div><strong>知识库管理台</strong><span>CONTENT INDEX</span></div></div><div class="workspace-label">内容管理</div><nav class="nav-list">${navItem('articles', '文章索引', icon('file'), articles.length)}${navItem('categories', '分类规范', icon('folder'), categories.length)}${navItem('images', '图片管理', icon('image'), imageCount())}${navItem('drafts', '草稿管理', icon('edit'), drafts.length)}${navItem('courses', '课程尝试', icon('book'), courses.length)}${navItem('tags', '标签管理', icon('tag'), tags.length)}${navItem('archives', '归档管理', icon('archive'), archiveYears().length)}</nav><div class="sidebar-foot"><span class="status-dot"></span><span>已连接当前仓库</span><small>本地可写</small></div></aside>`;
}

function navItem(view, label, itemIcon, count) {
  return `<button class="nav-item ${state.view === view ? 'active' : ''}" data-nav="${view}">${itemIcon}<span>${label}</span><em>${count}</em></button>`;
}

function topbar() {
  const titles = { articles: ['文章管理', '从 docs Markdown 自动生成的项目索引'], categories: ['分类规范', '英文 ID 与中文名称的统一注册表'], images: ['图片管理', '按日期、类型和引用状态管理图片'], drafts: ['草稿管理', '独立工作区中的临时笔记与写作进度'], courses: ['课程尝试', '按课程章节管理 docs/courses 内容'], tags: ['标签管理', '与前台文章标签保持一致'], archives: ['归档管理', '按文章 Frontmatter 日期聚合'] };
  const [title, subtitle] = titles[state.view];
  return `<header class="topbar"><div class="topbar-left"><button class="icon-button menu-toggle" data-toggle-sidebar title="${state.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}" aria-label="${state.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}">${icon('menu')}</button><div><p class="eyebrow">LONEMONK / ADMIN</p><h1>${title} <span>${subtitle}</span></h1></div></div><div class="topbar-actions"><span class="scan-meta">最后扫描 ${formatDateTime(indexMeta.indexedAt)}</span><span class="readonly-pill">${icon('file')} 本地文件管理</span><a class="front-link" href="${escapeAttr(frontendUrl)}" target="_blank" rel="noreferrer">${icon('home')}前台首页</a></div></header>`;
}

function content(filtered, categories, tags) {
  if (state.view === 'images') return imageView();
  if (state.view === 'drafts') return draftView();
  if (state.view === 'categories') return categoryView(categories);
  if (state.view === 'courses') return courseView();
  if (state.view === 'tags') return tagView(tags);
  if (state.view === 'archives') return archiveView();
  return articleView(filtered, categories, tags);
}

function articleView(filtered, categories, tags) {
  const issueCount = articles.filter((article) => article.issues.length).length;
  return `<section class="content-area"><div class="stats-row">${stat('全部文章', articles.length)}${stat('分类', categories.length)}${stat('标签', tags.length)}${stat('问题文章', issueCount)}</div><div class="toolbar"><div class="search-box">${icon('search')}<input data-search placeholder="搜索标题、路径或标签" value="${escapeAttr(state.query)}" /></div><select data-category aria-label="筛选分类"><option value="all">全部分类</option>${categories.map((item) => `<option value="${escapeAttr(item.name)}" ${state.category === item.name ? 'selected' : ''}>${escapeHtml(item.name)}（${item.count}）</option>`).join('')}</select><select data-tag aria-label="筛选标签"><option value="all">全部标签</option>${tags.map((item) => `<option value="${escapeAttr(item.name)}" ${state.tag === item.name ? 'selected' : ''}>${escapeHtml(item.name)}（${item.count}）</option>`).join('')}</select><select data-top aria-label="筛选置顶状态"><option value="all">全部置顶状态</option><option value="top" ${state.top === 'top' ? 'selected' : ''}>仅置顶（${articles.filter((article) => article.isTop).length}）</option><option value="not-top" ${state.top === 'not-top' ? 'selected' : ''}>未置顶</option></select><select data-issue aria-label="筛选文章问题"><option value="all">全部检查状态</option><option value="has" ${state.issue === 'has' ? 'selected' : ''}>有问题（${issueCount}）</option>${issueOptions().map((item) => `<option value="${escapeAttr(item.code)}" ${state.issue === item.code ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select><select data-sort aria-label="文章排序"><option value="modified-desc" ${state.sort === 'modified-desc' ? 'selected' : ''}>最近修改</option><option value="date-desc" ${state.sort === 'date-desc' ? 'selected' : ''}>归档日期最新</option><option value="title-asc" ${state.sort === 'title-asc' ? 'selected' : ''}>标题 A-Z</option><option value="path-asc" ${state.sort === 'path-asc' ? 'selected' : ''}>路径 A-Z</option><option value="issues-desc" ${state.sort === 'issues-desc' ? 'selected' : ''}>问题优先</option></select>${hasActiveFilters() ? `<button class="button button-ghost" data-clear-filters>清除筛选</button>` : ''}<button class="button button-ghost" data-open-article-dialog>${icon('file')}新建文章</button><button class="button button-ghost" data-open-image-dialog>${icon('folder')}新建图片目录</button><button class="button button-ghost" data-open-category-dialog>${icon('folder')}新增分类</button><button class="button button-primary" data-refresh>${icon('refresh')}刷新索引</button></div><section class="table-card"><div class="table-heading"><div><h2>文章列表</h2><p>显示 ${filtered.length} / ${articles.length} 篇，最后扫描于 ${formatDateTime(indexMeta.indexedAt)}</p></div><span class="source-badge">${icon('database')} docs/categories/**/*.md</span></div>${filtered.length ? articleTable(filtered) : emptyState()}</section></section>`;
}

function stat(label, count) {
  return `<div class="stat-card"><span>${label}</span><strong>${count}</strong><i></i></div>`;
}

function articleTable(items) {
  return `<div class="table-scroll"><table><thead><tr><th>标题</th><th>项目路径</th><th>分类</th><th>标签</th><th>归档日期</th><th>状态</th><th>检查</th><th>操作</th></tr></thead><tbody>${items.map(articleRow).join('')}</tbody></table></div>`;
}

function articleRow(article) {
  const category = article.directoryCategoryName || '未分类';
  const path = article.sourcePath;
  const categoryNeedsNormalization = article.issues.some((issue) => ['category', 'category-multiple', 'category-course', 'category-unknown', 'category-id', 'category-mismatch'].includes(issue.code));
  const tagsNeedNormalization = article.issues.some((issue) => ['tag-duplicate', 'tag-format'].includes(issue.code));
  return `<tr><td><div class="title-cell"><span class="article-icon">${icon(article.isTop ? 'pin' : 'file')}</span><div><strong>${escapeHtml(article.title)}</strong>${article.isTop ? '<small>置顶文章</small>' : ''}</div></div></td><td><button class="path-copy" data-copy-path="${escapeAttr(path)}" title="复制项目路径"><code>${escapeHtml(path)}</code>${icon('copy')}</button></td><td>${categoryLink(category)}</td><td><div class="tag-list">${article.tags.length ? article.tags.map(tagLink).join('') : '<span class="muted">-</span>'}</div></td><td><span class="date-cell">${formatDate(article.date)}</span></td><td><span class="badge ${article.status}">${article.status === 'draft' ? '草稿' : '已发布'}</span></td><td>${issueCell(article)}</td><td><div class="row-actions"><a class="icon-button" href="${escapeAttr(`${frontendUrl}/${encodeURI(article.sitePath)}`)}" target="_blank" rel="noreferrer" title="打开前台文章">${icon('external')}</a><button class="icon-button" data-copy-path="${escapeAttr(path)}" title="复制路径">${icon('copy')}</button>${categoryNeedsNormalization ? `<button class="icon-button" data-normalize-category data-source-path="${escapeAttr(path)}" title="将分类同步为目录英文 ID">${icon('check')}</button>` : ''}${tagsNeedNormalization ? `<button class="icon-button" data-normalize-tags data-source-path="${escapeAttr(path)}" title="规范并去重标签">${icon('tag')}</button>` : ''}<button class="icon-button ${article.isTop ? 'is-active' : ''}" data-toggle-top data-source-path="${escapeAttr(path)}" data-is-top="${article.isTop}" title="${article.isTop ? '取消置顶' : '设为置顶'}">${icon('pin')}</button><button class="icon-button" data-open-move-dialog data-source-path="${escapeAttr(path)}" title="更换分类">${icon('folder')}</button><button class="icon-button danger" data-delete-article data-source-path="${escapeAttr(path)}" title="删除文章">${trashIcon()}</button></div></td></tr>`;
}

function issueCell(article) { return article.issues.length ? `<div class="issue-list">${article.issues.map((issue) => `<span class="issue-badge" title="${escapeAttr(issue.label)}">${escapeHtml(issue.label)}</span>`).join('')}</div>` : '<span class="check-ok">检查通过</span>'; }

function categoryView(categories) {
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">CONTENT REGISTRY</p><div class="view-heading"><div><h2>文章分类注册表</h2><p><code>content.registry.json</code> 是唯一分类来源。删除分类会递归删除该分类目录中的全部文章，必须先查看文件清单并二次确认。</p></div><button class="button button-primary" data-open-category-dialog>${icon('folder')}新增分类</button></div></div><div class="category-grid">${categories.map((category) => `<div class="category-card"><button class="category-card-main" data-filter-category="${escapeAttr(category.name)}"><div class="category-mark">${icon('folder')}</div><div><strong>${escapeHtml(category.name)}</strong><span>ID: <code>${escapeHtml(category.slug)}</code> · ${category.count} 篇文章</span></div>${icon('chevron')}</button><button class="icon-button" data-copy-path="${escapeAttr(`/docs/categories/${category.slug}`)}" title="复制分类路径">${icon('copy')}</button><button class="icon-button danger" data-delete-category data-category-slug="${escapeAttr(category.slug)}" title="删除分类及目录">${trashIcon()}</button></div>`).join('')}</div></section>`;
}

function imageView() {
  const filteredImages = images.filter((image) => (state.imageDate === 'all' || imageDate(image) === state.imageDate) && (state.imageType === 'all' || image.type === state.imageType) && (state.imageReference === 'all' || (state.imageReference === 'used' ? image.referenced : !image.referenced)));
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">IMAGE ASSETS</p><div class="view-heading"><div><h2>图片管理</h2><p>按日期、文件类型和文章引用状态筛选。删除前会显示引用文章，已引用图片默认禁止删除。</p></div><button class="button button-primary" data-open-upload-dialog>${icon('upload')}上传图片</button></div></div><div class="toolbar"><select data-image-date aria-label="按图片日期筛选"><option value="all">全部日期（${images.length}）</option>${imageDateOptions().map((item) => `<option value="${escapeAttr(item.value)}" ${state.imageDate === item.value ? 'selected' : ''}>${escapeHtml(item.label)}（${item.count}）</option>`).join('')}</select><select data-image-type aria-label="按图片类型筛选"><option value="all">全部类型</option>${[...new Set(images.map((image) => image.type))].sort().map((type) => `<option value="${escapeAttr(type)}" ${state.imageType === type ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('')}</select><select data-image-reference aria-label="按图片引用状态筛选"><option value="all">全部引用状态</option><option value="used" ${state.imageReference === 'used' ? 'selected' : ''}>已被引用</option><option value="unused" ${state.imageReference === 'unused' ? 'selected' : ''}>未被引用</option></select><button class="button button-ghost" data-open-image-dialog>${icon('folder')}新建图片目录</button><button class="button button-primary" data-refresh>${icon('refresh')}刷新图片索引</button></div><section class="table-card"><div class="table-heading"><div><h2>图片目录</h2><p><code>docs/public/img/年/月/日</code> 下的图片由前台以 <code>/img/...</code> 访问。</p></div><span class="source-badge">${icon('database')} ${filteredImages.length} / ${images.length} 个文件</span></div>${filteredImages.length ? `<div class="table-scroll"><table><thead><tr><th>文件名</th><th>类型</th><th>项目路径</th><th>Markdown</th><th>引用</th><th>操作</th></tr></thead><tbody>${filteredImages.map((image) => `<tr><td><strong>${escapeHtml(image.name)}</strong></td><td><span class="badge">${escapeHtml(image.type)}</span></td><td><code>${escapeHtml(image.sourcePath)}</code></td><td><button class="path-copy" data-copy-path="${escapeAttr(image.markdownPath)}" title="复制 Markdown 图片语法"><code>${escapeHtml(image.markdownPath)}</code>${icon('copy')}</button></td><td>${image.referenced ? `<button class="text-link" data-show-image-refs="${escapeAttr(image.sourcePath)}">${image.references.length} 篇文档</button>` : '<span class="muted">未引用</span>'}</td><td><button class="icon-button" data-copy-path="${escapeAttr(image.markdownPath)}" title="复制 Markdown 路径">${icon('copy')}</button><button class="icon-button danger" data-delete-image data-source-path="${escapeAttr(image.sourcePath)}" title="删除图片">${trashIcon()}</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="image-help"><div class="category-mark">${icon('image')}</div><div><strong>没有匹配的图片</strong><p>选择其他筛选条件或上传一张新图片。</p></div></div>`}</section></section>`;
}

function courseView() {
  const query = state.query.trim().toLowerCase();
  const items = courses.filter((course) => !query || `${course.title} ${course.sourcePath} ${course.chapter}`.toLowerCase().includes(query));
  return `<section class="content-area"><div class="stats-row">${stat('课程内容', courses.length)}${stat('章节目录', new Set(courses.map((course) => course.chapter)).size)}${stat('当前显示', items.length)}${stat('管理方式', 'IDE')}</div><div class="toolbar"><div class="search-box">${icon('search')}<input data-search placeholder="搜索课程标题或路径" value="${escapeAttr(state.query)}" /></div><button class="button button-primary" data-refresh>${icon('refresh')}刷新课程索引</button></div><section class="table-card"><div class="table-heading"><div><h2>课程章节</h2><p>课程内容与文章分类完全分开，点击路径复制后在 IDE 中编辑。</p></div><span class="source-badge">${icon('book')} docs/courses/**/*.md</span></div>${items.length ? `<div class="table-scroll"><table><thead><tr><th>章节</th><th>标题</th><th>项目路径</th><th>修改时间</th><th>操作</th></tr></thead><tbody>${items.map((course) => `<tr><td><span class="text-link">${escapeHtml(course.chapter)}</span></td><td><strong>${escapeHtml(course.title)}</strong></td><td><button class="path-copy" data-copy-path="${escapeAttr(course.sourcePath)}" title="复制项目路径"><code>${escapeHtml(course.sourcePath)}</code>${icon('copy')}</button></td><td class="date-cell">${formatDateTime(course.modifiedAt)}</td><td><div class="row-actions"><a class="icon-button" href="${escapeAttr(`${frontendUrl}/${encodeURI(course.sitePath)}`)}" target="_blank" rel="noreferrer" title="打开前台课程">${icon('external')}</a><button class="icon-button" data-copy-path="${escapeAttr(course.sourcePath)}" title="复制路径">${icon('copy')}</button></div></td></tr>`).join('')}</tbody></table></div>` : emptyState()}</section></section>`;
}

function uploadDialog() {
  return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">UPLOAD IMAGE</p><h2>上传图片</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-upload-form><label class="form-field"><span>图片文件</span><input data-upload-file type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" required /></label><label class="form-field"><span>归档日期</span><input data-upload-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /></label><label class="form-field"><span>文件名（可选）</span><input data-upload-name maxlength="120" placeholder="默认使用原文件名并规范化" /></label><label class="check-field"><input data-upload-optimize type="checkbox" /><span>浏览器压缩并优先转换为 WebP</span></label><small>图片会写入 <code>docs/public/img/年/月/日</code>，上传完成后复制 <code>![图片说明](/img/...)</code> Markdown 语法。</small><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('upload')}上传并复制路径</button></div></form></section></div>`;
}

function draftView() {
  const items = drafts.filter((draft) => !state.query.trim() || `${draft.title} ${draft.sourcePath} ${draft.status}`.toLowerCase().includes(state.query.trim().toLowerCase()));
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">DRAFT WORKSPACE</p><div class="view-heading"><div><h2>草稿管理</h2><p>草稿位于 <code>docs/drafts</code>，不会进入前台、RSS、Sitemap 或正式文章索引，适合 Hermes 读取临时进度。</p></div><button class="button button-primary" data-open-draft-dialog>${icon('edit')}新建草稿</button></div></div><div class="toolbar"><div class="search-box">${icon('search')}<input data-search placeholder="搜索草稿标题、路径或状态" value="${escapeAttr(state.query)}" /></div><button class="button button-primary" data-refresh>${icon('refresh')}刷新草稿</button></div><section class="table-card"><div class="table-heading"><div><h2>草稿列表</h2><p>共 ${drafts.length} 个草稿，IDE 与 Hermes 可以直接读取这些 Markdown 文件。</p></div><span class="source-badge">${icon('edit')} docs/drafts/**/*.md</span></div>${items.length ? `<div class="table-scroll"><table><thead><tr><th>标题</th><th>路径</th><th>状态</th><th>修改时间</th><th>操作</th></tr></thead><tbody>${items.map((draft) => `<tr><td><strong>${escapeHtml(draft.title)}</strong>${draft.description ? `<small class="table-subtext">${escapeHtml(draft.description)}</small>` : ''}</td><td><button class="path-copy" data-copy-path="${escapeAttr(draft.sourcePath)}" title="复制草稿路径"><code>${escapeHtml(draft.sourcePath)}</code>${icon('copy')}</button></td><td><select class="inline-select" data-draft-status data-source-path="${escapeAttr(draft.sourcePath)}"><option value="idea" ${draft.status === 'idea' ? 'selected' : ''}>想法</option><option value="writing" ${draft.status === 'writing' ? 'selected' : ''}>编写中</option><option value="paused" ${draft.status === 'paused' ? 'selected' : ''}>暂停</option><option value="done" ${draft.status === 'done' ? 'selected' : ''}>待转文章</option></select></td><td class="date-cell">${formatDateTime(draft.modifiedAt)}</td><td><button class="icon-button" data-copy-path="${escapeAttr(draft.sourcePath)}" title="复制路径">${icon('copy')}</button><button class="icon-button danger" data-delete-draft data-source-path="${escapeAttr(draft.sourcePath)}" title="删除草稿">${trashIcon()}</button></td></tr>`).join('')}</tbody></table></div>` : emptyState()}</section></section>`;
}

function trashIcon() { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>'; }

function tagView(tags) {
  const aliases = Object.entries(contentRegistry.tagAliases || {});
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">FRONTMATTER TAGS</p><h2>标签与前台同步</h2><p>标签会自动去除首尾空格、合并连续空格，并按 <code>content.registry.json</code> 中的别名统一大小写。点击标签查看对应文章。</p></div>${aliases.length ? `<section class="table-card"><div class="table-heading"><div><h2>命名规范</h2><p>${aliases.map(([source, target]) => `<code>${escapeHtml(source)}</code> → <strong>${escapeHtml(target)}</strong>`).join('　')}</p></div><span class="source-badge">${icon('database')} tagAliases</span></div></section>` : ''}<div class="tag-cloud">${tags.map((tag) => `<button class="tag-card" data-filter-tag="${escapeAttr(tag.name)}"><span>${escapeHtml(tag.name)}</span><b>${tag.count}</b></button>`).join('')}</div></section>`;
}

function archiveView() {
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">DATE ARCHIVE</p><h2>文章归档</h2><p>按 Frontmatter 中的日期自动整理，和前台归档页面使用同一套文章数据。</p></div><div class="archive-list">${archiveYears().map((year) => `<section class="archive-year"><div class="year-heading"><span class="year-dot"></span><h3>${year.name}</h3><b>${year.count} 篇</b></div><div class="month-list">${year.months.map((month) => `<div class="month-row"><span>${month.name}</span><b>${month.articles.length} 篇</b><div>${month.articles.map((article) => `<button data-copy-path="${escapeAttr(article.sourcePath)}" title="复制项目路径">${escapeHtml(article.title)}${icon('copy')}</button>`).join('')}</div></div>`).join('')}</div></section>`).join('')}</div></section>`;
}

function emptyState() { return `<div class="empty-state">${icon('search')}<strong>没有匹配的文章</strong><p>尝试调整搜索词、分类或标签。</p></div>`; }

function dialogView(dialog) {
  const selectedPath = dialog.sourcePath || articles[0]?.sourcePath || '';
  if (dialog.type === 'category') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">DIRECTORY CATEGORY</p><h2>新增文章分类</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-category-form><label class="form-field"><span>分类名称</span><input data-dialog-category-name maxlength="80" required placeholder="例如：前端工程" autocomplete="off" /></label><label class="form-field"><span>目录名称</span><input data-dialog-category-slug maxlength="80" required placeholder="例如：frontend" autocomplete="off" /><small>将创建 <code>docs/categories/&lt;目录名称&gt;/index.md</code>，前台导航会自动读取。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}创建分类</button></div></form></section></div>`;
  if (dialog.type === 'article') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">ARTICLE GENERATOR</p><h2>新建文章</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-article-form><label class="form-field"><span>文章分类</span><select data-dialog-category-slug>${categoryDirectories.map((item) => `<option value="${escapeAttr(item.slug)}">${escapeHtml(item.name)} · ${escapeHtml(item.slug)}</option>`).join('')}</select></label><label class="form-field"><span>文章标题</span><input data-dialog-title maxlength="120" required placeholder="例如：HTTP 缓存" /></label><label class="form-field"><span>文章描述（可选）</span><input data-dialog-description maxlength="200" placeholder="用于 SEO 与分享摘要；留空会根据标题生成占位描述" /></label><label class="form-field"><span>标签（可选）</span><input data-dialog-tags maxlength="300" placeholder="例如：HTTP, Cache, VitePress" /><small>使用逗号分隔，创建时会按标签规范统一并去重。</small></label><label class="form-field"><span>日期</span><input data-dialog-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /></label><label class="form-field"><span>文件名（可选）</span><input data-dialog-filename maxlength="120" placeholder="默认根据文章标题自动生成" /><small>将复制 <code>docs/templates/article-template.md</code> 到分类的年/月/日目录，并复制生成后的 <code>/docs/...md</code> 路径。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}生成文章</button></div></form></section></div>`;
  if (dialog.type === 'image') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">IMAGE DIRECTORY</p><h2>新建图片目录</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-image-form><label class="form-field"><span>日期</span><input data-dialog-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /><small>创建 <code>docs/public/img/年/月/日</code>，并复制图片目录和前台引用路径。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}生成图片目录</button></div></form></section></div>`;
  if (dialog.type === 'draft') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">DRAFT WORKSPACE</p><h2>新建草稿</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-draft-form><label class="form-field"><span>标题</span><input data-draft-title maxlength="120" required placeholder="例如：Hermes 写作计划" /></label><label class="form-field"><span>描述</span><input data-draft-description maxlength="200" placeholder="这份草稿要解决什么问题？" /></label><label class="form-field"><span>标签</span><input data-draft-tags maxlength="300" placeholder="用逗号分隔，可选" /></label><label class="form-field"><span>日期</span><input data-draft-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /></label><label class="form-field"><span>状态</span><select data-draft-create-status><option value="idea">想法</option><option value="writing">编写中</option><option value="paused">暂停</option><option value="done">待转文章</option></select></label><label class="form-field"><span>文件名（可选）</span><input data-draft-filename maxlength="120" placeholder="默认根据标题生成" /></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}创建草稿</button></div></form></section></div>`;
  if (dialog.type === 'refs') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">IMAGE REFERENCES</p><h2>引用这张图片的文档</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><div class="reference-panel"><code>${escapeHtml(dialog.sourcePath)}</code>${dialog.references.length ? `<ul class="reference-list">${dialog.references.map((ref) => `<li><strong>${escapeHtml(ref.title)}</strong><span>${escapeHtml(ref.kind)} · ${escapeHtml(ref.sourcePath)}</span></li>`).join('')}</ul>` : '<p class="muted">暂无文档引用。</p>'}</div><div class="modal-actions"><button type="button" class="button button-primary" data-close-dialog>关闭</button></div></section></div>`;
  if (dialog.type === 'delete') {
    const preview = dialog.preview;
    const refs = preview.references?.length ? (preview.kind === 'image' ? `<div class="delete-warning"><strong>该图片仍被 ${preview.references.length} 篇文档引用</strong><ul class="reference-list">${preview.references.map((ref) => `<li><strong>${escapeHtml(ref.title)}</strong><span>${escapeHtml(ref.sourcePath)}</span></li>`).join('')}</ul></div>` : `<div class="delete-info"><strong>正文引用了 ${preview.references.length} 张图片</strong><p>只删除 Markdown 文件，不会删除这些图片：${preview.references.map((ref) => `<code>${escapeHtml(ref)}</code>`).join('、')}</p></div>`) : '';
    const force = preview.kind === 'image' && preview.referenced ? `<label class="check-field danger-check"><input data-force-delete type="checkbox" /><span>我确认已处理上述引用，强制删除</span></label>` : '';
    const disabled = preview.kind === 'image' && preview.referenced ? 'disabled' : '';
    return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel delete-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">DELETE PREVIEW</p><h2>确认删除${preview.kind === 'category' ? '分类' : preview.kind === 'image' ? '图片' : preview.kind === 'draft' ? '草稿' : '文章'}</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><div class="delete-preview"><div class="delete-target"><strong>${escapeHtml(preview.title || preview.name || preview.category?.name || '')}</strong><code>${escapeHtml(preview.sourcePath || preview.directory || '')}</code></div>${preview.kind === 'category' ? `<p>将递归删除分类目录中的 <strong>${preview.fileCount}</strong> 个文件：${preview.files.slice(0, 12).map((file) => `<code>${escapeHtml(file)}</code>`).join('、')}${preview.files.length > 12 ? '……' : ''}</p>` : ''}${preview.size != null ? `<p>文件大小：${formatBytes(preview.size)}</p>` : ''}${refs}<p class="delete-warning">此操作会直接修改本地仓库文件，删除后不会自动恢复。</p>${force}</div><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="button" class="button button-danger" data-confirm-delete data-kind="${escapeAttr(preview.kind)}" data-source-path="${escapeAttr(preview.sourcePath || preview.category?.id || '')}" ${disabled}>${trashIcon()}确认删除</button></div></section></div>`;
  }
  if (dialog.type === 'move-preview') {
    const preview = dialog.preview;
    const imageRows = preview.imageChanges.length ? preview.imageChanges.map((item) => `<li><code>${escapeHtml(item.from)}</code><span>→</span><code>${escapeHtml(item.to)}</code></li>`).join('') : '<li class="muted">没有需要调整的相对图片路径</li>';
    const missing = preview.missingImages.length ? `<div class="move-warning"><strong>未找到的图片引用</strong><p>${preview.missingImages.map((item) => `<code>${escapeHtml(item)}</code>`).join('、')}</p></div>` : '';
    return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel move-preview-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">MOVE PREVIEW</p><h2>确认文章移动</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><div class="move-preview"><div class="move-paths"><div><span>原路径</span><code>${escapeHtml(preview.sourcePath)}</code></div><div>${icon('chevron')}<span>目标路径</span><code>${escapeHtml(preview.targetPath)}</code></div></div><div class="move-change-grid"><div><span>原分类</span><strong>${escapeHtml(preview.sourceCategory || '未注册')}</strong></div><div><span>新分类</span><strong>${escapeHtml(preview.targetCategory)} <code>${escapeHtml(preview.targetCategoryId)}</code></strong></div><div><span>Frontmatter</span><strong>${preview.categoryChanged ? 'categories 将更新' : '无需更新'}</strong></div><div><span>正文</span><strong>${preview.contentChanged ? '图片路径将更新' : '无需更新'}</strong></div></div><div class="move-image-changes"><h3>图片相对路径</h3><ul>${imageRows}</ul></div>${missing}</div><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="button" class="button button-primary" data-confirm-move data-source-path="${escapeAttr(dialog.sourcePath)}" data-target-category="${escapeAttr(dialog.targetCategorySlug)}">${icon('check')}确认移动并更新</button></div></section></div>`;
  }
  const currentSlug = articles.find((article) => article.sourcePath === selectedPath)?.directoryCategorySlug;
  const moveTargets = categoryDirectories.filter((item) => item.slug !== currentSlug);
  const target = moveTargets[0];
  return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">MOVE ARTICLE</p><h2>更换文章分类</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-move-article-form><input type="hidden" data-dialog-source-path value="${escapeAttr(selectedPath)}" /><label class="form-field"><span>目标分类</span><select data-dialog-target-category>${moveTargets.map((item) => `<option value="${escapeAttr(item.slug)}" ${item.slug === target?.slug ? 'selected' : ''}>${escapeHtml(item.name)} · ${escapeHtml(item.slug)}</option>`).join('')}</select></label><small>下一步只生成变更预览，不会立即移动文件。确认后才会移动到相同的年/月/日目录、更新 Frontmatter，并修正受影响的相对图片路径。</small><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary" ${moveTargets.length ? '' : 'disabled'}>${icon('check')}预览变更</button></div></form></section></div>`;
}

function closeIcon() { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'; }

function bindEvents() {
  app.querySelector('[data-toggle-sidebar]')?.addEventListener('click', () => { state.sidebarCollapsed = !state.sidebarCollapsed; render(); });
  app.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.nav; state.query = ''; state.category = 'all'; state.tag = 'all'; state.issue = 'all'; state.top = 'all'; state.imageDate = 'all'; state.imageType = 'all'; state.imageReference = 'all'; render(); }));
  app.querySelector('[data-search]')?.addEventListener('input', (event) => { state.query = event.target.value; render(); const input = app.querySelector('[data-search]'); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
  app.querySelector('[data-category]')?.addEventListener('change', (event) => { state.category = event.target.value; render(); });
  app.querySelector('[data-tag]')?.addEventListener('change', (event) => { state.tag = event.target.value; render(); });
  app.querySelector('[data-issue]')?.addEventListener('change', (event) => { state.issue = event.target.value; render(); });
  app.querySelector('[data-top]')?.addEventListener('change', (event) => { state.top = event.target.value; render(); });
  app.querySelector('[data-sort]')?.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
  app.querySelector('[data-image-date]')?.addEventListener('change', (event) => { state.imageDate = event.target.value; render(); });
  app.querySelector('[data-image-type]')?.addEventListener('change', (event) => { state.imageType = event.target.value; render(); });
  app.querySelector('[data-image-reference]')?.addEventListener('change', (event) => { state.imageReference = event.target.value; render(); });
  app.querySelector('[data-clear-filters]')?.addEventListener('click', () => { state.query = ''; state.category = 'all'; state.tag = 'all'; state.issue = 'all'; state.top = 'all'; state.imageDate = 'all'; state.imageType = 'all'; state.imageReference = 'all'; render(); });
  app.querySelector('[data-refresh]')?.addEventListener('click', () => window.location.reload());
  app.querySelectorAll('[data-filter-category]').forEach((button) => button.addEventListener('click', () => { state.view = 'articles'; state.category = button.dataset.filterCategory; state.issue = 'all'; state.top = 'all'; render(); }));
  app.querySelectorAll('[data-filter-tag]').forEach((button) => button.addEventListener('click', () => { state.view = 'articles'; state.tag = button.dataset.filterTag; state.issue = 'all'; render(); }));
  app.querySelectorAll('[data-copy-path]').forEach((button) => button.addEventListener('click', () => copyPath(button.dataset.copyPath)));
  app.querySelectorAll('[data-toggle-top]').forEach((button) => button.addEventListener('click', () => toggleTop(button.dataset.sourcePath, button.dataset.isTop === 'true')));
  app.querySelectorAll('[data-normalize-category]').forEach((button) => button.addEventListener('click', () => normalizeCategory(button.dataset.sourcePath)));
  app.querySelectorAll('[data-normalize-tags]').forEach((button) => button.addEventListener('click', () => normalizeTags(button.dataset.sourcePath)));
  app.querySelectorAll('[data-open-category-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'category', sourcePath: button.dataset.sourcePath || articles[0]?.sourcePath || '' }; render(); }));
  app.querySelectorAll('[data-open-article-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'article' }; render(); }));
  app.querySelectorAll('[data-open-image-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'image' }; render(); }));
  app.querySelectorAll('[data-open-upload-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'upload' }; render(); }));
  app.querySelectorAll('[data-open-draft-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'draft' }; render(); }));
  app.querySelectorAll('[data-open-move-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'move', sourcePath: button.dataset.sourcePath }; render(); }));
  app.querySelectorAll('[data-show-image-refs]').forEach((button) => button.addEventListener('click', () => { const image = images.find((item) => item.sourcePath === button.dataset.showImageRefs); state.dialog = { type: 'refs', sourcePath: button.dataset.showImageRefs, references: image?.references || [] }; render(); }));
  app.querySelectorAll('[data-delete-article]').forEach((button) => button.addEventListener('click', () => previewDelete('article', button.dataset.sourcePath)));
  app.querySelectorAll('[data-delete-draft]').forEach((button) => button.addEventListener('click', () => previewDelete('draft', button.dataset.sourcePath)));
  app.querySelectorAll('[data-delete-image]').forEach((button) => button.addEventListener('click', () => previewDelete('image', button.dataset.sourcePath)));
  app.querySelectorAll('[data-delete-category]').forEach((button) => button.addEventListener('click', () => previewDelete('category', button.dataset.categorySlug)));
  app.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = null; render(); }));
  app.querySelector('[data-dialog-panel]')?.addEventListener('click', (event) => event.stopPropagation());
  app.querySelector('[data-create-category-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createCategory(app.querySelector('[data-dialog-category-name]').value, app.querySelector('[data-dialog-category-slug]').value); });
  app.querySelector('[data-create-article-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createArticle(app.querySelector('[data-dialog-category-slug]').value, app.querySelector('[data-dialog-title]').value, app.querySelector('[data-dialog-description]').value, app.querySelector('[data-dialog-tags]').value, app.querySelector('[data-dialog-date]').value, app.querySelector('[data-dialog-filename]').value); });
  app.querySelector('[data-create-image-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createImageDirectory(app.querySelector('[data-dialog-date]').value); });
  app.querySelector('[data-create-draft-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createDraft(app.querySelector('[data-draft-title]').value, app.querySelector('[data-draft-description]').value, app.querySelector('[data-draft-tags]').value, app.querySelector('[data-draft-date]').value, app.querySelector('[data-draft-create-status]').value, app.querySelector('[data-draft-filename]').value); });
  app.querySelector('[data-upload-form]')?.addEventListener('submit', (event) => { event.preventDefault(); uploadImage(app.querySelector('[data-upload-file]').files[0], app.querySelector('[data-upload-date]').value, app.querySelector('[data-upload-name]').value, app.querySelector('[data-upload-optimize]').checked); });
  app.querySelectorAll('[data-draft-status]').forEach((select) => select.addEventListener('change', () => updateDraftStatus(select.dataset.sourcePath, select.value)));
  app.querySelector('[data-confirm-delete]')?.addEventListener('click', (button) => confirmDelete(button.currentTarget.dataset.kind, button.currentTarget.dataset.sourcePath, app.querySelector('[data-force-delete]')?.checked === true));
  app.querySelector('[data-force-delete]')?.addEventListener('change', (event) => { const button = app.querySelector('[data-confirm-delete]'); if (button) button.disabled = !event.target.checked; });
  app.querySelector('[data-move-article-form]')?.addEventListener('submit', (event) => { event.preventDefault(); previewMove(app.querySelector('[data-dialog-source-path]').value, app.querySelector('[data-dialog-target-category]').value); });
  app.querySelector('[data-confirm-move]')?.addEventListener('click', (button) => moveArticle(button.currentTarget.dataset.sourcePath, button.currentTarget.dataset.targetCategory));
}

async function addCategory(sourcePath, category) {
  await writeArticle('/__admin/api/articles/category', { sourcePath, category }, '分类已写入 Frontmatter');
}

async function toggleTop(sourcePath, isTop) {
  await writeArticle('/__admin/api/articles/toggle-top', { sourcePath, isTop: !isTop }, isTop ? '已取消置顶' : '已设为置顶');
}

async function normalizeCategory(sourcePath) {
  if (!window.confirm('将使用文章所在目录的英文分类 ID 覆盖当前 categories 字段，是否继续？')) return;
  await writeArticle('/__admin/api/articles/normalize-category', { sourcePath }, '分类已同步为稳定英文 ID');
}

async function normalizeTags(sourcePath) {
  if (!window.confirm('将根据标签规范表调整大小写、空格并移除重复标签，是否继续？')) return;
  await writeArticle('/__admin/api/articles/normalize-tags', { sourcePath }, '标签已完成规范化');
}

async function createCategory(name, slug) { await writeAndCopy('/__admin/api/categories/create', { name, slug }, (result) => result.category.sourcePath, `分类已创建：${name}`); }
async function createArticle(categorySlug, title, description, tags, date, filename) { await writeAndCopy('/__admin/api/articles/create', { categorySlug, title, description, tags, date, filename }, (result) => result.article.sourcePath, '文章已按模板生成，Markdown 路径已复制'); }
async function createImageDirectory(date) { try { const response = await fetch('/__admin/api/assets/image-directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) }); const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.message || '创建失败'); state.dialog = null; copyPath(result.directory.sourcePath); showNotice(`图片目录已创建并复制：${result.directory.sourcePath}`); window.setTimeout(() => window.location.reload(), 700); } catch (error) { showNotice(error instanceof Error ? error.message : '创建失败'); } }
async function createDraft(title, description, tags, date, status, filename) { await writeAndCopy('/__admin/api/drafts/create', { title, description, tags, date, status, filename }, (result) => result.draft.sourcePath, '草稿已创建，路径已复制'); }
async function updateDraftStatus(sourcePath, status) { await writeArticle('/__admin/api/drafts/status', { sourcePath, status }, '草稿状态已更新'); }
async function previewDelete(kind, sourcePath) {
  const endpoint = kind === 'image' ? 'assets' : kind === 'category' ? 'categories' : kind === 'draft' ? 'drafts' : 'articles';
  try {
    const response = await fetch(`/__admin/api/${endpoint}/delete-preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kind === 'category' ? { categorySlug: sourcePath } : { sourcePath }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '无法生成删除预览');
    state.dialog = { type: 'delete', preview: { ...result.preview, kind } };
    render();
  } catch (error) { showNotice(error instanceof Error ? error.message : '无法生成删除预览'); }
}
async function confirmDelete(kind, sourcePath, force = false) {
  const endpoint = kind === 'image' ? 'assets' : kind === 'category' ? 'categories' : kind === 'draft' ? 'drafts' : 'articles';
  const payload = kind === 'category' ? { categorySlug: sourcePath, confirm: true } : { sourcePath, confirm: true, force };
  await writeAndCopy(`/__admin/api/${endpoint}/delete`, payload, () => '', `${kind === 'image' ? '图片' : kind === 'category' ? '分类' : kind === 'draft' ? '草稿' : '文章'}已删除`);
}
async function uploadImage(file, date, requestedName, optimize) {
  if (!file) return;
  try {
    let uploadFile = file;
    if (optimize && !/image\/svg\+xml/i.test(file.type)) uploadFile = await optimizeImage(file);
    const effectiveName = optimize && requestedName.trim() ? requestedName.trim().replace(/\.[^.]+$/, '.webp') : requestedName.trim();
    const form = new FormData(); form.append('date', date); if (effectiveName) form.append('name', effectiveName); form.append('file', uploadFile, uploadFile.name);
    const response = await fetch('/__admin/api/assets/upload', { method: 'POST', body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '上传失败');
    state.dialog = null;
    await navigator.clipboard?.writeText(result.upload.markdownPath);
    showNotice(`图片已上传，Markdown 路径已复制：${result.upload.markdownPath}`);
    window.setTimeout(() => window.location.reload(), 700);
  } catch (error) { showNotice(error instanceof Error ? error.message : '上传失败，请确认当前使用的是 admin:dev'); }
}
async function optimizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0); bitmap.close();
  const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('图片压缩失败')), 'image/webp', 0.82));
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
}
async function previewMove(sourcePath, targetCategorySlug) {
  try {
    const response = await fetch('/__admin/api/articles/move-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourcePath, targetCategorySlug }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '无法生成移动预览');
    state.dialog = { type: 'move-preview', sourcePath, targetCategorySlug, preview: result.preview };
    render();
  } catch (error) { showNotice(error instanceof Error ? error.message : '无法生成移动预览'); }
}
async function moveArticle(sourcePath, targetCategorySlug) { await writeAndCopy('/__admin/api/articles/move', { sourcePath, targetCategorySlug }, (result) => result.article.targetPath, '文章分类已更换，路径已复制'); }

async function writeAndCopy(url, payload, getPath, successMessage) {
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '写入失败');
    state.dialog = null;
    const copiedPath = getPath(result);
    if (copiedPath && navigator.clipboard) await navigator.clipboard.writeText(copiedPath);
    showNotice(`${successMessage}：${copiedPath}`);
    window.setTimeout(() => window.location.reload(), 700);
  } catch (error) { showNotice(error instanceof Error ? error.message : '写入失败，请确认当前使用的是 admin:dev'); }
}

async function writeArticle(url, payload, successMessage) {
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '写入失败');
    state.dialog = null;
    showNotice(successMessage);
    window.setTimeout(() => window.location.reload(), 350);
  } catch (error) {
    showNotice(error instanceof Error ? error.message : '写入失败，请确认当前使用的是 admin:dev');
  }
}

function filterArticles() {
  const query = state.query.trim().toLowerCase();
  return articles.filter((article) => { const haystack = [article.title, article.sourcePath, article.sitePath, article.directoryCategoryName, article.categories.join(' '), article.tags.join(' '), article.issues.map((issue) => issue.label).join(' ')].join(' ').toLowerCase(); return (!query || haystack.includes(query)) && (state.category === 'all' || article.directoryCategoryName === state.category) && (state.tag === 'all' || article.tags.includes(state.tag)) && (state.issue === 'all' || (state.issue === 'has' ? article.issues.length > 0 : article.issues.some((issue) => issue.code === state.issue))) && (state.top === 'all' || (state.top === 'top' ? article.isTop : !article.isTop)); });
}

function sortArticles(items) {
  return [...items].sort((a, b) => {
    if (state.sort === 'title-asc') return a.title.localeCompare(b.title, 'zh-CN');
    if (state.sort === 'path-asc') return a.sourcePath.localeCompare(b.sourcePath);
    if (state.sort === 'issues-desc') return b.issues.length - a.issues.length || dateValue(b.date) - dateValue(a.date);
    if (state.sort === 'date-desc') return dateValue(b.date) - dateValue(a.date) || a.title.localeCompare(b.title, 'zh-CN');
    return dateValue(b.modifiedAt) - dateValue(a.modifiedAt) || dateValue(b.date) - dateValue(a.date);
  });
}

function issueOptions() {
  const labels = new Map();
  articles.forEach((article) => article.issues.forEach((issue) => labels.set(issue.code, issue.label)));
  return [...labels].map(([code, label]) => ({ code, label }));
}

function hasActiveFilters() { return Boolean(state.query.trim() || state.category !== 'all' || state.tag !== 'all' || state.issue !== 'all' || state.top !== 'all'); }

function collectCategories() {
  return categoryDirectories.map((directory) => ({ ...directory, count: articles.filter((article) => article.directoryCategorySlug === directory.slug).length }));
}

function imageCount() {
  return images.length;
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function imageDate(image) {
  const match = image.sourcePath.match(/\/img\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
  return match ? `${match[1]}/${Number(match[2])}/${Number(match[3])}` : 'unknown';
}

function imageDateOptions() {
  const counts = new Map();
  images.forEach((image) => { const value = imageDate(image); counts.set(value, (counts.get(value) || 0) + 1); });
  return [...counts].filter(([value]) => value !== 'unknown').sort((a, b) => b[0].localeCompare(a[0])).map(([value, count]) => ({ value, count, label: value }));
}

function collectTags() {
  const counts = new Map();
  articles.forEach((article) => article.tags.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1)));
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

function archiveYears() {
  const years = new Map();
  articles.forEach((article) => { const date = parseDate(article.date); const yearName = date ? `${date.getFullYear()} 年` : '未设置日期'; const monthName = date ? `${String(date.getMonth() + 1).padStart(2, '0')} 月` : '未设置月份'; if (!years.has(yearName)) years.set(yearName, new Map()); const months = years.get(yearName); if (!months.has(monthName)) months.set(monthName, []); months.get(monthName).push(article); });
  return [...years].sort((a, b) => b[0].localeCompare(a[0])).map(([name, months]) => ({ name, count: [...months.values()].flat().length, months: [...months].sort((a, b) => b[0].localeCompare(a[0])).map(([monthName, monthArticles]) => ({ name: monthName, articles: monthArticles })) }));
}

function copyPath(path) { if (!navigator.clipboard) { showNotice('当前环境不支持自动复制，请手动选择路径'); return; } navigator.clipboard.writeText(path).then(() => showNotice(`已复制：${path}`)).catch(() => showNotice('复制失败，请手动选择路径')); }
function categoryLink(category) { return category === '未分类' ? '<span class="muted">未分类</span>' : `<button class="text-link" data-filter-category="${escapeAttr(category)}">${escapeHtml(category)}</button>`; }
function tagLink(tag) { return `<button class="tag-pill" data-filter-tag="${escapeAttr(tag)}">${escapeHtml(tag)}</button>`; }
function parseDate(value) { if (!value) return null; const date = new Date(value); return Number.isNaN(date.valueOf()) ? null : date; }
function dateValue(value) { const date = parseDate(value); return date ? date.valueOf() : 0; }
function formatDate(value) { const date = parseDate(value); return date ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '未设置'; }
function formatDateTime(value) { const date = parseDate(value); return date ? date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '未记录'; }
function showNotice(message) { state.notice = message; clearTimeout(noticeTimer); render(); noticeTimer = setTimeout(() => { state.notice = ''; render(); }, 2500); }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function escapeAttr(value) { return escapeHtml(value); }
function icon(name) { const paths = { search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/>', folder: '<path d="M3 6h7l2 2h9v11H3z"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-3 5 5"/>', upload: '<path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 20h14"/>', book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6z"/>', tag: '<path d="m20 13-7 7L3 10V4h6z"/><circle cx="7" cy="7" r="1"/>', archive: '<path d="M4 6h16v14H4zM3 3h18v3H3zM9 10h6"/>', refresh: '<path d="M20 11a8 8 0 0 0-14-5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 5l2-2"/><path d="M20 20v-4h-4"/>', lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', database: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', external: '<path d="M14 3h7v7M21 3l-9 9"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>', chevron: '<path d="m9 18 6-6-6-6"/>', pin: '<path d="m15 4 5 5-3 1-4 4v4l-2 2-2-6-6-2 2-2h4l4-4z"/>', check: '<path d="m5 12 4 4L19 6"/>' }; return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.file}</svg>`; }
