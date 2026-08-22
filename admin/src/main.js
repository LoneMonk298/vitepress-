import './styles.css';
import articles, { categoryDirectories, courses, images, indexMeta } from 'virtual:admin-articles';

const state = { view: 'articles', query: '', category: 'all', tag: 'all', issue: 'all', top: 'all', sort: 'modified-desc', imageDate: 'all', notice: '', sidebarCollapsed: false, dialog: null };
const app = document.querySelector('#app');
const frontendUrl = import.meta.env.VITEPRESS_URL || 'http://localhost:5173';
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
  return `<aside class="sidebar"><div class="brand"><div class="brand-mark">L</div><div><strong>知识库管理台</strong><span>CONTENT INDEX</span></div></div><div class="workspace-label">内容管理</div><nav class="nav-list">${navItem('articles', '文章索引', icon('file'), articles.length)}${navItem('images', '图片管理', icon('image'), imageCount())}${navItem('courses', '课程尝试', icon('book'), courses.length)}${navItem('tags', '标签管理', icon('tag'), tags.length)}${navItem('archives', '归档管理', icon('archive'), archiveYears().length)}</nav><div class="sidebar-foot"><span class="status-dot"></span><span>已连接当前仓库</span><small>本地可写</small></div></aside>`;
}

function navItem(view, label, itemIcon, count) {
  return `<button class="nav-item ${state.view === view ? 'active' : ''}" data-nav="${view}">${itemIcon}<span>${label}</span><em>${count}</em></button>`;
}

function topbar() {
  const titles = { articles: ['文章管理', '从 docs Markdown 自动生成的项目索引'], images: ['图片管理', '上传图片到日期目录并复制 Markdown 相对路径'], courses: ['课程尝试', '按课程章节管理 docs/courses 内容'], tags: ['标签管理', '与前台文章标签保持一致'], archives: ['归档管理', '按文章 Frontmatter 日期聚合'] };
  const [title, subtitle] = titles[state.view];
  return `<header class="topbar"><div class="topbar-left"><button class="icon-button menu-toggle" data-toggle-sidebar title="${state.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}" aria-label="${state.sidebarCollapsed ? '展开侧栏' : '收起侧栏'}">${icon('menu')}</button><div><p class="eyebrow">LONEMONK / ADMIN</p><h1>${title} <span>${subtitle}</span></h1></div></div><div class="topbar-actions"><span class="scan-meta">最后扫描 ${formatDateTime(indexMeta.indexedAt)}</span><span class="readonly-pill">${icon('file')} 本地文件管理</span><a class="front-link" href="${escapeAttr(frontendUrl)}" target="_blank" rel="noreferrer">${icon('home')}前台首页</a></div></header>`;
}

function content(filtered, categories, tags) {
  if (state.view === 'images') return imageView();
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
  return `<tr><td><div class="title-cell"><span class="article-icon">${icon(article.isTop ? 'pin' : 'file')}</span><div><strong>${escapeHtml(article.title)}</strong>${article.isTop ? '<small>置顶文章</small>' : ''}</div></div></td><td><button class="path-copy" data-copy-path="${escapeAttr(path)}" title="复制项目路径"><code>${escapeHtml(path)}</code>${icon('copy')}</button></td><td>${categoryLink(category)}</td><td><div class="tag-list">${article.tags.length ? article.tags.map(tagLink).join('') : '<span class="muted">-</span>'}</div></td><td><span class="date-cell">${formatDate(article.date)}</span></td><td><span class="badge ${article.status}">${article.status === 'draft' ? '草稿' : '已发布'}</span></td><td>${issueCell(article)}</td><td><div class="row-actions"><a class="icon-button" href="${escapeAttr(`${frontendUrl}/${encodeURI(article.sitePath)}`)}" target="_blank" rel="noreferrer" title="打开前台文章">${icon('external')}</a><button class="icon-button" data-copy-path="${escapeAttr(path)}" title="复制路径">${icon('copy')}</button><button class="icon-button ${article.isTop ? 'is-active' : ''}" data-toggle-top data-source-path="${escapeAttr(path)}" data-is-top="${article.isTop}" title="${article.isTop ? '取消置顶' : '设为置顶'}">${icon('pin')}</button><button class="icon-button" data-open-move-dialog data-source-path="${escapeAttr(path)}" title="更换分类">${icon('folder')}</button></div></td></tr>`;
}

