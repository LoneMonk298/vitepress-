import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid'
import { metaData } from './config/constants';
import { head } from './config/head';
import { markdown } from './config/markdown';
import { themeConfig } from './config/theme';

export default withMermaid(
  defineConfig({
    lang: metaData.lang,
    title: metaData.title,
    description: metaData.description,

    cleanUrls: true,
    srcExclude: ['templates/**'],
    lastUpdated: true, // 显示最后更新时间

    sitemap: {
      hostname: metaData.site,
    },

    transformHead({ pageData }) {
      const title = pageData.frontmatter.title || pageData.title || metaData.title;
      const description = pageData.frontmatter.description || pageData.description || metaData.description;
      const relativePath = pageData.relativePath.replace(/\\/g, '/');
      const pagePath = relativePath === 'index.md'
        ? '/'
        : relativePath.endsWith('/index.md')
          ? `/${relativePath.slice(0, -'/index.md'.length)}/`
          : `/${relativePath.replace(/\.md$/, '')}`;
      const canonical = `${metaData.site}${encodeURI(pagePath)}`;
      const type = relativePath === 'index.md' || relativePath.endsWith('/index.md') ? 'website' : 'article';

      return [
        ['meta', { name: 'description', content: description }],
        ['link', { rel: 'canonical', href: canonical }],
        ['meta', { property: 'og:type', content: type }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: canonical }],
        ['meta', { property: 'og:site_name', content: metaData.title }],
        ['meta', { property: 'og:image', content: metaData.image }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }],
        ['meta', { name: 'twitter:image', content: metaData.image }],
      ];
    },

    head, // <head>内标签配置
    markdown: markdown, // Markdown配置
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => customElements.includes(tag),
        },
      },
    },
    themeConfig, // 主题配置
  }),
);

const customElements = [
  'mjx-container',
  'mjx-assistive-mml',
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml',
];
