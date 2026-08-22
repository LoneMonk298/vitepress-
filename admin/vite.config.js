import { defineConfig } from 'vite';
import fg from 'fast-glob';
import matter from 'gray-matter';
import path from 'node:path';
import { existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs';

const virtualModuleId = 'virtual:admin-articles';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

function articleIndexPlugin() {
  return {
    name: 'admin-article-index',
    configureServer(server) {
      // The admin root is separate from docs, so explicitly watch the repository content tree.
      server.watcher.add(path.resolve(process.cwd(), 'docs'));
      server.middlewares.use('/__admin/api', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          if (req.url === '/assets/upload') {
            const upload = await uploadImage(req);
            invalidateIndex(server);
            return sendJson(res, { ok: true, upload });
          }
          const body = await readJsonBody(req);
          if (req.url === '/articles/toggle-top') {
            const article = readArticleForWrite(body.sourcePath);
            article.data.isTop = body.isTop === true;
            writeArticle(article);
            invalidateIndex(server);
            return sendJson(res, { ok: true, isTop: article.data.isTop });
          }
          if (req.url === '/articles/category') {
            const category = String(body.category || '').trim();
            if (!category || category.length > 80) throw new Error('分类名称不能为空且不能超过 80 个字符');
            const article = readArticleForWrite(body.sourcePath);
            const categories = asArray(article.data.categories);
            if (!categories.includes(category)) categories.push(category);
            article.data.categories = categories;
            writeArticle(article);
            invalidateIndex(server);
            return sendJson(res, { ok: true, categories });
          }
          if (req.url === '/categories/delete') {
            const category = String(body.category || '').trim();
            if (!category || category.length > 80) throw new Error('分类名称不能为空且不能超过 80 个字符');
            const changedArticles = removeCategoryFromArticles(category);
            invalidateIndex(server);
            return sendJson(res, { ok: true, category, changedArticles });
          }
          if (req.url === '/categories/create') {
            const category = createCategory(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, category });
          }
          if (req.url === '/articles/create') {
            const article = createArticle(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, article });
          }
          if (req.url === '/articles/move') {
            const article = moveArticle(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, article });
          }
          if (req.url === '/assets/image-directory') {
            const directory = createImageDirectory(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, directory });
          }
          return next();
        } catch (error) {
          return sendJson(res, { ok: false, message: error instanceof Error ? error.message : String(error) }, 400);
        }
      });
    },
    buildStart() {
      fg.sync('docs/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true }).forEach((file) => this.addWatchFile(file));
      fg.sync('docs/public/img/**/*', { cwd: process.cwd(), onlyFiles: true, absolute: true }).forEach((file) => this.addWatchFile(file));
    },
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : undefined;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return undefined;
      const excludedFiles = new Set(['index.md', 'tags.md', 'archives.md', 'me.md']);
      const files = fg.sync('docs/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true });
      const articles = files
        .filter((file) => !excludedFiles.has(path.basename(file)) && !isCourseFile(file) && !isTemplateFile(file))
        .map((file) => {
          const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
          const sitePath = relativePath.replace(/^docs\//, '').replace(/\.md$/, '');
          const categoryMatch = relativePath.match(/^docs\/categories\/([^/]+)\//);
          const directoryCategorySlug = categoryMatch?.[1] || null;
          const directoryCategory = directoryCategorySlug ? categoryDirectories().find((item) => item.slug === directoryCategorySlug) : null;
          const modifiedAt = statSync(file).mtime.toISOString();
          let data = {};
          const issues = [];
          try {
            ({ data } = matter.read(file));
          } catch (error) {
            issues.push({ code: 'frontmatter', label: 'Frontmatter 格式错误' });
            return {
              id: relativePath,
              title: path.basename(file, '.md'),
              sourcePath: `/${relativePath}`,
              sitePath,
              date: null,
              modifiedAt,
              categories: [],
              tags: [],
              directoryCategorySlug,
              directoryCategoryName: directoryCategory?.name || directoryCategorySlug,
              status: 'draft',
              isTop: false,
              issues,
              parseError: error instanceof Error ? error.message : String(error),
            };
          }
          const title = typeof data.title === 'string' ? data.title.trim() : String(data.title || '').trim();
          const date = data.date || null;
          const categories = asArray(data.categories);
          const tags = asArray(data.tags);
          if (!title) issues.push({ code: 'title', label: '缺少标题' });
          if (!date) issues.push({ code: 'date', label: '缺少日期' });
          else if (!dateValue(date)) issues.push({ code: 'date-invalid', label: '日期格式无效' });
          if (!categories.length) issues.push({ code: 'category', label: '未设置分类' });
          return {
            id: relativePath,
            title: title || path.basename(file, '.md'),
            sourcePath: `/${relativePath}`,
            sitePath,
            date,
            modifiedAt,
            categories,
            tags,
            directoryCategorySlug,
            directoryCategoryName: directoryCategory?.name || directoryCategorySlug,
            status: data.draft === true || data.published === false ? 'draft' : 'published',
            isTop: booleanValue(data.isTop ?? data.istop),
            issues,
          };
        })
        .sort((a, b) => dateValue(b.date) - dateValue(a.date));
      const directories = categoryDirectories().map(({ slug, name }) => ({ slug, name }));
      const courses = courseIndex();
      const images = fg.sync('docs/public/img/**/*', { cwd: process.cwd(), onlyFiles: true }).map((file) => {
        const relativeImagePath = file.replaceAll('\\', '/');
        const sourcePath = `/${relativeImagePath}`;
        const rest = relativeImagePath.replace(/^docs\/public\/img\//, '');
        return { sourcePath, publicPath: `/img/${rest}`, markdownPath: `../../../../../public/img/${rest}`, name: path.basename(file) };
      }).sort((a, b) => a.sourcePath.localeCompare(b.sourcePath, 'zh-CN'));
      const indexMeta = { indexedAt: new Date().toISOString(), fileCount: articles.length };
      return `export default ${JSON.stringify(articles)}; export const indexMeta = ${JSON.stringify(indexMeta)}; export const categoryDirectories = ${JSON.stringify(directories)}; export const courses = ${JSON.stringify(courses)}; export const images = ${JSON.stringify(images)};`;
    },
    handleHotUpdate({ file, server }) {
      const normalizedFile = file.replaceAll('\\', '/');
      if (!normalizedFile.includes('/docs/') || (!normalizedFile.endsWith('.md') && !normalizedFile.includes('/docs/public/'))) return;
      const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

function isCourseFile(file) {
  const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
  return relativePath.startsWith('docs/courses/');
}

function isTemplateFile(file) {
  const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
  return relativePath.startsWith('docs/templates/');
}

function courseIndex() {
  const excludedFiles = new Set(['index.md']);
  return fg.sync('docs/courses/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true })
    .filter((file) => !excludedFiles.has(path.basename(file)))
    .map((file) => {
      const sourcePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
      let data = {};
      let content = '';
      try { ({ data, content } = matter.read(file)); } catch { /* indexed as an unreadable course item */ }
      const heading = content.match(/^#\s+(.+)$/m)?.[1];
      return { title: String(data.title || heading || path.basename(file, '.md')).trim(), sourcePath: `/${sourcePath}`, sitePath: sourcePath.replace(/^docs\//, '').replace(/\.md$/, ''), modifiedAt: statSync(file).mtime.toISOString(), chapter: sourcePath.split('/').slice(-2, -1)[0] || '课程内容' };
    })
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath, 'zh-CN'));
}

function categoryDirectories() {
  return fg.sync('docs/categories/*', { cwd: process.cwd(), onlyDirectories: true, absolute: true }).map((absolutePath) => {
    const slug = path.basename(absolutePath);
    const knownNames = {
      'data-structures': '数据结构',
      os: '操作系统',
      network: '计算机网络',
      'computer-architecture': '计算机组成原理',
    };
    const indexPath = path.join(absolutePath, 'index.md');
    let name = knownNames[slug] || slug;
    if (existsSync(indexPath)) {
      const parsed = matter.read(indexPath);
      name = parsed.data.title || (parsed.content.match(/^#\s+(.+)$/m) || [])[1] || slug;
    }
    return { slug, name: String(name).trim(), absolutePath };
  }).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

function safeSegment(value, label) {
  const segment = String(value || '').trim();
  if (!segment || segment === '.' || segment === '..' || /[\\/]/.test(segment) || /[<>:"|?*]/.test(segment)) throw new Error(`${label}包含非法字符`);
  return segment;
}

function safeDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.valueOf())) throw new Error('日期格式无效');
  return { year: String(date.getFullYear()), month: String(date.getMonth() + 1), day: String(date.getDate()), iso: date.toISOString() };
}

function createCategory(body) {
  const name = safeSegment(body.name, '分类名称');
  const slug = safeSegment(body.slug || name.toLowerCase().replace(/\s+/g, '-'), '分类目录');
  const absolutePath = path.resolve(process.cwd(), 'docs/categories', slug);
  if (existsSync(absolutePath)) throw new Error('分类目录已存在');
  mkdirSync(absolutePath, { recursive: true });
  writeFileSync(path.join(absolutePath, 'index.md'), `---\nshowArticleMetadata: false\neditLink: false\nlastUpdated: true\nshowComment: false\n---\n# ${name}\n`, 'utf8');
  return { slug, name, sourcePath: `/docs/categories/${slug}` };
}

function createArticle(body) {
  const slug = safeSegment(body.categorySlug, '分类目录');
  const category = categoryDirectories().find((item) => item.slug === slug);
  if (!category) throw new Error('目标文章分类不存在');
  const title = safeSegment(body.title, '文章标题');
  const date = safeDate(body.date);
  const filename = safeSegment(body.filename || title, '文章文件名').replace(/\.md$/i, '');
  const directory = path.resolve(process.cwd(), 'docs/categories', slug, date.year, date.month, date.day);
  const absolutePath = path.join(directory, `${filename}.md`);
  if (existsSync(absolutePath)) throw new Error('文章文件已存在');
  mkdirSync(directory, { recursive: true });
  const content = `---\ntitle: ${JSON.stringify(title)}\ndate: '${date.year}/${date.month}/${date.day} 12:00'\nisTop: false\ncategories:\n  - ${JSON.stringify(category.name)}\ntags: []\n---\n\n# ${title}\n\n`;
  writeFileSync(absolutePath, content, 'utf8');
  return { title, sourcePath: `/${path.relative(process.cwd(), absolutePath).replaceAll('\\', '/')}`, imageDirectory: `/docs/public/img/${date.year}/${date.month}/${date.day}` };
}

function moveArticle(body) {
  const article = readArticleForWrite(body.sourcePath);
  const sourceRelative = path.relative(process.cwd(), article.absolutePath).replaceAll('\\', '/');
  if (!sourceRelative.startsWith('docs/categories/')) throw new Error('只能移动文章分类目录中的文章');
  const targetSlug = safeSegment(body.targetCategorySlug, '目标分类目录');
  const targetCategory = categoryDirectories().find((item) => item.slug === targetSlug);
  if (!targetCategory) throw new Error('目标文章分类不存在');
  const sourceParts = sourceRelative.split('/');
  const dateParts = sourceParts.slice(3, 6);
  if (dateParts.length !== 3 || dateParts.some((part) => !/^\d+$/.test(part))) throw new Error('文章路径不符合分类/年/月/日结构');
  const targetDirectory = path.resolve(process.cwd(), 'docs/categories', targetSlug, ...dateParts);
  const targetPath = path.join(targetDirectory, path.basename(article.absolutePath));
  if (targetPath === article.absolutePath) throw new Error('文章已经在该分类');
  if (existsSync(targetPath)) throw new Error('目标位置已存在同名文章');
  mkdirSync(targetDirectory, { recursive: true });
  const oldSlug = sourceParts[2];
  const oldCategory = categoryDirectories().find((item) => item.slug === oldSlug);
  const categories = asArray(article.data.categories).filter((item) => item !== oldCategory?.name && item !== oldSlug);
  article.data.categories = [targetCategory.name, ...categories];
  writeFileSync(article.absolutePath, matter.stringify(article.content, article.data), 'utf8');
  renameSync(article.absolutePath, targetPath);
  return { sourcePath: `/${sourceRelative}`, targetPath: `/${path.relative(process.cwd(), targetPath).replaceAll('\\', '/')}` };
}

function createImageDirectory(body) {
  const date = safeDate(body.date);
  const absolutePath = path.resolve(process.cwd(), 'docs/public/img', date.year, date.month, date.day);
  mkdirSync(absolutePath, { recursive: true });
  return { sourcePath: `/docs/public/img/${date.year}/${date.month}/${date.day}`, publicPath: `/img/${date.year}/${date.month}/${date.day}` };
}

async function uploadImage(req) {
  const contentType = String(req.headers['content-type'] || '');
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error('图片上传请求格式无效');
  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const payload = await readRequestBuffer(req);
  const parts = splitMultipart(payload, Buffer.from(`--${boundary}`));
  let dateValueInput = '';
  let fileName = '';
  let fileBuffer = null;
  for (const part of parts) {
    const separator = part.indexOf(Buffer.from('\r\n\r\n'));
    if (separator < 0) continue;
    const headers = part.subarray(0, separator).toString('utf8');
    let value = part.subarray(separator + 4);
    if (value.subarray(-2).toString() === '\r\n') value = value.subarray(0, -2);
    const name = headers.match(/name="([^"]+)"/i)?.[1];
    const filename = headers.match(/filename="([^"]*)"/i)?.[1];
    if (name === 'date') dateValueInput = value.toString('utf8');
    if (name === 'file' && filename) { fileName = filename; fileBuffer = value; }
  }
  if (!fileBuffer?.length) throw new Error('请选择要上传的图片');
  const safeName = safeSegment(fileName, '图片文件名');
  const extension = path.extname(safeName).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(extension)) throw new Error('仅支持 png、jpg、jpeg、gif、webp、svg 图片');
  if (fileBuffer.length > 10 * 1024 * 1024) throw new Error('图片不能超过 10 MB');
  const date = safeDate(dateValueInput);
  const directory = path.resolve(process.cwd(), 'docs/public/img', date.year, date.month, date.day);
  mkdirSync(directory, { recursive: true });
  const target = path.join(directory, safeName);
  if (existsSync(target)) throw new Error('同名图片已存在');
  writeFileSync(target, fileBuffer);
  const publicPath = `/img/${date.year}/${date.month}/${date.day}/${encodeURIComponent(safeName)}`;
  return { sourcePath: `/docs/public/img/${date.year}/${date.month}/${date.day}/${safeName}`, publicPath, markdownPath: `../../../../../public/img/${date.year}/${date.month}/${date.day}/${safeName}` };
}

function readRequestBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => { total += chunk.length; if (total > 12 * 1024 * 1024) reject(new Error('上传内容不能超过 12 MB')); else chunks.push(chunk); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function splitMultipart(buffer, delimiter) {
  const parts = [];
  let start = 0;
  while (true) {
    const index = buffer.indexOf(delimiter, start);
    if (index < 0) break;
    if (index > start) parts.push(buffer.subarray(start, index));
    start = index + delimiter.length;
  }
  return parts;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) reject(new Error('请求内容过大'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('请求数据格式错误')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readArticleForWrite(sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath) throw new Error('文章路径无效');
  const docsRoot = path.resolve(process.cwd(), 'docs');
  const projectPath = sourcePath.replace(/^\/+/, '');
  const absolutePath = path.resolve(process.cwd(), projectPath);
  const relativeToDocs = path.relative(docsRoot, absolutePath);
  const excludedFiles = new Set(['index.md', 'tags.md', 'archives.md', 'me.md']);
  if (!relativeToDocs || relativeToDocs.startsWith('..') || path.isAbsolute(relativeToDocs) || path.extname(absolutePath).toLowerCase() !== '.md' || excludedFiles.has(path.basename(absolutePath)) || isCourseFile(absolutePath) || !existsSync(absolutePath)) {
    throw new Error('只能操作 docs 目录中的文章 Markdown 文件');
  }
  const parsed = matter.read(absolutePath);
  return { absolutePath, content: parsed.content, data: parsed.data };
}

function writeArticle(article) {
  const output = matter.stringify(article.content, article.data);
  const temporaryPath = `${article.absolutePath}.admin-tmp`;
  writeFileSync(temporaryPath, output, 'utf8');
  renameSync(temporaryPath, article.absolutePath);
}

function removeCategoryFromArticles(category) {
  const excludedFiles = new Set(['index.md', 'tags.md', 'archives.md', 'me.md']);
  const changes = [];
  const files = fg.sync('docs/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true });
  for (const file of files) {
    if (excludedFiles.has(path.basename(file)) || isCourseFile(file)) continue;
    const parsed = matter.read(file);
    const categories = asArray(parsed.data.categories);
    if (!categories.includes(category)) continue;
    const nextCategories = categories.filter((item) => item !== category);
    if (nextCategories.length) parsed.data.categories = nextCategories;
    else delete parsed.data.categories;
    changes.push({ absolutePath: file, content: parsed.content, data: parsed.data });
  }
  changes.forEach(writeArticle);
  return changes.length;
}

function invalidateIndex(server) {
  const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
  if (module) server.moduleGraph.invalidateModule(module);
  server.ws.send({ type: 'full-reload' });
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

function dateValue(value) {
  const timestamp = value ? new Date(value).valueOf() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function booleanValue(value) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true';
}

export default defineConfig({
  root: 'admin',
  plugins: [articleIndexPlugin()],
  server: {
    port: 4174,
  },
  build: {
    outDir: '../admin-dist',
    emptyOutDir: true,
  },
});