function issueCell(article) { return article.issues.length ? `<div class="issue-list">${article.issues.map((issue) => `<span class="issue-badge" title="${escapeAttr(issue.label)}">${escapeHtml(issue.label)}</span>`).join('')}</div>` : '<span class="check-ok">检查通过</span>'; }

function categoryView(categories) {
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">DIRECTORY CATEGORIES</p><div class="view-heading"><div><h2>文章目录分类</h2><p>只展示 <code>docs/categories</code> 下的目录；课程与归档不会混入。新增后可复制目录路径。</p></div><button class="button button-primary" data-open-category-dialog>${icon('folder')}新增分类</button></div></div><div class="category-grid">${categories.map((category) => `<div class="category-card"><button class="category-card-main" data-filter-category="${escapeAttr(category.name)}"><div class="category-mark">${icon('folder')}</div><div><strong>${escapeHtml(category.name)}</strong><span>${category.count} 篇文章 · <code>/docs/categories/${escapeHtml(category.slug)}</code></span></div>${icon('chevron')}</button><button class="icon-button" data-copy-path="${escapeAttr(`/docs/categories/${category.slug}`)}" title="复制分类路径">${icon('copy')}</button></div>`).join('')}</div></section>`;
}

function imageView() {
  const filteredImages = state.imageDate === 'all' ? images : images.filter((image) => imageDate(image) === state.imageDate);
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">IMAGE ASSETS</p><div class="view-heading"><div><h2>图片管理</h2><p>选择图片和日期，上传后复制可直接粘贴到文章目录中的 Markdown 相对路径。</p></div><button class="button button-primary" data-open-upload-dialog>${icon('upload')}上传图片</button></div></div><div class="toolbar"><select data-image-date aria-label="按图片日期筛选"><option value="all">全部日期（${images.length}）</option>${imageDateOptions().map((item) => `<option value="${escapeAttr(item.value)}" ${state.imageDate === item.value ? 'selected' : ''}>${escapeHtml(item.label)}（${item.count}）</option>`).join('')}</select><button class="button button-ghost" data-open-image-dialog>${icon('folder')}新建图片目录</button><button class="button button-primary" data-refresh>${icon('refresh')}刷新图片索引</button></div><section class="table-card"><div class="table-heading"><div><h2>图片目录</h2><p><code>docs/public/img/年/月/日</code> 下的图片由前台以 <code>/img/...</code> 访问。</p></div><span class="source-badge">${icon('database')} ${filteredImages.length} / ${images.length} 个文件</span></div>${filteredImages.length ? `<div class="table-scroll"><table><thead><tr><th>文件名</th><th>项目路径</th><th>Markdown 相对路径</th><th>操作</th></tr></thead><tbody>${filteredImages.map((image) => `<tr><td><strong>${escapeHtml(image.name)}</strong></td><td><code>${escapeHtml(image.sourcePath)}</code></td><td><code>${escapeHtml(image.markdownPath)}</code></td><td><button class="icon-button" data-copy-path="${escapeAttr(image.markdownPath)}" title="复制 Markdown 路径">${icon('copy')}</button></td></tr>`).join('')}</tbody></table></div>` : `<div class="image-help"><div class="category-mark">${icon('image')}</div><div><strong>没有匹配的图片</strong><p>选择其他日期或上传一张新图片。</p></div></div>`}</section></section>`;
}

