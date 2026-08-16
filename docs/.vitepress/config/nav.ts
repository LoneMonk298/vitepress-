import type { DefaultTheme } from 'vitepress';

export const nav: DefaultTheme.Config['nav'] = [
  {
    text: '文章分类',
    items: [
      { text: '数据结构', link: '/categories/data-structures/index', activeMatch: '/categories/data-structures/' },
      { text: '操作系统', link: '/categories/os/index', activeMatch: '/categories/os/' },
      { text: '计算机网络', link: '/categories/network/index', activeMatch: '/categories/network/' },
      { text: '计算机组成原理', link: '/categories/computer-architecture/index', activeMatch: '/categories/computer-architecture/' },
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
