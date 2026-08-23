import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import fg from 'fast-glob';
import matter from 'gray-matter';
import { loadEnv } from 'vite';

const projectRoot = process.cwd();
const docsRoot = path.join(projectRoot, 'docs');
const outputPath = path.join(docsRoot, 'public', 'rss.xml');
const env = loadEnv(process.env.NODE_ENV || 'production', projectRoot, '');
const siteUrl = (env.VITEPRESS_SITE_URL || 'https://www.lonemonk.xyz').replace(/\/$/, '');
const siteTitle = '陌僧人的知识库';
const siteDescription = '个人技术知识库，记录 & 分享个人碎片化、结构化、体系化的技术知识内容。';

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function articleUrl(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/').replace(/\.md$/, '');
  return `${siteUrl}/${encodeURI(normalized)}`;
}

function plainText(markdown) {
  return markdown
    .replace(/<!-- more -->[\s\S]*$/i, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^:::\s*\w+.*$/gm, '')
    .replace(/[>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function descriptionFor(data, content) {
  if (data.description) return String(data.description).trim();
  const text = plainText(content);
  return text.slice(0, 160) || siteDescription;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value).replaceAll('/', '-'));
  return Number.isNaN(date.getTime()) ? null : date;
}

const files = await fg('categories/**/*.md', {
  cwd: docsRoot,
  onlyFiles: true,
  ignore: ['**/index.md'],
});

const articles = await Promise.all(files.map(async (relativePath) => {
  const source = await fs.readFile(path.join(docsRoot, relativePath), 'utf8');
  const { data, content } = matter(source);
  const fileStats = await fs.stat(path.join(docsRoot, relativePath));
  const publishedAt = toDate(data.date) || fileStats.mtime;

  return {
    title: data.title || path.basename(relativePath, '.md'),
    description: descriptionFor(data, content),
    url: articleUrl(relativePath),
    publishedAt,
  };
}));

articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

const items = articles.map((article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <guid isPermaLink="true">${escapeXml(article.url)}</guid>
      <pubDate>${article.publishedAt.toUTCString()}</pubDate>
      <description>${escapeXml(article.description)}</description>
    </item>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, xml, 'utf8');
console.log(`Generated RSS with ${articles.length} articles: ${path.relative(projectRoot, outputPath)}`);