function courseView() {
  const query = state.query.trim().toLowerCase();
  const items = courses.filter((course) => !query || `${course.title} ${course.sourcePath} ${course.chapter}`.toLowerCase().includes(query));
  return `<section class="content-area"><div class="stats-row">${stat('课程内容', courses.length)}${stat('章节目录', new Set(courses.map((course) => course.chapter)).size)}${stat('当前显示', items.length)}${stat('管理方式', 'IDE')}</div><div class="toolbar"><div class="search-box">${icon('search')}<input data-search placeholder="搜索课程标题或路径" value="${escapeAttr(state.query)}" /></div><button class="button button-primary" data-refresh>${icon('refresh')}刷新课程索引</button></div><section class="table-card"><div class="table-heading"><div><h2>课程章节</h2><p>课程内容与文章分类完全分开，点击路径复制后在 IDE 中编辑。</p></div><span class="source-badge">${icon('book')} docs/courses/**/*.md</span></div>${items.length ? `<div class="table-scroll"><table><thead><tr><th>章节</th><th>标题</th><th>项目路径</th><th>修改时间</th><th>操作</th></tr></thead><tbody>${items.map((course) => `<tr><td><span class="text-link">${escapeHtml(course.chapter)}</span></td><td><strong>${escapeHtml(course.title)}</strong></td><td><button class="path-copy" data-copy-path="${escapeAttr(course.sourcePath)}" title="复制项目路径"><code>${escapeHtml(course.sourcePath)}</code>${icon('copy')}</button></td><td class="date-cell">${formatDateTime(course.modifiedAt)}</td><td><div class="row-actions"><a class="icon-button" href="${escapeAttr(`${frontendUrl}/${encodeURI(course.sitePath)}`)}" target="_blank" rel="noreferrer" title="打开前台课程">${icon('external')}</a><button class="icon-button" data-copy-path="${escapeAttr(course.sourcePath)}" title="复制路径">${icon('copy')}</button></div></td></tr>`).join('')}</tbody></table></div>` : emptyState()}</section></section>`;
}

function uploadDialog() {
  return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">UPLOAD IMAGE</p><h2>上传图片</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-upload-form><label class="form-field"><span>图片文件</span><input data-upload-file type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" required /></label><label class="form-field"><span>归档日期</span><input data-upload-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /></label><small>图片会写入 <code>docs/public/img/年/月/日</code>，上传完成后自动复制相对 Markdown 路径。</small><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('upload')}上传并复制路径</button></div></form></section></div>`;
}

function trashIcon() { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></svg>'; }

function tagView(tags) {
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">FRONTMATTER TAGS</p><h2>标签与前台同步</h2><p>点击标签查看使用它的文章。数据直接来自每篇 Markdown 的 <code>tags</code> 字段。</p></div><div class="tag-cloud">${tags.map((tag) => `<button class="tag-card" data-filter-tag="${escapeAttr(tag.name)}"><span>${escapeHtml(tag.name)}</span><b>${tag.count}</b></button>`).join('')}</div></section>`;
}

function archiveView() {
  return `<section class="content-area"><div class="view-intro"><p class="eyebrow">DATE ARCHIVE</p><h2>文章归档</h2><p>按 Frontmatter 中的日期自动整理，和前台归档页面使用同一套文章数据。</p></div><div class="archive-list">${archiveYears().map((year) => `<section class="archive-year"><div class="year-heading"><span class="year-dot"></span><h3>${year.name}</h3><b>${year.count} 篇</b></div><div class="month-list">${year.months.map((month) => `<div class="month-row"><span>${month.name}</span><b>${month.articles.length} 篇</b><div>${month.articles.map((article) => `<button data-copy-path="${escapeAttr(article.sourcePath)}" title="复制项目路径">${escapeHtml(article.title)}${icon('copy')}</button>`).join('')}</div></div>`).join('')}</div></section>`).join('')}</div></section>`;
}

function emptyState() { return `<div class="empty-state">${icon('search')}<strong>没有匹配的文章</strong><p>尝试调整搜索词、分类或标签。</p></div>`; }

