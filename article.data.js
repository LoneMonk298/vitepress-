import fs from 'node:fs';
import path from 'node:path';
import parseFrontmatter from 'gray-matter';
import { categoryDisplayNames, loadContentRegistry, normalizeTag } from './content-registry.mjs';

const excludedFiles = ['index.md', 'tags.md', 'archives.md', 'me.md'];

// 将 'YYYY/M/D HH:mm[:ss]' 等宽松格式规范化为 'YYYY-MM-DDTHH:mm:ss'。
// Safari/WebKit 等浏览器无法解析斜杠分隔的单位数日期，规范化后所有浏览器均可解析，且字典序即时间序。
function normalizeDate(raw) {
  if (raw == null) return undefined;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? undefined : raw.toISOString();
  const s = String(raw).trim();
  const m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
  if (m) {
    const pad = (n) => String(Number(n)).padStart(2, '0');
    return `${m[1]}-${pad(m[2])}-${pad(m[3])}T${pad(m[4] ?? 0)}:${pad(m[5] ?? 0)}:${pad(m[6] ?? 0)}`;
  }
  return isNaN(new Date(s).getTime()) ? undefined : s;
}

export default {
  watch: ['./docs/**/*.md'],
  load(watchedFiles) {
    const registry = loadContentRegistry();
    // 排除不必要文件
    const articleFiles = watchedFiles.filter(file => {
      const filename = path.basename(file);
      const normalizedPath = file.replaceAll('\\', '/');
      return !excludedFiles.includes(filename) && !normalizedPath.includes('/docs/courses/') && !normalizedPath.includes('/docs/templates/') && !normalizedPath.includes('/docs/drafts/');
    });
    // 解析文章 Frontmatter
    return articleFiles.map(articleFile => {
      const articleContent = fs.readFileSync(articleFile, 'utf-8');
      const { data } = parseFrontmatter(articleContent);
      return {
        ...data,
        date: normalizeDate(data.date),
        categoryIds: Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : [],
        categories: categoryDisplayNames(registry, data.categories),
        tags: [...new Set((Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []).map((tag) => normalizeTag(registry, tag)).filter(Boolean))],
        path: articleFile.substring(articleFile.lastIndexOf('/docs/') + 6).replace(/\.md$/, ''),
      }
    })
  }
}
