import type { DefaultTheme } from 'vitepress';
import fg from 'fast-glob';
import matter from 'gray-matter';

function getCategoryNavItems(): DefaultTheme.NavItem[] {
  return fg.sync('docs/categories/*/index.md', { cwd: process.cwd(), onlyFiles: true })
    .map((file) => {
      const slug = file.replaceAll('\\', '/').split('/')[2];
      const parsed = matter.read(file);
      const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1];
      const knownNames: Record<string, string> = { 'data-structures': '数据结构', os: '操作系统', network: '计算机网络', 'computer-architecture': '计算机组成原理' };
      const name = String(parsed.data.title || heading || knownNames[slug] || slug).trim();
      return { text: name, link: `/categories/${slug}/index`, activeMatch: `/categories/${slug}/` };
    })
    .sort((a, b) => String(a.text).localeCompare(String(b.text), 'zh-CN'));
}

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: '文章分类',
    items: [
      ...getCategoryNavItems(),
    ],
    activeMatch: '/categories/'
  },
  {
    text: '课程尝试',
    items: [
      { text: '课程1', link: '/courses/course1/index', activeMatch: '/courses/course1/' },
    ],
    activeMatch: '/courses/'
  },
  {
    text: '文章标签',
    link: '/tags',
    activeMatch: '/tags'
  },
  {
    text: '文章归档',
    link: '/archives',
    activeMatch: '/archives'
  },
];