function dialogView(dialog) {
  const selectedPath = dialog.sourcePath || articles[0]?.sourcePath || '';
  if (dialog.type === 'category') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">DIRECTORY CATEGORY</p><h2>新增文章分类</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-category-form><label class="form-field"><span>分类名称</span><input data-dialog-category-name maxlength="80" required placeholder="例如：前端工程" autocomplete="off" /></label><label class="form-field"><span>目录名称</span><input data-dialog-category-slug maxlength="80" required placeholder="例如：frontend" autocomplete="off" /><small>将创建 <code>docs/categories/&lt;目录名称&gt;/index.md</code>，前台导航会自动读取。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}创建分类</button></div></form></section></div>`;
  if (dialog.type === 'article') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">ARTICLE PATH</p><h2>新建文章目录</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-article-form><label class="form-field"><span>文章分类</span><select data-dialog-category-slug>${categoryDirectories.map((item) => `<option value="${escapeAttr(item.slug)}">${escapeHtml(item.name)} · ${escapeHtml(item.slug)}</option>`).join('')}</select></label><label class="form-field"><span>文章标题</span><input data-dialog-title maxlength="120" required placeholder="例如：HTTP 缓存" /></label><label class="form-field"><span>日期</span><input data-dialog-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /></label><label class="form-field"><span>文件名（可选）</span><input data-dialog-filename maxlength="120" placeholder="默认使用文章标题" /><small>创建后复制返回的 Markdown 路径，在 IDE 中继续编辑。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}生成文章路径</button></div></form></section></div>`;
  if (dialog.type === 'image') return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">IMAGE DIRECTORY</p><h2>新建图片目录</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-create-image-form><label class="form-field"><span>日期</span><input data-dialog-date type="date" required value="${new Date().toISOString().slice(0, 10)}" /><small>创建 <code>docs/public/img/年/月/日</code>，并复制图片目录和前台引用路径。</small></label><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}生成图片目录</button></div></form></section></div>`;
  const target = categoryDirectories.find((item) => item.slug !== articles.find((article) => article.sourcePath === selectedPath)?.directoryCategorySlug) || categoryDirectories[0];
  return `<div class="modal-backdrop" data-close-dialog><section class="modal-panel" data-dialog-panel role="dialog" aria-modal="true"><div class="modal-header"><div><p class="eyebrow">MOVE ARTICLE</p><h2>更换文章分类</h2></div><button class="icon-button" data-close-dialog title="关闭">${closeIcon()}</button></div><form data-move-article-form><input type="hidden" data-dialog-source-path value="${escapeAttr(selectedPath)}" /><label class="form-field"><span>目标分类</span><select data-dialog-target-category>${categoryDirectories.map((item) => `<option value="${escapeAttr(item.slug)}" ${item.slug === target?.slug ? 'selected' : ''}>${escapeHtml(item.name)} · ${escapeHtml(item.slug)}</option>`).join('')}</select></label><small>文章会移动到目标分类下相同的年/月/日目录，并更新 Frontmatter。</small><div class="modal-actions"><button type="button" class="button button-ghost" data-close-dialog>取消</button><button type="submit" class="button button-primary">${icon('check')}移动文章</button></div></form></section></div>`;
}

