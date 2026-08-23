import fs from 'node:fs';
import path from 'node:path';
import parseFrontmatter from 'gray-matter';
import { categoryDisplayNames, loadContentRegistry, normalizeTag } from './content-registry.mjs';

const excludedFiles = ['index.md', 'tags.md', 'archives.md', 'me.md'];

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
        categoryIds: Array.isArray(data.categories) ? data.categories : data.categories ? [data.categories] : [],
        categories: categoryDisplayNames(registry, data.categories),
        tags: [...new Set((Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []).map((tag) => normalizeTag(registry, tag)).filter(Boolean))],
        path: articleFile.substring(articleFile.lastIndexOf('/docs/') + 6).replace(/\.md$/, ''),
      }
    })
  }
}
