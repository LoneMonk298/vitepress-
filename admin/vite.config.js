import { defineConfig } from 'vite';
import fg from 'fast-glob';
import matter from 'gray-matter';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { findCategory, loadContentRegistry, normalizeTag, saveContentRegistry } from '../content-registry.mjs';

const virtualModuleId = 'virtual:admin-articles';
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

function articleIndexPlugin() {
  return {
    name: 'admin-article-index',
    configureServer(server) {
      // The admin root is separate from docs, so explicitly watch the repository content tree.
      server.watcher.add(path.resolve(process.cwd(), 'docs'));
      server.watcher.add(path.resolve(process.cwd(), 'content.registry.json'));
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
          if (req.url === '/articles/normalize-category') {
            const article = readArticleForWrite(body.sourcePath);
            const relativePath = path.relative(process.cwd(), article.absolutePath).replaceAll('\\', '/');
            const categoryId = relativePath.match(/^docs\/categories\/([^/]+)\//)?.[1];
            const category = findCategory(loadContentRegistry(), categoryId);
            if (!category) throw new Error('文章所在目录没有注册为文章分类');
            article.data.categories = [category.id];
            writeArticle(article);
            invalidateIndex(server);
            return sendJson(res, { ok: true, categories: article.data.categories });
          }
          if (req.url === '/articles/normalize-tags') {
            const registry = loadContentRegistry();
            const article = readArticleForWrite(body.sourcePath);
            article.data.tags = [...new Set(asArray(article.data.tags).map((tag) => normalizeTag(registry, tag)).filter(Boolean))];
            writeArticle(article);
            invalidateIndex(server);
            return sendJson(res, { ok: true, tags: article.data.tags });
          }
          if (req.url === '/articles/category') {
            const registry = loadContentRegistry();
            const category = findCategory(registry, body.category);
            if (!category) throw new Error('文章分类未在 content.registry.json 中注册');
            const article = readArticleForWrite(body.sourcePath);
            article.data.categories = [category.id];
            writeArticle(article);
            invalidateIndex(server);
            return sendJson(res, { ok: true, categories: article.data.categories });
          }
          if (req.url === '/categories/create') {
            const category = createCategory(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, category });
          }
          if (req.url === '/categories/delete-preview') return sendJson(res, { ok: true, preview: previewCategoryDelete(body) });
          if (req.url === '/categories/delete') {
            const deletion = deleteCategory(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, deletion });
          }
          if (req.url === '/articles/create') {
            const article = createArticle(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, article });
          }
          if (req.url === '/articles/delete-preview') return sendJson(res, { ok: true, preview: previewArticleDelete(body) });
          if (req.url === '/articles/delete') {
            const deletion = deleteArticle(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, deletion });
          }
          if (req.url === '/articles/move-preview') {
            const preview = previewArticleMove(body);
            return sendJson(res, { ok: true, preview });
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
          if (req.url === '/assets/delete-preview') return sendJson(res, { ok: true, preview: previewImageDelete(body) });
          if (req.url === '/assets/delete') {
            const deletion = deleteImage(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, deletion });
          }
          if (req.url === '/drafts/create') {
            const draft = createDraft(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, draft });
          }
          if (req.url === '/drafts/status') {
            const draft = updateDraftStatus(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, draft });
          }
          if (req.url === '/drafts/delete-preview') return sendJson(res, { ok: true, preview: previewDraftDelete(body) });
          if (req.url === '/drafts/delete') {
            const deletion = deleteDraft(body);
            invalidateIndex(server);
            return sendJson(res, { ok: true, deletion });
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
      this.addWatchFile(path.resolve(process.cwd(), 'content.registry.json'));
    },
    resolveId(id) {
      return id === virtualModuleId ? resolvedVirtualModuleId : undefined;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return undefined;
      const excludedFiles = new Set(['index.md', 'tags.md', 'archives.md', 'me.md']);
      const registry = loadContentRegistry();
      const files = fg.sync('docs/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true });
      const articles = files
        .filter((file) => !excludedFiles.has(path.basename(file)) && !isCourseFile(file) && !isTemplateFile(file) && !isDraftFile(file))
        .map((file) => {
          const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
          const sitePath = relativePath.replace(/^docs\//, '').replace(/\.md$/, '');
          const categoryMatch = relativePath.match(/^docs\/categories\/([^/]+)\//);
          const directoryCategorySlug = categoryMatch?.[1] || null;
          const directoryCategory = directoryCategorySlug ? registry.categories.find((item) => item.id === directoryCategorySlug) : null;
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
          const resolvedCategories = categories.map((value) => findCategory(registry, value));
          const validCategoryIds = [...new Set(resolvedCategories.filter(Boolean).map((category) => category.id))];
          const courseValues = new Set(registry.courses.flatMap((course) => [course.id, course.name]));
          const unknownCategories = categories.filter((value, index) => !resolvedCategories[index] && !courseValues.has(value));
          const legacyCategories = categories.filter((value, index) => resolvedCategories[index] && value !== resolvedCategories[index].id);
          const normalizedTags = tags.map((tag) => normalizeTag(registry, tag));
          if (!title) issues.push({ code: 'title', label: '缺少标题' });
          if (!date) issues.push({ code: 'date', label: '缺少日期' });
          else if (!dateValue(date)) issues.push({ code: 'date-invalid', label: '日期格式无效' });
          if (!categories.length) issues.push({ code: 'category', label: '未设置分类' });
          if (categories.length > 1) issues.push({ code: 'category-multiple', label: `存在多个分类（${categories.length}）` });
          if (!directoryCategory) issues.push({ code: 'category-directory', label: '文章目录未注册' });
          if (categories.some((category) => courseValues.has(category))) issues.push({ code: 'category-course', label: '课程不能作为文章分类' });
          if (unknownCategories.length) issues.push({ code: 'category-unknown', label: `未注册分类：${unknownCategories.join('、')}` });
          if (legacyCategories.length) issues.push({ code: 'category-id', label: `分类应使用英文 ID：${legacyCategories.map((value) => `${value} → ${findCategory(registry, value)?.id}`).join('、')}` });
          if (directoryCategory && categories.length && !validCategoryIds.includes(directoryCategory.id)) issues.push({ code: 'category-mismatch', label: `分类与目录不一致，应为 ${directoryCategory.id}` });
          if (new Set(normalizedTags).size !== normalizedTags.length) issues.push({ code: 'tag-duplicate', label: '存在重复标签' });
          if (tags.some((tag, index) => tag !== normalizedTags[index])) issues.push({ code: 'tag-format', label: '标签大小写或空格不规范' });
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
      const drafts = draftIndex();
      const images = imageIndex();
      const indexMeta = { indexedAt: new Date().toISOString(), fileCount: articles.length, registryPath: '/content.registry.json' };
      return `export default ${JSON.stringify(articles)}; export const indexMeta = ${JSON.stringify(indexMeta)}; export const categoryDirectories = ${JSON.stringify(directories)}; export const courses = ${JSON.stringify(courses)}; export const drafts = ${JSON.stringify(drafts)}; export const images = ${JSON.stringify(images)}; export const contentRegistry = ${JSON.stringify(registry)};`;
    },
    handleHotUpdate({ file, server }) {
      const normalizedFile = file.replaceAll('\\', '/');
      if (!normalizedFile.includes('/docs/') && !normalizedFile.endsWith('/content.registry.json')) return;
      if (normalizedFile.includes('/docs/') && !normalizedFile.endsWith('.md') && !normalizedFile.includes('/docs/public/')) return;
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

function isDraftFile(file) {
  const relativePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
  return relativePath.startsWith('docs/drafts/');
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

function draftIndex() {
  const excludedFiles = new Set(['README.md']);
  return fg.sync('docs/drafts/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true })
    .filter((file) => !excludedFiles.has(path.basename(file)))
    .map((file) => {
      const sourcePath = path.relative(process.cwd(), file).replaceAll('\\', '/');
      let data = {};
      let content = '';
      try { ({ data, content } = matter.read(file)); } catch { /* surfaced as an unreadable draft */ }
      const heading = content.match(/^#\s+(.+)$/m)?.[1];
      return {
        title: String(data.title || heading || path.basename(file, '.md')).trim(),
        sourcePath: `/${sourcePath}`,
        status: draftStatus(data.status),
        description: String(data.description || '').trim(),
        modifiedAt: statSync(file).mtime.toISOString(),
      };
    })
    .sort((a, b) => dateValue(b.modifiedAt) - dateValue(a.modifiedAt));
}

function imageIndex() {
  const references = markdownImageReferences();
  return fg.sync('docs/public/img/**/*', { cwd: process.cwd(), onlyFiles: true, absolute: true }).map((absolutePath) => {
    const relativeImagePath = path.relative(process.cwd(), absolutePath).replaceAll('\\', '/');
    const sourcePath = `/${relativeImagePath}`;
    const rest = relativeImagePath.replace(/^docs\/public\/img\//, '');
    const publicPath = `/img/${rest}`;
    const extension = path.extname(absolutePath).toLowerCase();
    const imageReferences = references.get(sourcePath) || [];
    return {
      sourcePath,
      publicPath,
      markdownPath: `![图片说明](${publicPath})`,
      relativeMarkdownPath: `../../../../../public/img/${rest}`,
      name: path.basename(absolutePath),
      type: imageType(extension),
      extension: extension.replace(/^\./, ''),
      size: statSync(absolutePath).size,
      referenced: imageReferences.length > 0,
      references: imageReferences,
    };
  }).sort((a, b) => a.sourcePath.localeCompare(b.sourcePath, 'zh-CN'));
}

function markdownImageReferences() {
  const map = new Map();
  const files = fg.sync('docs/**/*.md', { cwd: process.cwd(), onlyFiles: true, absolute: true })
    .filter((file) => !isTemplateFile(file));
  for (const file of files) {
    let parsed;
    try { parsed = matter.read(file); } catch { continue; }
    const sourcePath = `/${path.relative(process.cwd(), file).replaceAll('\\', '/')}`;
    const title = String(parsed.data.title || parsed.content.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md')).trim();
    for (const reference of extractImageReferences(parsed.content)) {
      const imageSourcePath = resolveImageSourcePath(file, reference);
      if (!imageSourcePath) continue;
      if (!map.has(imageSourcePath)) map.set(imageSourcePath, []);
      const entries = map.get(imageSourcePath);
      if (!entries.some((entry) => entry.sourcePath === sourcePath)) entries.push({ title, sourcePath, kind: documentKind(file) });
    }
  }
  return map;
}

function extractImageReferences(content) {
  const references = [];
  for (const match of content.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g)) references.push(match[1]);
  for (const match of content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) references.push(match[1]);
  return references;
}

function resolveImageSourcePath(markdownFile, reference) {
  const value = String(reference || '').trim();
  if (!value || /^(?:https?:|data:|#)/i.test(value)) return null;
  const pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]);
  let absolutePath;
  if (pathname.startsWith('/img/')) absolutePath = path.resolve(process.cwd(), 'docs/public', pathname.slice(1).replaceAll('/', path.sep));
  else if (pathname.startsWith('/docs/public/img/')) absolutePath = path.resolve(process.cwd(), pathname.slice(1).replaceAll('/', path.sep));
  else absolutePath = path.resolve(path.dirname(markdownFile), pathname.replaceAll('/', path.sep));
  const imageRoot = path.resolve(process.cwd(), 'docs/public/img');
  const relative = path.relative(imageRoot, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return `/docs/public/img/${relative.replaceAll('\\', '/')}`;
}

function imageType(extension) {
  if (extension === '.png') return 'PNG';
  if (extension === '.jpg' || extension === '.jpeg') return 'JPEG';
  if (extension === '.webp') return 'WebP';
  if (extension === '.svg') return 'SVG';
  if (extension === '.gif') return 'GIF';
  return extension.replace(/^\./, '').toUpperCase() || '未知';
}

function documentKind(file) {
  if (isDraftFile(file)) return 'draft';
  if (isCourseFile(file)) return 'course';
  return 'article';
}

function categoryDirectories() {
  return loadContentRegistry().categories.map((category) => ({
    slug: category.id,
    name: category.name,
    order: category.order || 0,
    absolutePath: path.resolve(process.cwd(), 'docs/categories', category.id),
  })).filter((category) => existsSync(category.absolutePath)).sort((a, b) => a.order - b.order);
}

function safeSegment(value, label) {
  const segment = String(value || '').trim();
  if (!segment || segment === '.' || segment === '..' || /[\\/]/.test(segment) || /[<>:"|?*]/.test(segment)) throw new Error(`${label}包含非法字符`);
  return segment;
}

function safeText(value, label, maxLength) {
  const text = String(value || '').trim();
  if (!text) throw new Error(`${label}不能为空`);
  if (text.length > maxLength) throw new Error(`${label}不能超过 ${maxLength} 个字符`);
  if (/[\u0000-\u001f]/.test(text)) throw new Error(`${label}不能包含控制字符或换行`);
  return text;
}

function articleFilename(value, title) {
  const source = String(value || title).trim().replace(/\.md$/i, '');
  const filename = source
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\s-]+|[.\s-]+$/g, '')
    .slice(0, 100);
  if (!filename || filename === '.' || filename === '..') throw new Error('无法根据标题生成有效文件名，请手动填写文件名');
  return filename;
}

function articleTags(registry, value) {
  return [...new Set(String(value || '')
    .split(/[,，\n]/)
    .map((tag) => normalizeTag(registry, tag))
    .filter(Boolean))];
}

function draftStatus(value) {
  const status = String(value || 'idea').trim().toLowerCase();
  return ['idea', 'writing', 'paused', 'done'].includes(status) ? status : 'idea';
}

function safeDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.valueOf())) throw new Error('日期格式无效');
  return { year: String(date.getFullYear()), month: String(date.getMonth() + 1), day: String(date.getDate()), iso: date.toISOString() };
}

function createCategory(body) {
  const name = safeSegment(body.name, '分类名称');
  const slug = safeSegment(body.slug || name.toLowerCase().replace(/\s+/g, '-'), '分类目录');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('分类 ID 只能使用小写英文字母、数字和连字符');
  const registry = loadContentRegistry();
  if (findCategory(registry, slug) || findCategory(registry, name)) throw new Error('分类 ID 或中文名称已注册');
  const absolutePath = path.resolve(process.cwd(), 'docs/categories', slug);
  if (existsSync(absolutePath)) throw new Error('分类目录已存在');
  mkdirSync(absolutePath, { recursive: true });
  writeFileSync(path.join(absolutePath, 'index.md'), `---\nshowArticleMetadata: false\neditLink: false\nlastUpdated: true\nshowComment: false\n---\n# ${name}\n`, 'utf8');
  registry.categories.push({ id: slug, name, order: (Math.max(0, ...registry.categories.map((category) => Number(category.order || 0))) + 10) });
  saveContentRegistry(registry);
  return { slug, name, sourcePath: `/docs/categories/${slug}` };
}

function createArticle(body) {
  const slug = safeSegment(body.categorySlug, '分类目录');
  const category = categoryDirectories().find((item) => item.slug === slug);
  if (!category) throw new Error('目标文章分类不存在');
  const registry = loadContentRegistry();
  const title = safeText(body.title, '文章标题', 120);
  const description = String(body.description || '').trim() || `关于“${title}”的内容整理。`;
  if (description.length > 200) throw new Error('文章描述不能超过 200 个字符');
  const date = safeDate(body.date);
  const filename = articleFilename(body.filename, title);
  const tags = articleTags(registry, body.tags);
  const directory = path.resolve(process.cwd(), 'docs/categories', slug, date.year, date.month, date.day);
  const absolutePath = path.join(directory, `${filename}.md`);
  if (existsSync(absolutePath)) throw new Error('文章文件已存在');
  const templatePath = path.resolve(process.cwd(), 'docs/templates/article-template.md');
  if (!existsSync(templatePath)) throw new Error('文章模板 docs/templates/article-template.md 不存在');
  const template = matter(readFileSync(templatePath, 'utf8'));
  template.data.title = title;
  template.data.date = `${date.year}/${date.month}/${date.day} 12:00`;
  template.data.description = description;
  template.data.isTop = false;
  template.data.categories = [category.slug];
  template.data.tags = tags;
  const articleBody = template.content.replace(/^#\s+.*$/m, `# ${title}`);
  mkdirSync(directory, { recursive: true });
  writeFileSync(absolutePath, matter.stringify(articleBody, template.data), 'utf8');
  return {
    title,
    filename: `${filename}.md`,
    sourcePath: `/${path.relative(process.cwd(), absolutePath).replaceAll('\\', '/')}`,
    imageDirectory: `/docs/public/img/${date.year}/${date.month}/${date.day}`,
    templatePath: '/docs/templates/article-template.md',
  };
}

function createDraft(body) {
  const title = safeText(body.title, '草稿标题', 120);
  const date = safeDate(body.date);
  const filename = articleFilename(body.filename, title);
  const directory = path.resolve(process.cwd(), 'docs/drafts', date.year, date.month, date.day);
  const absolutePath = path.join(directory, `${filename}.md`);
  if (existsSync(absolutePath)) throw new Error('同名草稿已经存在');
  mkdirSync(directory, { recursive: true });
  const data = {
    title,
    status: draftStatus(body.status),
    draft: true,
    created: `${date.year}/${date.month}/${date.day}`,
    updated: `${date.year}/${date.month}/${date.day}`,
    description: String(body.description || '').trim(),
    tags: articleTags(loadContentRegistry(), body.tags),
  };
  writeFileSync(absolutePath, matter.stringify(`\n# ${title}\n\n<!-- 在这里记录临时笔记、想法、待办和写作进度。 -->\n`, data), 'utf8');
  return { title, sourcePath: `/${path.relative(process.cwd(), absolutePath).replaceAll('\\', '/')}`, status: data.status };
}

function updateDraftStatus(body) {
  const draft = readDraftForWrite(body.sourcePath);
  draft.data.status = draftStatus(body.status);
  draft.data.updated = new Date().toISOString();
  writeArticle(draft);
  return { sourcePath: body.sourcePath, status: draft.data.status };
}

function readDraftForWrite(sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath) throw new Error('草稿路径无效');
  const draftsRoot = path.resolve(process.cwd(), 'docs/drafts');
  const absolutePath = path.resolve(process.cwd(), sourcePath.replace(/^\/+/, ''));
  const relative = path.relative(draftsRoot, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.extname(absolutePath).toLowerCase() !== '.md' || !existsSync(absolutePath)) throw new Error('只能操作 docs/drafts 中的 Markdown 草稿');
  const parsed = matter.read(absolutePath);
  return { absolutePath, content: parsed.content, data: parsed.data };
}

function previewArticleDelete(body) {
  const article = readArticleForWrite(body.sourcePath);
  const sourcePath = `/${path.relative(process.cwd(), article.absolutePath).replaceAll('\\', '/')}`;
  const references = articleImageReferences(article.absolutePath, article.content);
  return { sourcePath, title: String(article.data.title || path.basename(article.absolutePath, '.md')), kind: 'article', references, willDelete: true };
}

function deleteArticle(body) {
  if (body.confirm !== true) throw new Error('删除文章需要二次确认');
  const article = readArticleForWrite(body.sourcePath);
  const sourcePath = `/${path.relative(process.cwd(), article.absolutePath).replaceAll('\\', '/')}`;
  unlinkSync(article.absolutePath);
  return { sourcePath, title: String(article.data.title || path.basename(article.absolutePath, '.md')) };
}

function previewDraftDelete(body) {
  const draft = readDraftForWrite(body.sourcePath);
  const sourcePath = `/${path.relative(process.cwd(), draft.absolutePath).replaceAll('\\', '/')}`;
  const references = articleImageReferences(draft.absolutePath, draft.content);
  return { sourcePath, title: String(draft.data.title || path.basename(draft.absolutePath, '.md')), kind: 'draft', references, willDelete: true };
}

function articleImageReferences(markdownFile, content) {
  return [...new Set(extractImageReferences(content).map((reference) => resolveImageSourcePath(markdownFile, reference)).filter(Boolean))];
}

function deleteDraft(body) {
  if (body.confirm !== true) throw new Error('删除草稿需要二次确认');
  const draft = readDraftForWrite(body.sourcePath);
  unlinkSync(draft.absolutePath);
  return { sourcePath: body.sourcePath, title: String(draft.data.title || path.basename(draft.absolutePath, '.md')) };
}

function previewCategoryDelete(body) {
  const slug = safeSegment(body.categorySlug || body.category, '文章分类');
  const registry = loadContentRegistry();
  const category = findCategory(registry, slug);
  if (!category) throw new Error('文章分类未注册');
  const directory = path.resolve(process.cwd(), 'docs/categories', category.id);
  if (!existsSync(directory)) throw new Error('文章分类目录不存在');
  const files = fg.sync('**/*', { cwd: directory, onlyFiles: true }).map((file) => `/${path.relative(process.cwd(), path.join(directory, file)).replaceAll('\\', '/')}`);
  return { category: { id: category.id, name: category.name }, directory: `/docs/categories/${category.id}`, fileCount: files.length, files, willDeleteDirectory: true };
}

function deleteCategory(body) {
  if (body.confirm !== true) throw new Error('删除分类需要二次确认');
  const preview = previewCategoryDelete(body);
  const directory = path.resolve(process.cwd(), 'docs/categories', preview.category.id);
  const registry = loadContentRegistry();
  registry.categories = registry.categories.filter((category) => category.id !== preview.category.id);
  const registryPath = path.resolve(process.cwd(), 'content.registry.json');
  const originalRegistry = readFileSync(registryPath);
  const temporaryRegistryPath = `${registryPath}.delete-tmp`;
  writeFileSync(temporaryRegistryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  renameSync(temporaryRegistryPath, registryPath);
  try {
    rmSync(directory, { recursive: true, force: false });
  } catch (error) {
    writeFileSync(registryPath, originalRegistry);
    throw error;
  }
  return { category: preview.category, directory: preview.directory, fileCount: preview.fileCount };
}

function previewImageDelete(body) {
  const image = readImageForWrite(body.sourcePath);
  return { sourcePath: body.sourcePath, name: path.basename(image.absolutePath), size: statSync(image.absolutePath).size, references: image.references, referenced: image.references.length > 0, willDelete: image.references.length === 0 || body.force === true };
}

function deleteImage(body) {
  if (body.confirm !== true) throw new Error('删除图片需要二次确认');
  const image = readImageForWrite(body.sourcePath);
  if (image.references.length && body.force !== true) throw new Error(`图片仍被 ${image.references.length} 篇文档引用，未执行删除`);
  unlinkSync(image.absolutePath);
  return { sourcePath: body.sourcePath, name: path.basename(image.absolutePath), references: image.references };
}

function readImageForWrite(sourcePath) {
  if (typeof sourcePath !== 'string' || !sourcePath) throw new Error('图片路径无效');
  const imageRoot = path.resolve(process.cwd(), 'docs/public/img');
  const absolutePath = path.resolve(process.cwd(), sourcePath.replace(/^\/+/, ''));
  const relative = path.relative(imageRoot, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !existsSync(absolutePath) || !statSync(absolutePath).isFile()) throw new Error('只能操作 docs/public/img 中的图片');
  const references = markdownImageReferences().get(`/${path.relative(process.cwd(), absolutePath).replaceAll('\\', '/')}`) || [];
  return { absolutePath, references };
}

function previewArticleMove(body) {
  const plan = articleMovePlan(body);
  return {
    sourcePath: `/${plan.sourceRelative}`,
    targetPath: `/${plan.targetRelative}`,
    sourceCategory: plan.sourceCategory?.name || plan.sourceCategorySlug,
    targetCategory: plan.targetCategory.name,
    targetCategoryId: plan.targetCategory.slug,
    sourceCategories: asArray(plan.article.data.categories),
    targetCategories: [plan.targetCategory.slug],
    categoryChanged: plan.sourceCategorySlug !== plan.targetCategory.slug,
    imageChanges: plan.imageChanges,
    missingImages: plan.missingImages,
    contentChanged: plan.content !== plan.article.content,
  };
}

function moveArticle(body) {
  const plan = articleMovePlan(body);
  mkdirSync(plan.targetDirectory, { recursive: true });
  plan.article.data.categories = [plan.targetCategory.slug];
  const temporaryTarget = `${plan.targetPath}.admin-tmp`;
  const sourceBackup = `${plan.article.absolutePath}.admin-move-backup`;
  if (existsSync(temporaryTarget) || existsSync(sourceBackup)) throw new Error('检测到未清理的文章移动临时文件，请先检查目录');
  writeFileSync(temporaryTarget, matter.stringify(plan.content, plan.article.data), 'utf8');
  try {
    renameSync(plan.article.absolutePath, sourceBackup);
  } catch (error) {
    unlinkSync(temporaryTarget);
    throw error;
  }
  try {
    renameSync(temporaryTarget, plan.targetPath);
  } catch (error) {
    renameSync(sourceBackup, plan.article.absolutePath);
    if (existsSync(temporaryTarget)) unlinkSync(temporaryTarget);
    throw error;
  }
  let backupPath = null;
  try { unlinkSync(sourceBackup); } catch { backupPath = `/${path.relative(process.cwd(), sourceBackup).replaceAll('\\', '/')}`; }
  return { sourcePath: `/${plan.sourceRelative}`, targetPath: `/${plan.targetRelative}`, imageChanges: plan.imageChanges, missingImages: plan.missingImages, backupPath };
}

function articleMovePlan(body) {
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
  const sourceCategorySlug = sourceParts[2];
  const sourceCategory = loadContentRegistry().categories.find((category) => category.id === sourceCategorySlug);
  const imageResult = rewriteRelativeAssetReferences(article.content, path.dirname(article.absolutePath), targetDirectory);
  const targetRelative = path.relative(process.cwd(), targetPath).replaceAll('\\', '/');
  return { article, sourceRelative, targetRelative, sourceCategorySlug, sourceCategory, targetCategory, targetDirectory, targetPath, content: imageResult.content, imageChanges: imageResult.changes, missingImages: imageResult.missing };
}

function rewriteRelativeAssetReferences(content, sourceDirectory, targetDirectory) {
  const docsRoot = path.resolve(process.cwd(), 'docs');
  const changes = [];
  const missing = [];
  const resolveReference = (reference) => {
    const value = reference.trim();
    if (!value || /^(?:[a-z]+:|\/|#)/i.test(value)) return null;
    const hashIndex = value.search(/[?#]/);
    const pathname = hashIndex < 0 ? value : value.slice(0, hashIndex);
    const suffix = hashIndex < 0 ? '' : value.slice(hashIndex);
    const absolute = path.resolve(sourceDirectory, pathname.replaceAll('/', path.sep));
    if (!absolute.startsWith(`${docsRoot}${path.sep}`) || !existsSync(absolute)) return { reference: value, missing: true };
    const nextPath = path.relative(targetDirectory, absolute).replaceAll('\\', '/');
    const nextReference = `${nextPath}${suffix}`;
    return { reference: value, nextReference, absolute };
  };
  const replace = (input, pattern, prefixIndex, valueIndex, suffixIndex) => input.replace(pattern, (...args) => {
    const reference = args[valueIndex];
    const result = resolveReference(reference);
    if (!result) return args[0];
    if (result.missing) { missing.push(reference); return args[0]; }
    if (result.nextReference !== reference) changes.push({ from: reference, to: result.nextReference });
    return `${args[prefixIndex]}${result.nextReference}${args[suffixIndex]}`;
  });
  let next = replace(content, /(!\[[^\]]*\]\()([^\s)]+)(\))/g, 1, 2, 3);
  next = replace(next, /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, 1, 2, 3);
  return { content: next, changes, missing: [...new Set(missing)] };
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
  let requestedName = '';
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
    if (name === 'name') requestedName = value.toString('utf8');
    if (name === 'file' && filename) { fileName = filename; fileBuffer = value; }
  }
  if (!fileBuffer?.length) throw new Error('请选择要上传的图片');
  const originalExtension = path.extname(fileName).toLowerCase();
  const requestedExtension = path.extname(requestedName).toLowerCase();
  const extension = requestedExtension || originalExtension;
  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(extension)) throw new Error('仅支持 png、jpg、jpeg、gif、webp、svg 图片');
  if (requestedExtension && originalExtension && requestedExtension !== originalExtension && !(requestedExtension === '.jpg' && originalExtension === '.jpeg') && !(requestedExtension === '.jpeg' && originalExtension === '.jpg')) throw new Error('自定义文件名扩展名必须与上传文件类型一致；启用 WebP 优化后请使用 .webp');
  if (fileBuffer.length > 10 * 1024 * 1024) throw new Error('图片不能超过 10 MB');
  const baseName = articleFilename(path.basename(requestedName || fileName, extension), 'image');
  const safeName = `${baseName}${extension === '.jpeg' ? '.jpg' : extension}`;
  const date = safeDate(dateValueInput);
  const directory = path.resolve(process.cwd(), 'docs/public/img', date.year, date.month, date.day);
  mkdirSync(directory, { recursive: true });
  const target = path.join(directory, safeName);
  if (existsSync(target)) throw new Error('同名图片已存在');
  writeFileSync(target, fileBuffer);
  const publicPath = `/img/${date.year}/${date.month}/${date.day}/${safeName}`;
  return { sourcePath: `/docs/public/img/${date.year}/${date.month}/${date.day}/${safeName}`, publicPath, markdownPath: `![图片说明](${publicPath})`, relativeMarkdownPath: `../../../../../public/img/${date.year}/${date.month}/${date.day}/${safeName}`, name: safeName };
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

function invalidateIndex(server) {
  const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
  if (module) server.moduleGraph.invalidateModule(module);
  server.ws.send({ type: 'full-reload' });
}

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return value ? [String(value).trim()].filter(Boolean) : [];
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
  envDir: '..',
  plugins: [articleIndexPlugin()],
  server: {
    port: 4174,
  },
  build: {
    outDir: '../admin-dist',
    emptyOutDir: true,
  },
});