function closeIcon() { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'; }

function bindEvents() {
  app.querySelector('[data-toggle-sidebar]')?.addEventListener('click', () => { state.sidebarCollapsed = !state.sidebarCollapsed; render(); });
  app.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.nav; state.query = ''; state.category = 'all'; state.tag = 'all'; state.issue = 'all'; state.top = 'all'; state.imageDate = 'all'; render(); }));
  app.querySelector('[data-search]')?.addEventListener('input', (event) => { state.query = event.target.value; render(); const input = app.querySelector('[data-search]'); input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); });
  app.querySelector('[data-category]')?.addEventListener('change', (event) => { state.category = event.target.value; render(); });
  app.querySelector('[data-tag]')?.addEventListener('change', (event) => { state.tag = event.target.value; render(); });
  app.querySelector('[data-issue]')?.addEventListener('change', (event) => { state.issue = event.target.value; render(); });
  app.querySelector('[data-top]')?.addEventListener('change', (event) => { state.top = event.target.value; render(); });
  app.querySelector('[data-sort]')?.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
  app.querySelector('[data-image-date]')?.addEventListener('change', (event) => { state.imageDate = event.target.value; render(); });
  app.querySelector('[data-clear-filters]')?.addEventListener('click', () => { state.query = ''; state.category = 'all'; state.tag = 'all'; state.issue = 'all'; state.top = 'all'; state.imageDate = 'all'; render(); });
  app.querySelector('[data-refresh]')?.addEventListener('click', () => window.location.reload());
  app.querySelectorAll('[data-filter-category]').forEach((button) => button.addEventListener('click', () => { state.view = 'articles'; state.category = button.dataset.filterCategory; state.issue = 'all'; state.top = 'all'; render(); }));
  app.querySelectorAll('[data-filter-tag]').forEach((button) => button.addEventListener('click', () => { state.view = 'articles'; state.tag = button.dataset.filterTag; state.issue = 'all'; render(); }));
  app.querySelectorAll('[data-copy-path]').forEach((button) => button.addEventListener('click', () => copyPath(button.dataset.copyPath)));
  app.querySelectorAll('[data-toggle-top]').forEach((button) => button.addEventListener('click', () => toggleTop(button.dataset.sourcePath, button.dataset.isTop === 'true')));
  app.querySelectorAll('[data-open-category-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'category', sourcePath: button.dataset.sourcePath || articles[0]?.sourcePath || '' }; render(); }));
  app.querySelectorAll('[data-open-article-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'article' }; render(); }));
  app.querySelectorAll('[data-open-image-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'image' }; render(); }));
  app.querySelectorAll('[data-open-upload-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'upload' }; render(); }));
  app.querySelectorAll('[data-open-move-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = { type: 'move', sourcePath: button.dataset.sourcePath }; render(); }));
  app.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => { state.dialog = null; render(); }));
  app.querySelector('[data-dialog-panel]')?.addEventListener('click', (event) => event.stopPropagation());
  app.querySelector('[data-create-category-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createCategory(app.querySelector('[data-dialog-category-name]').value, app.querySelector('[data-dialog-category-slug]').value); });
  app.querySelector('[data-create-article-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createArticle(app.querySelector('[data-dialog-category-slug]').value, app.querySelector('[data-dialog-title]').value, app.querySelector('[data-dialog-date]').value, app.querySelector('[data-dialog-filename]').value); });
  app.querySelector('[data-create-image-form]')?.addEventListener('submit', (event) => { event.preventDefault(); createImageDirectory(app.querySelector('[data-dialog-date]').value); });
  app.querySelector('[data-upload-form]')?.addEventListener('submit', (event) => { event.preventDefault(); uploadImage(app.querySelector('[data-upload-file]').files[0], app.querySelector('[data-upload-date]').value); });
  app.querySelector('[data-move-article-form]')?.addEventListener('submit', (event) => { event.preventDefault(); moveArticle(app.querySelector('[data-dialog-source-path]').value, app.querySelector('[data-dialog-target-category]').value); });
}

async function addCategory(sourcePath, category) {
  await writeArticle('/__admin/api/articles/category', { sourcePath, category }, '分类已写入 Frontmatter');
}

async function toggleTop(sourcePath, isTop) {
  await writeArticle('/__admin/api/articles/toggle-top', { sourcePath, isTop: !isTop }, isTop ? '已取消置顶' : '已设为置顶');
}

async function createCategory(name, slug) { await writeAndCopy('/__admin/api/categories/create', { name, slug }, (result) => result.category.sourcePath, `分类已创建：${name}`); }
async function createArticle(categorySlug, title, date, filename) { await writeAndCopy('/__admin/api/articles/create', { categorySlug, title, date, filename }, (result) => result.article.sourcePath, '文章 Markdown 路径已生成并复制'); }
async function createImageDirectory(date) { try { const response = await fetch('/__admin/api/assets/image-directory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) }); const result = await response.json(); if (!response.ok || !result.ok) throw new Error(result.message || '创建失败'); state.dialog = null; copyPath(result.directory.sourcePath); showNotice(`图片目录已创建并复制：${result.directory.sourcePath}`); window.setTimeout(() => window.location.reload(), 700); } catch (error) { showNotice(error instanceof Error ? error.message : '创建失败'); } }
async function uploadImage(file, date) {
  if (!file) return;
  try {
    const form = new FormData(); form.append('date', date); form.append('file', file, file.name);
    const response = await fetch('/__admin/api/assets/upload', { method: 'POST', body: form });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || '上传失败');
    state.dialog = null;
    await navigator.clipboard?.writeText(result.upload.markdownPath);
    showNotice(`图片已上传，Markdown 路径已复制：${result.upload.markdownPath}`);
    window.setTimeout(() => window.location.reload(), 700);
  } catch (error) { showNotice(error instanceof Error ? error.message : '上传失败，请确认当前使用的是 admin:dev'); }
}
async function moveArticle(sourcePath, targetCategorySlug) { await writeArticle('/__admin/api/articles/move', { sourcePath, targetCategorySlug }, '文章分类已更换，路径已移动'); }

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

async function deleteCategory(category, count) {
  const message = `确定删除分类“${category}”吗？\n\n将从 ${count} 篇文章的 Frontmatter 中移除这个分类，文章文件和目录不会删除。`;
  if (!window.confirm(message)) return;
  await writeArticle('/__admin/api/categories/delete', { category }, `分类已删除，共修改 ${count} 篇文章`);
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
