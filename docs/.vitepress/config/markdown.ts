import type { MarkdownOptions } from 'vitepress';
import mathjax3 from 'markdown-it-mathjax3';
import footnote from 'markdown-it-footnote';

export const markdown: MarkdownOptions = {
  // Shiki主题, 所有主题参见: https://github.com/shikijs/shiki/blob/main/docs/themes.md
  theme: {
    light: 'github-light',
    dark: 'github-dark'
  },
  // lineNumbers: true, // 启用行号

  config: (md) => {
    // 使用 markdown-it-mathjax3，并传入 MathJax 配置
    // options.enableMenu = false：彻底禁用公式旁边的「菜单/调整位置」按钮和右键菜单
    md.use(mathjax3, {
      MathJax: {
        options: {
          enableMenu: false,     // 禁用 MathJax 上下文菜单（那个可点击调整位置的按钮）
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
        },
        svg: {
          fontCache: 'global',
        },
        chtml: {
          fontCache: 'global',
        },
        startup: {
          typeset: true,
        },
      },
    });
    md.use(footnote);

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    }
  },
};
