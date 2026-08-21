// docs/.vitepress/config.ts
import { defineConfig } from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/vitepress@1.6.3_@algolia+cl_434ce3fbd3e3851e249d1971b90b689c/node_modules/vitepress/dist/node/index.js";
import { withMermaid } from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/vitepress-plugin-mermaid@2._64917c4063d39489c39fd43b1126ebbd/node_modules/vitepress-plugin-mermaid/dist/vitepress-plugin-mermaid.es.mjs";

// docs/.vitepress/config/constants.ts
var site = "https://blog.charles7c.top";
var metaData = {
  lang: "zh-CN",
  locale: "zh_CN",
  title: "\u67E5\u5C14\u65AF\u7684\u77E5\u8BC6\u5E93",
  description: "\u4E2A\u4EBA\u6280\u672F\u77E5\u8BC6\u5E93\uFF0C\u8BB0\u5F55 & \u5206\u4EAB\u4E2A\u4EBA\u788E\u7247\u5316\u3001\u7ED3\u6784\u5316\u3001\u4F53\u7CFB\u5316\u7684\u6280\u672F\u77E5\u8BC6\u5185\u5BB9\u3002",
  site,
  image: `${site}/logo.jpg`
};

// docs/.vitepress/config/head.ts
var head = [
  ["link", { rel: "icon", href: "/favicon.ico" }],
  ["meta", { name: "author", content: "Charles7c" }],
  ["meta", { name: "keywords", content: "\u67E5\u5C14\u65AF\u7684\u77E5\u8BC6\u5E93, \u77E5\u8BC6\u5E93, \u535A\u5BA2, Charles7c" }],
  ["meta", { name: "HandheldFriendly", content: "True" }],
  ["meta", { name: "MobileOptimized", content: "320" }],
  ["meta", { name: "theme-color", content: "#3c8772" }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:locale", content: metaData.locale }],
  ["meta", { property: "og:title", content: metaData.title }],
  ["meta", { property: "og:description", content: metaData.description }],
  ["meta", { property: "og:site", content: metaData.site }],
  ["meta", { property: "og:site_name", content: metaData.title }],
  ["meta", { property: "og:image", content: metaData.image }],
  // 百度统计代码：https://tongji.baidu.com
  ["script", {}, `var _hmt = _hmt || [];
  (function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?53af4b1a12fbe40810ca7ad39f8db9c7";
    var s = document.getElementsByTagName("script")[0]; 
    s.parentNode.insertBefore(hm, s);
  })();`]
  // 页面访问量统计
  // ['script', {}, `
  // window.addEventListener('load', function() {
  //   let oldHref = document.location.href, bodyDOM = document.querySelector('body');
  //   const observer = new MutationObserver(function(mutations) {
  //     if (oldHref != document.location.href) {
  //       oldHref = document.location.href;
  //       getPv()
  //       window.requestAnimationFrame(function() {
  //         let tmp = document.querySelector('body');
  //         if(tmp != bodyDOM) {
  //           bodyDOM = tmp;
  //           observer.observe(bodyDOM, config);
  //         }
  //       })
  //     }
  //   });
  //   const config = {
  //     childList: true,
  //     subtree: true
  //   };
  //   observer.observe(bodyDOM, config);
  //   getPv()
  // }, true);
  // function getPv() {
  //   xhr = new XMLHttpRequest();
  //   xhr.open('GET', 'https://api.charles7c.top/blog/pv?pageUrl=' + location.href);
  //   xhr.send();
  // }`]
];

// docs/.vitepress/config/markdown.ts
import mathjax3 from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/markdown-it-mathjax3@4.3.2/node_modules/markdown-it-mathjax3/index.js";
import footnote from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/markdown-it-footnote@3.0.3/node_modules/markdown-it-footnote/index.js";
var markdown = {
  // Shiki主题, 所有主题参见: https://github.com/shikijs/shiki/blob/main/docs/themes.md
  theme: {
    light: "github-light",
    dark: "github-dark"
  },
  // lineNumbers: true, // 启用行号
  config: (md) => {
    md.use(mathjax3, {
      MathJax: {
        options: {
          enableMenu: false,
          // 禁用 MathJax 上下文菜单（那个可点击调整位置的按钮）
          ignoreHtmlClass: "tex2jax_ignore",
          processHtmlClass: "tex2jax_process"
        },
        tex: {
          inlineMath: [["$", "$"], ["\\(", "\\)"]],
          displayMath: [["$$", "$$"], ["\\[", "\\]"]],
          processEscapes: true,
          processEnvironments: true
        },
        svg: {
          fontCache: "global"
        },
        chtml: {
          fontCache: "global"
        },
        startup: {
          typeset: true
        }
      }
    });
    md.use(footnote);
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === "h1") htmlResult += `
<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    };
  }
};

// docs/.vitepress/config/nav.ts
var nav = [
  {
    text: "\u6587\u7AE0\u5206\u7C7B",
    items: [
      { text: "\u6570\u636E\u7ED3\u6784", link: "/categories/data-structures/index", activeMatch: "/categories/data-structures/" },
      { text: "\u64CD\u4F5C\u7CFB\u7EDF", link: "/categories/os/index", activeMatch: "/categories/os/" },
      { text: "\u8BA1\u7B97\u673A\u7F51\u7EDC", link: "/categories/network/index", activeMatch: "/categories/network/" },
      { text: "\u8BA1\u7B97\u673A\u7EC4\u6210\u539F\u7406", link: "/categories/computer-architecture/index", activeMatch: "/categories/computer-architecture/" }
    ],
    activeMatch: "/categories/"
  },
  {
    text: "\u8BFE\u7A0B\u5C1D\u8BD5",
    items: [
      { text: "\u8BFE\u7A0B1", link: "/courses/course1/index", activeMatch: "/courses/course1/" }
    ],
    activeMatch: "/courses/"
  },
  {
    text: "\u6587\u7AE0\u6807\u7B7E",
    link: "/tags",
    activeMatch: "/tags"
  },
  {
    text: "\u6587\u7AE0\u5F52\u6863",
    link: "/archives",
    activeMatch: "/archives"
  }
];

// docs/.vitepress/config/sidebar.ts
import fg from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/fast-glob@3.3.2/node_modules/fast-glob/out/index.js";
import matter from "file:///D:/Repositories/vitepress-/node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js";

// docs/.vitepress/theme/utils.ts
function getChineseZodiac(year) {
  const arr = ["monkey", "rooster", "dog", "pig", "rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat"];
  return arr[year % 12];
}
function getChineseZodiacAlias(year) {
  const arr = ["\u7334\u5E74", "\u9E21\u5E74", "\u72D7\u5E74", "\u732A\u5E74", "\u9F20\u5E74", "\u725B\u5E74", "\u864E\u5E74", "\u5154\u5E74", "\u9F99\u5E74", "\u86C7\u5E74", "\u9A6C\u5E74", "\u7F8A\u5E74"];
  return arr[year % 12];
}

// docs/.vitepress/config/sidebar.ts
var sync = fg.sync;
var sidebar = {
  "/categories/data-structures/": getItemsByDate("categories/data-structures"),
  "/categories/os/": getItemsByDate("categories/os"),
  "/categories/network/": getItemsByDate("categories/network"),
  "/categories/computer-architecture/": getItemsByDate("categories/computer-architecture"),
  "/courses/course1/": getItems("courses/course1")
};
function getItemsByDate(path) {
  let yearGroups = [];
  let topArticleItems = [];
  sync(`docs/${path}/*`, {
    onlyDirectories: true,
    objectMode: true
  }).forEach(({ name }) => {
    let year = name;
    let articleItems = [];
    sync(`docs/${path}/${year}/*`, {
      onlyDirectories: true,
      objectMode: true
    }).forEach(({ name: name2 }) => {
      let month = name2;
      sync(`docs/${path}/${year}/${month}/*`, {
        onlyDirectories: true,
        objectMode: true
      }).forEach(({ name: name3 }) => {
        let day = name3;
        sync(`docs/${path}/${year}/${month}/${day}/*`, {
          onlyFiles: true,
          objectMode: true
        }).forEach((article) => {
          const articleFile = matter.read(`${article.path}`);
          const { data } = articleFile;
          if (data.isTop) {
            topArticleItems.unshift({
              text: data.title,
              link: `/${path}/${year}/${month}/${day}/${article.name.replace(".md", "")}`
            });
          }
          articleItems.unshift({
            text: data.title,
            link: `/${path}/${year}/${month}/${day}/${article.name.replace(".md", "")}`
          });
        });
      });
    });
    yearGroups.unshift({
      text: `<img class="chinese-zodiac" style="position: static; vertical-align: middle; padding-bottom: 3px;" src="/img/svg/chinese-zodiac/${getChineseZodiac(year.replace("\u5E74", ""))}.svg" title="${getChineseZodiacAlias(year.replace("\u5E74", ""))}" alt="\u751F\u8096">
            ${year}\u5E74 (${articleItems.length}\u7BC7)`,
      items: articleItems,
      collapsed: true
    });
  });
  if (topArticleItems.length > 0) {
    yearGroups.unshift({
      text: `<svg style="display: inline-block; vertical-align: middle; padding-bottom: 3px;" viewBox="0 0 1920 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="30" height="30"><path d="M367.488 667.904h423.744v47.232H367.488v-47.232zM320.256 204.352h137.28v68.992h-137.28v-68.992zM367.488 754.112h423.744v48H367.488v-48zM693.76 204.352h137.984v68.992H693.76v-68.992zM507.008 204.352h137.28v68.992h-137.28v-68.992z" p-id="10749" fill="#d81e06"></path><path d="M1792.512 0H127.488C57.472 0 0 57.152 0 127.616v768.768C0 966.72 57.088 1024 127.488 1024h1665.088c69.952 0 127.424-57.152 127.424-127.616V127.616C1920 57.216 1862.912 0 1792.512 0z m-528 175.104h446.976v54.016H1494.72l-24 101.248h206.976V689.6h-57.728V384.32h-289.472v308.224h-57.728v-362.24h140.224l20.992-101.248h-169.472v-53.952z m-996.032-11.2h614.272v167.232h-51.008v-17.28H320.256v17.28H268.48V163.904z m678.784 681.728h-744v-43.52h111.744V454.848h229.504v-48.704H221.248v-42.048h323.264v-39.744h54.016v39.744h331.52v41.984h-331.52v48.768h245.248v347.264h103.488v43.52z m203.264-94.528c0 59.52-30.72 89.28-92.224 89.28-25.472 0-46.016-0.512-61.504-1.472-2.496-22.976-6.528-45.248-12.032-66.752 22.976 5.504 46.72 8.256 71.232 8.256 24 0 35.968-11.52 35.968-34.496V247.872H971.2v-54.72h278.976v54.72H1150.4v503.232z m521.216 121.536c-67.008-55.488-137.28-108.032-210.752-157.504-4.992 9.984-10.496 19.008-16.512 27.008-41.472 57.024-113.28 101.504-215.232 133.504-9.472-16.512-21.504-34.496-35.968-54.016 94.528-27.008 161.28-64.512 200.256-112.512 34.496-44.992 51.776-113.024 51.776-204.032V421.12h57.728v82.496c0 62.528-6.72 115.776-20.224 159.744 84.48 54.016 161.472 107.008 230.976 158.976l-42.048 50.304z" p-id="10750" fill="#d81e06"></path><path d="M367.488 495.36h423.744v47.232H367.488V495.36zM367.488 581.632h423.744v47.232H367.488v-47.232z" p-id="10751" fill="#d81e06"></path></svg>
            \u6211\u7684\u7F6E\u9876 (${topArticleItems.length}\u7BC7)`,
      items: topArticleItems,
      collapsed: false
    });
    yearGroups[1].collapsed = false;
  } else {
    yearGroups[0].collapsed = false;
  }
  addOrderNumber(yearGroups);
  return yearGroups;
}
function getItems(path) {
  let groups = [];
  let items = [];
  let total = 0;
  const groupCollapsedSize = 2;
  const titleCollapsedSize = 20;
  sync(`docs/${path}/*`, {
    onlyDirectories: true,
    objectMode: true
  }).forEach(({ name }) => {
    let groupName = name;
    sync(`docs/${path}/${groupName}/*`, {
      onlyFiles: true,
      objectMode: true
    }).forEach((article) => {
      const articleFile = matter.read(`${article.path}`);
      const { data } = articleFile;
      items.push({
        text: data.title,
        link: `/${path}/${groupName}/${article.name.replace(".md", "")}`
      });
      total += 1;
    });
    groups.push({
      text: `${groupName.substring(groupName.indexOf("-") + 1)} (${items.length}\u7BC7)`,
      items,
      collapsed: items.length < groupCollapsedSize || total > titleCollapsedSize
    });
    items = [];
  });
  addOrderNumber(groups);
  return groups;
}
function addOrderNumber(groups) {
  for (let i = 0; i < groups.length; i++) {
    for (let j = 0; j < groups[i].items.length; j++) {
      const items = groups[i].items;
      const index = j + 1;
      let indexStyle = `<div class="text-color-gray mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      if (index == 1) {
        indexStyle = `<div class="text-color-red mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      } else if (index == 2) {
        indexStyle = `<div class="text-color-orange mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      } else if (index == 3) {
        indexStyle = `<div class="text-color-yellow mr-[6px]" style="font-weight: 550; display: inline-block;">${index}</div>`;
      }
      items[j].text = `${indexStyle}${items[j].text}`;
    }
  }
}

// docs/.vitepress/config/search/algolia-search.ts
var algoliaSearchOptions = {
  appId: "DBZ0G9HBUY",
  apiKey: "00cef480a543003d05d9808110ea5f65",
  indexName: "charles7c",
  locales: {
    root: {
      placeholder: "\u641C\u7D22\u6587\u6863",
      translations: {
        button: {
          buttonText: "\u641C\u7D22\u6587\u6863",
          buttonAriaLabel: "\u641C\u7D22\u6587\u6863"
        },
        modal: {
          searchBox: {
            resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
            resetButtonAriaLabel: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
            cancelButtonText: "\u53D6\u6D88",
            cancelButtonAriaLabel: "\u53D6\u6D88"
          },
          startScreen: {
            recentSearchesTitle: "\u641C\u7D22\u5386\u53F2",
            noRecentSearchesText: "\u6CA1\u6709\u641C\u7D22\u5386\u53F2",
            saveRecentSearchButtonTitle: "\u4FDD\u5B58\u81F3\u641C\u7D22\u5386\u53F2",
            removeRecentSearchButtonTitle: "\u4ECE\u641C\u7D22\u5386\u53F2\u4E2D\u79FB\u9664",
            favoriteSearchesTitle: "\u6536\u85CF",
            removeFavoriteSearchButtonTitle: "\u4ECE\u6536\u85CF\u4E2D\u79FB\u9664"
          },
          errorScreen: {
            titleText: "\u65E0\u6CD5\u83B7\u53D6\u7ED3\u679C",
            helpText: "\u4F60\u53EF\u80FD\u9700\u8981\u68C0\u67E5\u4F60\u7684\u7F51\u7EDC\u8FDE\u63A5"
          },
          footer: {
            selectText: "\u9009\u62E9",
            navigateText: "\u5207\u6362",
            closeText: "\u5173\u95ED",
            searchByText: "\u641C\u7D22\u63D0\u4F9B\u8005"
          },
          noResultsScreen: {
            noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
            suggestedQueryText: "\u4F60\u53EF\u4EE5\u5C1D\u8BD5\u67E5\u8BE2",
            reportMissingResultsText: "\u4F60\u8BA4\u4E3A\u8BE5\u67E5\u8BE2\u5E94\u8BE5\u6709\u7ED3\u679C\uFF1F",
            reportMissingResultsLinkText: "\u70B9\u51FB\u53CD\u9988"
          }
        }
      }
    }
  }
};

// docs/.vitepress/config/theme.ts
var themeConfig = {
  nav,
  // 导航栏配置
  sidebar,
  // 侧边栏配置
  logo: "/logo.png",
  outline: {
    level: "deep",
    // 右侧大纲标题层级
    label: "\u76EE\u5F55"
    // 右侧大纲标题文本配置
  },
  darkModeSwitchLabel: "\u5207\u6362\u65E5\u5149/\u6697\u9ED1\u6A21\u5F0F",
  sidebarMenuLabel: "\u6587\u7AE0",
  returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8",
  lastUpdated: {
    text: "\u6700\u540E\u66F4\u65B0",
    formatOptions: {
      dateStyle: "full",
      timeStyle: "short"
    }
  },
  // 文档页脚文本配置
  docFooter: {
    prev: "\u4E0A\u4E00\u7BC7",
    next: "\u4E0B\u4E00\u7BC7"
  },
  // 编辑链接配置
  editLink: {
    pattern: "https://github.com/Charles7c/charles7c.github.io/edit/main/docs/:path",
    text: "\u4E0D\u59A5\u4E4B\u5904\uFF0C\u656C\u8BF7\u96C5\u6B63"
  },
  // 搜索配置（二选一）
  search: {
    provider: "algolia",
    options: algoliaSearchOptions
    // 本地离线搜索
    // provider: 'local',
    // options: localSearchOptions
  },
  // 导航栏右侧社交链接配置
  socialLinks: [
    { icon: "github", link: "https://github.com/Charles7c/charles7c.github.io" },
    {
      icon: {
        svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>\u7801\u4E91</title><path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z"/></svg>'
      },
      link: "https://gitee.com/Charles7c/charles7c"
    },
    {
      icon: {
        svg: `<svg width="33" height="33" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 174.8 204">
                <title>ContiNew Admin</title>
                <path fill="#307AF2" d="M86.7,0l88,51v.2l-16.3,9.4v-.2L86.7,18.9Zm71.8,143.5,16.3,9.4v.2L86.8,204h0l-16.3-9.4,16.3-9.4h0l71.7-41.5v-.2Z"/>
                <path fill="#12D2AC" d="M16.3,143.5v.2L58,167.8l-16.3,9.4L0,153.1v-.2Z"/>
                <path fill="#12D2AC" d="M104.1,93,15.9,143.8l-.2-.1V124.9l.2.1L87.7,83.6,104.1,93Z"/>
                <path fill="#0057FE" d="M88.1,0,.1,51v.2l16.3,9.4v-.2L88.1,18.9Z"/>
                <path fill="#307AF2" d="M.1,50.9.2,152.6l.2.1,16.3-9.4-.2-.1-.1-82.9L.1,50.9Z"/>
                <path fill="#0057FE" d="M174.7,50.9l-.1,101.7-.2.1-16.3-9.4.2-.1.1-82.9Z"/>
                <path fill="#12D2AC" d="M41.7,158.5l16.1,9.4,100.6-58.7V90.4Z"/>
              </svg>`
      },
      link: "https://continew.top/"
    }
  ],
  // 自定义扩展: 文章元数据配置
  // @ts-ignore
  articleMetadataConfig: {
    author: "\u67E5\u5C14\u65AF",
    // 文章全局默认作者名称
    authorLink: "https://charles7c.top",
    // 点击作者名时默认跳转的链接
    showViewCount: false
    // 是否显示文章阅读数, 需要在 docs/.vitepress/theme/api/config.js 及 interface.js 配置好相应 API 接口
  },
  // 自定义扩展: 文章版权配置
  copyrightConfig: {
    license: "\u7F72\u540D-\u76F8\u540C\u65B9\u5F0F\u5171\u4EAB 4.0 \u56FD\u9645 (CC BY-SA 4.0)",
    licenseLink: "http://creativecommons.org/licenses/by-sa/4.0/"
  },
  // 自定义扩展: 评论配置
  commentConfig: {
    type: "gitalk",
    showComment: true
    // 是否显示评论
  },
  // 自定义扩展: 页脚配置
  footerConfig: {
    showFooter: true,
    // 是否显示页脚
    icpRecordCode: "\u6D25ICP\u5907xxxx-1",
    // ICP备案号
    publicSecurityRecordCode: "\u6D25\u516C\u7F51\u5B89\u5907xxxx\u53F7",
    // 联网备案号
    copyright: `Copyright \xA9 2019-${(/* @__PURE__ */ new Date()).getFullYear()} Charles7c`
    // 版权信息
  }
};

// docs/.vitepress/config.ts
var config_default = withMermaid(
  defineConfig({
    lang: metaData.lang,
    title: metaData.title,
    description: metaData.description,
    cleanUrls: true,
    lastUpdated: true,
    // 显示最后更新时间
    head,
    // <head>内标签配置
    markdown,
    // Markdown配置
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => customElements.includes(tag)
        }
      }
    },
    themeConfig
    // 主题配置
  })
);
var customElements = [
  "mjx-container",
  "mjx-assistive-mml",
  "math",
  "maction",
  "maligngroup",
  "malignmark",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mi",
  "mlongdiv",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mscarries",
  "mscarry",
  "mscarries",
  "msgroup",
  "mstack",
  "mlongdiv",
  "msline",
  "mstack",
  "mspace",
  "msqrt",
  "msrow",
  "mstack",
  "mstack",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
  "math",
  "mi",
  "mn",
  "mo",
  "ms",
  "mspace",
  "mtext",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "msqrt",
  "mstyle",
  "mmultiscripts",
  "mover",
  "mprescripts",
  "msub",
  "msubsup",
  "msup",
  "munder",
  "munderover",
  "none",
  "maligngroup",
  "malignmark",
  "mtable",
  "mtd",
  "mtr",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "msrow",
  "mstack",
  "maction",
  "semantics",
  "annotation",
  "annotation-xml"
];
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udml0ZXByZXNzL2NvbmZpZy50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL2NvbnN0YW50cy50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL2hlYWQudHMiLCAiZG9jcy8udml0ZXByZXNzL2NvbmZpZy9tYXJrZG93bi50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL25hdi50cyIsICJkb2NzLy52aXRlcHJlc3MvY29uZmlnL3NpZGViYXIudHMiLCAiZG9jcy8udml0ZXByZXNzL3RoZW1lL3V0aWxzLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvc2VhcmNoL2FsZ29saWEtc2VhcmNoLnRzIiwgImRvY3MvLnZpdGVwcmVzcy9jb25maWcvdGhlbWUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1JlcG9zaXRvcmllcy92aXRlcHJlc3MtL2RvY3MvLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHsgd2l0aE1lcm1haWQgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLW1lcm1haWQnXG5pbXBvcnQgeyBtZXRhRGF0YSB9IGZyb20gJy4vY29uZmlnL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBoZWFkIH0gZnJvbSAnLi9jb25maWcvaGVhZCc7XG5pbXBvcnQgeyBtYXJrZG93biB9IGZyb20gJy4vY29uZmlnL21hcmtkb3duJztcbmltcG9ydCB7IHRoZW1lQ29uZmlnIH0gZnJvbSAnLi9jb25maWcvdGhlbWUnO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoTWVybWFpZChcbiAgZGVmaW5lQ29uZmlnKHtcbiAgICBsYW5nOiBtZXRhRGF0YS5sYW5nLFxuICAgIHRpdGxlOiBtZXRhRGF0YS50aXRsZSxcbiAgICBkZXNjcmlwdGlvbjogbWV0YURhdGEuZGVzY3JpcHRpb24sXG5cbiAgICBjbGVhblVybHM6IHRydWUsXG4gICAgbGFzdFVwZGF0ZWQ6IHRydWUsIC8vIFx1NjYzRVx1NzkzQVx1NjcwMFx1NTQwRVx1NjZGNFx1NjVCMFx1NjVGNlx1OTVGNFxuXG4gICAgaGVhZCwgLy8gPGhlYWQ+XHU1MTg1XHU2ODA3XHU3QjdFXHU5MTREXHU3RjZFXG4gICAgbWFya2Rvd246IG1hcmtkb3duLCAvLyBNYXJrZG93blx1OTE0RFx1N0Y2RVxuICAgIHZ1ZToge1xuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgaXNDdXN0b21FbGVtZW50OiAodGFnKSA9PiBjdXN0b21FbGVtZW50cy5pbmNsdWRlcyh0YWcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHRoZW1lQ29uZmlnLCAvLyBcdTRFM0JcdTk4OThcdTkxNERcdTdGNkVcbiAgfSksXG4pO1xuXG5jb25zdCBjdXN0b21FbGVtZW50cyA9IFtcbiAgJ21qeC1jb250YWluZXInLFxuICAnbWp4LWFzc2lzdGl2ZS1tbWwnLFxuICAnbWF0aCcsXG4gICdtYWN0aW9uJyxcbiAgJ21hbGlnbmdyb3VwJyxcbiAgJ21hbGlnbm1hcmsnLFxuICAnbWVuY2xvc2UnLFxuICAnbWVycm9yJyxcbiAgJ21mZW5jZWQnLFxuICAnbWZyYWMnLFxuICAnbWknLFxuICAnbWxvbmdkaXYnLFxuICAnbW11bHRpc2NyaXB0cycsXG4gICdtbicsXG4gICdtbycsXG4gICdtb3ZlcicsXG4gICdtcGFkZGVkJyxcbiAgJ21waGFudG9tJyxcbiAgJ21yb290JyxcbiAgJ21yb3cnLFxuICAnbXMnLFxuICAnbXNjYXJyaWVzJyxcbiAgJ21zY2FycnknLFxuICAnbXNjYXJyaWVzJyxcbiAgJ21zZ3JvdXAnLFxuICAnbXN0YWNrJyxcbiAgJ21sb25nZGl2JyxcbiAgJ21zbGluZScsXG4gICdtc3RhY2snLFxuICAnbXNwYWNlJyxcbiAgJ21zcXJ0JyxcbiAgJ21zcm93JyxcbiAgJ21zdGFjaycsXG4gICdtc3RhY2snLFxuICAnbXN0eWxlJyxcbiAgJ21zdWInLFxuICAnbXN1cCcsXG4gICdtc3Vic3VwJyxcbiAgJ210YWJsZScsXG4gICdtdGQnLFxuICAnbXRleHQnLFxuICAnbXRyJyxcbiAgJ211bmRlcicsXG4gICdtdW5kZXJvdmVyJyxcbiAgJ3NlbWFudGljcycsXG4gICdtYXRoJyxcbiAgJ21pJyxcbiAgJ21uJyxcbiAgJ21vJyxcbiAgJ21zJyxcbiAgJ21zcGFjZScsXG4gICdtdGV4dCcsXG4gICdtZW5jbG9zZScsXG4gICdtZXJyb3InLFxuICAnbWZlbmNlZCcsXG4gICdtZnJhYycsXG4gICdtcGFkZGVkJyxcbiAgJ21waGFudG9tJyxcbiAgJ21yb290JyxcbiAgJ21yb3cnLFxuICAnbXNxcnQnLFxuICAnbXN0eWxlJyxcbiAgJ21tdWx0aXNjcmlwdHMnLFxuICAnbW92ZXInLFxuICAnbXByZXNjcmlwdHMnLFxuICAnbXN1YicsXG4gICdtc3Vic3VwJyxcbiAgJ21zdXAnLFxuICAnbXVuZGVyJyxcbiAgJ211bmRlcm92ZXInLFxuICAnbm9uZScsXG4gICdtYWxpZ25ncm91cCcsXG4gICdtYWxpZ25tYXJrJyxcbiAgJ210YWJsZScsXG4gICdtdGQnLFxuICAnbXRyJyxcbiAgJ21sb25nZGl2JyxcbiAgJ21zY2FycmllcycsXG4gICdtc2NhcnJ5JyxcbiAgJ21zZ3JvdXAnLFxuICAnbXNsaW5lJyxcbiAgJ21zcm93JyxcbiAgJ21zdGFjaycsXG4gICdtYWN0aW9uJyxcbiAgJ3NlbWFudGljcycsXG4gICdhbm5vdGF0aW9uJyxcbiAgJ2Fubm90YXRpb24teG1sJyxcbl07IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXFxcXGNvbnN0YW50cy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUmVwb3NpdG9yaWVzL3ZpdGVwcmVzcy0vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9jb25zdGFudHMudHNcIjtjb25zdCBzaXRlID0gJ2h0dHBzOi8vYmxvZy5jaGFybGVzN2MudG9wJztcblxuZXhwb3J0IGNvbnN0IG1ldGFEYXRhID0ge1xuICBsYW5nOiAnemgtQ04nLFxuICBsb2NhbGU6ICd6aF9DTicsXG4gIHRpdGxlOiAnXHU2N0U1XHU1QzE0XHU2NUFGXHU3Njg0XHU3N0U1XHU4QkM2XHU1RTkzJyxcbiAgZGVzY3JpcHRpb246ICdcdTRFMkFcdTRFQkFcdTYyODBcdTY3MkZcdTc3RTVcdThCQzZcdTVFOTNcdUZGMENcdThCQjBcdTVGNTUgJiBcdTUyMDZcdTRFQUJcdTRFMkFcdTRFQkFcdTc4OEVcdTcyNDdcdTUzMTZcdTMwMDFcdTdFRDNcdTY3ODRcdTUzMTZcdTMwMDFcdTRGNTNcdTdDRkJcdTUzMTZcdTc2ODRcdTYyODBcdTY3MkZcdTc3RTVcdThCQzZcdTUxODVcdTVCQjlcdTMwMDInLFxuICBzaXRlLFxuICBpbWFnZTogYCR7c2l0ZX0vbG9nby5qcGdgLFxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcaGVhZC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUmVwb3NpdG9yaWVzL3ZpdGVwcmVzcy0vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9oZWFkLnRzXCI7aW1wb3J0IHR5cGUgeyBIZWFkQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcbmltcG9ydCB7IG1ldGFEYXRhIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgY29uc3QgaGVhZDogSGVhZENvbmZpZ1tdID0gW1xuICBbJ2xpbmsnLCB7IHJlbDogJ2ljb24nLCBocmVmOiAnL2Zhdmljb24uaWNvJyB9XSxcbiAgWydtZXRhJywgeyBuYW1lOiAnYXV0aG9yJywgY29udGVudDogJ0NoYXJsZXM3YycgfV0sXG4gIFsnbWV0YScsIHsgbmFtZTogJ2tleXdvcmRzJywgY29udGVudDogJ1x1NjdFNVx1NUMxNFx1NjVBRlx1NzY4NFx1NzdFNVx1OEJDNlx1NUU5MywgXHU3N0U1XHU4QkM2XHU1RTkzLCBcdTUzNUFcdTVCQTIsIENoYXJsZXM3YycgfV0sXG5cbiAgWydtZXRhJywgeyBuYW1lOiAnSGFuZGhlbGRGcmllbmRseScsIGNvbnRlbnQ6ICdUcnVlJyB9XSxcbiAgWydtZXRhJywgeyBuYW1lOiAnTW9iaWxlT3B0aW1pemVkJywgY29udGVudDogJzMyMCcgfV0sXG4gIFsnbWV0YScsIHsgbmFtZTogJ3RoZW1lLWNvbG9yJywgY29udGVudDogJyMzYzg3NzInIH1dLFxuXG4gIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0eXBlJywgY29udGVudDogJ3dlYnNpdGUnIH1dLFxuICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6bG9jYWxlJywgY29udGVudDogbWV0YURhdGEubG9jYWxlIH1dLFxuICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dGl0bGUnLCBjb250ZW50OiBtZXRhRGF0YS50aXRsZSB9XSxcbiAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmRlc2NyaXB0aW9uJywgY29udGVudDogbWV0YURhdGEuZGVzY3JpcHRpb24gfV0sXG4gIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzpzaXRlJywgY29udGVudDogbWV0YURhdGEuc2l0ZSB9XSxcbiAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnNpdGVfbmFtZScsIGNvbnRlbnQ6IG1ldGFEYXRhLnRpdGxlIH1dLFxuICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2UnLCBjb250ZW50OiBtZXRhRGF0YS5pbWFnZSB9XSxcblxuICAvLyBcdTc2N0VcdTVFQTZcdTdFREZcdThCQTFcdTRFRTNcdTc4MDFcdUZGMUFodHRwczovL3RvbmdqaS5iYWlkdS5jb21cbiAgWydzY3JpcHQnLCB7fSwgYHZhciBfaG10ID0gX2htdCB8fCBbXTtcbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBobSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgaG0uc3JjID0gXCJodHRwczovL2htLmJhaWR1LmNvbS9obS5qcz81M2FmNGIxYTEyZmJlNDA4MTBjYTdhZDM5ZjhkYjljN1wiO1xuICAgIHZhciBzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIilbMF07IFxuICAgIHMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaG0sIHMpO1xuICB9KSgpO2BdLFxuICAvLyBcdTk4NzVcdTk3NjJcdThCQkZcdTk1RUVcdTkxQ0ZcdTdFREZcdThCQTFcbiAgLy8gWydzY3JpcHQnLCB7fSwgYFxuICAvLyB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAvLyAgIGxldCBvbGRIcmVmID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgYm9keURPTSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbiAgLy8gICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAvLyAgICAgaWYgKG9sZEhyZWYgIT0gZG9jdW1lbnQubG9jYXRpb24uaHJlZikge1xuICAvLyAgICAgICBvbGRIcmVmID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZjtcbiAgLy8gICAgICAgZ2V0UHYoKVxuICAvLyAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAvLyAgICAgICAgIGxldCB0bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gIC8vICAgICAgICAgaWYodG1wICE9IGJvZHlET00pIHtcbiAgLy8gICAgICAgICAgIGJvZHlET00gPSB0bXA7XG4gIC8vICAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGJvZHlET00sIGNvbmZpZyk7XG4gIC8vICAgICAgICAgfVxuICAvLyAgICAgICB9KVxuICAvLyAgICAgfVxuICAvLyAgIH0pO1xuICAvLyAgIGNvbnN0IGNvbmZpZyA9IHtcbiAgLy8gICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgLy8gICAgIHN1YnRyZWU6IHRydWVcbiAgLy8gICB9O1xuICAvLyAgIG9ic2VydmVyLm9ic2VydmUoYm9keURPTSwgY29uZmlnKTtcbiAgLy8gICBnZXRQdigpXG4gIC8vIH0sIHRydWUpO1xuXG4gIC8vIGZ1bmN0aW9uIGdldFB2KCkge1xuICAvLyAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAvLyAgIHhoci5vcGVuKCdHRVQnLCAnaHR0cHM6Ly9hcGkuY2hhcmxlczdjLnRvcC9ibG9nL3B2P3BhZ2VVcmw9JyArIGxvY2F0aW9uLmhyZWYpO1xuICAvLyAgIHhoci5zZW5kKCk7XG4gIC8vIH1gXVxuXTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcbWFya2Rvd24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1JlcG9zaXRvcmllcy92aXRlcHJlc3MtL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvbWFya2Rvd24udHNcIjtpbXBvcnQgdHlwZSB7IE1hcmtkb3duT3B0aW9ucyB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5pbXBvcnQgbWF0aGpheDMgZnJvbSAnbWFya2Rvd24taXQtbWF0aGpheDMnO1xuaW1wb3J0IGZvb3Rub3RlIGZyb20gJ21hcmtkb3duLWl0LWZvb3Rub3RlJztcblxuZXhwb3J0IGNvbnN0IG1hcmtkb3duOiBNYXJrZG93bk9wdGlvbnMgPSB7XG4gIC8vIFNoaWtpXHU0RTNCXHU5ODk4LCBcdTYyNDBcdTY3MDlcdTRFM0JcdTk4OThcdTUzQzJcdTg5QzE6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaGlraWpzL3NoaWtpL2Jsb2IvbWFpbi9kb2NzL3RoZW1lcy5tZFxuICB0aGVtZToge1xuICAgIGxpZ2h0OiAnZ2l0aHViLWxpZ2h0JyxcbiAgICBkYXJrOiAnZ2l0aHViLWRhcmsnXG4gIH0sXG4gIC8vIGxpbmVOdW1iZXJzOiB0cnVlLCAvLyBcdTU0MkZcdTc1MjhcdTg4NENcdTUzRjdcblxuICBjb25maWc6IChtZCkgPT4ge1xuICAgIC8vIFx1NEY3Rlx1NzUyOCBtYXJrZG93bi1pdC1tYXRoamF4M1x1RkYwQ1x1NUU3Nlx1NEYyMFx1NTE2NSBNYXRoSmF4IFx1OTE0RFx1N0Y2RVxuICAgIC8vIG9wdGlvbnMuZW5hYmxlTWVudSA9IGZhbHNlXHVGRjFBXHU1RjdCXHU1RTk1XHU3OTgxXHU3NTI4XHU1MTZDXHU1RjBGXHU2NUMxXHU4RkI5XHU3Njg0XHUzMDBDXHU4M0RDXHU1MzU1L1x1OEMwM1x1NjU3NFx1NEY0RFx1N0Y2RVx1MzAwRFx1NjMwOVx1OTRBRVx1NTQ4Q1x1NTNGM1x1OTUyRVx1ODNEQ1x1NTM1NVxuICAgIG1kLnVzZShtYXRoamF4Mywge1xuICAgICAgTWF0aEpheDoge1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgZW5hYmxlTWVudTogZmFsc2UsICAgICAvLyBcdTc5ODFcdTc1MjggTWF0aEpheCBcdTRFMEFcdTRFMEJcdTY1ODdcdTgzRENcdTUzNTVcdUZGMDhcdTkwQTNcdTRFMkFcdTUzRUZcdTcwQjlcdTUxRkJcdThDMDNcdTY1NzRcdTRGNERcdTdGNkVcdTc2ODRcdTYzMDlcdTk0QUVcdUZGMDlcbiAgICAgICAgICBpZ25vcmVIdG1sQ2xhc3M6ICd0ZXgyamF4X2lnbm9yZScsXG4gICAgICAgICAgcHJvY2Vzc0h0bWxDbGFzczogJ3RleDJqYXhfcHJvY2VzcycsXG4gICAgICAgIH0sXG4gICAgICAgIHRleDoge1xuICAgICAgICAgIGlubGluZU1hdGg6IFtbJyQnLCAnJCddLCBbJ1xcXFwoJywgJ1xcXFwpJ11dLFxuICAgICAgICAgIGRpc3BsYXlNYXRoOiBbWyckJCcsICckJCddLCBbJ1xcXFxbJywgJ1xcXFxdJ11dLFxuICAgICAgICAgIHByb2Nlc3NFc2NhcGVzOiB0cnVlLFxuICAgICAgICAgIHByb2Nlc3NFbnZpcm9ubWVudHM6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN2Zzoge1xuICAgICAgICAgIGZvbnRDYWNoZTogJ2dsb2JhbCcsXG4gICAgICAgIH0sXG4gICAgICAgIGNodG1sOiB7XG4gICAgICAgICAgZm9udENhY2hlOiAnZ2xvYmFsJyxcbiAgICAgICAgfSxcbiAgICAgICAgc3RhcnR1cDoge1xuICAgICAgICAgIHR5cGVzZXQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICAgIG1kLnVzZShmb290bm90ZSk7XG5cbiAgICAvLyBcdTU3MjhcdTYyNDBcdTY3MDlcdTY1ODdcdTY4NjNcdTc2ODQ8aDE+XHU2ODA3XHU3QjdFXHU1NDBFXHU2REZCXHU1MkEwPEFydGljbGVNZXRhZGF0YS8+XHU3RUM0XHU0RUY2XG4gICAgbWQucmVuZGVyZXIucnVsZXMuaGVhZGluZ19jbG9zZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzbGYpID0+IHtcbiAgICAgIGxldCBodG1sUmVzdWx0ID0gc2xmLnJlbmRlclRva2VuKHRva2VucywgaWR4LCBvcHRpb25zKTtcbiAgICAgIGlmICh0b2tlbnNbaWR4XS50YWcgPT09ICdoMScpIGh0bWxSZXN1bHQgKz0gYFxcbjxDbGllbnRPbmx5PjxBcnRpY2xlTWV0YWRhdGEgdi1pZj1cIigkZnJvbnRtYXR0ZXI/LmFzaWRlID8/IHRydWUpICYmICgkZnJvbnRtYXR0ZXI/LnNob3dBcnRpY2xlTWV0YWRhdGEgPz8gdHJ1ZSlcIiA6YXJ0aWNsZT1cIiRmcm9udG1hdHRlclwiIC8+PC9DbGllbnRPbmx5PmA7XG4gICAgICByZXR1cm4gaHRtbFJlc3VsdDtcbiAgICB9XG4gIH0sXG59O1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxSZXBvc2l0b3JpZXNcXFxcdml0ZXByZXNzLVxcXFxkb2NzXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnXFxcXG5hdi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUmVwb3NpdG9yaWVzL3ZpdGVwcmVzcy0vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9uYXYudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmV4cG9ydCBjb25zdCBuYXY6IERlZmF1bHRUaGVtZS5Db25maWdbJ25hdiddID0gW1xuICB7XG4gICAgdGV4dDogJ1x1NjU4N1x1N0FFMFx1NTIwNlx1N0M3QicsXG4gICAgaXRlbXM6IFtcbiAgICAgIHsgdGV4dDogJ1x1NjU3MFx1NjM2RVx1N0VEM1x1Njc4NCcsIGxpbms6ICcvY2F0ZWdvcmllcy9kYXRhLXN0cnVjdHVyZXMvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzL2RhdGEtc3RydWN0dXJlcy8nIH0sXG4gICAgICB7IHRleHQ6ICdcdTY0Q0RcdTRGNUNcdTdDRkJcdTdFREYnLCBsaW5rOiAnL2NhdGVnb3JpZXMvb3MvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzL29zLycgfSxcbiAgICAgIHsgdGV4dDogJ1x1OEJBMVx1N0I5N1x1NjczQVx1N0Y1MVx1N0VEQycsIGxpbms6ICcvY2F0ZWdvcmllcy9uZXR3b3JrL2luZGV4JywgYWN0aXZlTWF0Y2g6ICcvY2F0ZWdvcmllcy9uZXR3b3JrLycgfSxcbiAgICAgIHsgdGV4dDogJ1x1OEJBMVx1N0I5N1x1NjczQVx1N0VDNFx1NjIxMFx1NTM5Rlx1NzQwNicsIGxpbms6ICcvY2F0ZWdvcmllcy9jb21wdXRlci1hcmNoaXRlY3R1cmUvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzL2NvbXB1dGVyLWFyY2hpdGVjdHVyZS8nIH0sXG4gICAgXSxcbiAgICBhY3RpdmVNYXRjaDogJy9jYXRlZ29yaWVzLydcbiAgfSxcbiAge1xuICAgIHRleHQ6ICdcdThCRkVcdTdBMEJcdTVDMURcdThCRDUnLFxuICAgIGl0ZW1zOiBbXG4gICAgICB7IHRleHQ6ICdcdThCRkVcdTdBMEIxJywgbGluazogJy9jb3Vyc2VzL2NvdXJzZTEvaW5kZXgnLCBhY3RpdmVNYXRjaDogJy9jb3Vyc2VzL2NvdXJzZTEvJyB9LFxuICAgIF0sXG4gICAgYWN0aXZlTWF0Y2g6ICcvY291cnNlcy8nXG4gIH0sXG4gIHtcbiAgICB0ZXh0OiAnXHU2NTg3XHU3QUUwXHU2ODA3XHU3QjdFJyxcbiAgICBsaW5rOiAnL3RhZ3MnLFxuICAgIGFjdGl2ZU1hdGNoOiAnL3RhZ3MnXG4gIH0sXG4gIHtcbiAgICB0ZXh0OiAnXHU2NTg3XHU3QUUwXHU1RjUyXHU2ODYzJyxcbiAgICBsaW5rOiAnL2FyY2hpdmVzJyxcbiAgICBhY3RpdmVNYXRjaDogJy9hcmNoaXZlcydcbiAgfSxcbl07XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcc2lkZWJhci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUmVwb3NpdG9yaWVzL3ZpdGVwcmVzcy0vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9zaWRlYmFyLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IGZnIGZyb20gJ2Zhc3QtZ2xvYic7XG5pbXBvcnQgbWF0dGVyIGZyb20gJ2dyYXktbWF0dGVyJztcbmltcG9ydCB7IGdldENoaW5lc2Vab2RpYWMsIGdldENoaW5lc2Vab2RpYWNBbGlhcyB9IGZyb20gJy4uL3RoZW1lL3V0aWxzLnRzJztcbmNvbnN0IHN5bmMgPSBmZy5zeW5jO1xuXG5leHBvcnQgY29uc3Qgc2lkZWJhcjogRGVmYXVsdFRoZW1lLkNvbmZpZ1snc2lkZWJhciddID0ge1xuICAnL2NhdGVnb3JpZXMvZGF0YS1zdHJ1Y3R1cmVzLyc6IGdldEl0ZW1zQnlEYXRlKFwiY2F0ZWdvcmllcy9kYXRhLXN0cnVjdHVyZXNcIiksXG4gICcvY2F0ZWdvcmllcy9vcy8nOiBnZXRJdGVtc0J5RGF0ZShcImNhdGVnb3JpZXMvb3NcIiksXG4gICcvY2F0ZWdvcmllcy9uZXR3b3JrLyc6IGdldEl0ZW1zQnlEYXRlKFwiY2F0ZWdvcmllcy9uZXR3b3JrXCIpLFxuICAnL2NhdGVnb3JpZXMvY29tcHV0ZXItYXJjaGl0ZWN0dXJlLyc6IGdldEl0ZW1zQnlEYXRlKFwiY2F0ZWdvcmllcy9jb21wdXRlci1hcmNoaXRlY3R1cmVcIiksXG5cbiAgJy9jb3Vyc2VzL2NvdXJzZTEvJzogZ2V0SXRlbXMoXCJjb3Vyc2VzL2NvdXJzZTFcIiksXG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFIFx1NjdEMFx1NTIwNlx1N0M3Qi9ZWVlZL01NL2RkL3h4eC5tZCBcdTc2ODRcdTc2RUVcdTVGNTVcdTY4M0NcdTVGMEYsIFx1ODNCN1x1NTNENlx1NEZBN1x1OEZCOVx1NjgwRlx1NTIwNlx1N0VDNFx1NTNDQVx1NTIwNlx1N0VDNFx1NEUwQlx1NjgwN1x1OTg5OFxuICpcbiAqIC9jYXRlZ29yaWVzL2lzc3Vlcy8yMDIyLzA3LzIwL3h4eC5tZFxuICpcbiAqIEBwYXJhbSBwYXRoIFx1NjI2Qlx1NjNDRlx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFxuICogQHJldHVybnMge0RlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdfVxuICovXG5mdW5jdGlvbiBnZXRJdGVtc0J5RGF0ZSAocGF0aDogc3RyaW5nKSB7XG4gIC8vIFx1NEZBN1x1OEZCOVx1NjgwRlx1NUU3NFx1NEVGRFx1NTIwNlx1N0VDNFx1NjU3MFx1N0VDNFxuICBsZXQgeWVhckdyb3VwczogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10gPSBbXTtcbiAgLy8gXHU3RjZFXHU5ODc2XHU2NTcwXHU3RUM0XG4gIGxldCB0b3BBcnRpY2xlSXRlbXM6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdID0gW107XG5cbiAgLy8gMS5cdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdTVFNzRcdTRFRkRcdTc2RUVcdTVGNTVcbiAgc3luYyhgZG9jcy8ke3BhdGh9LypgLCB7XG4gICAgb25seURpcmVjdG9yaWVzOiB0cnVlLFxuICAgIG9iamVjdE1vZGU6IHRydWUsXG4gIH0pLmZvckVhY2goKHsgbmFtZSB9KSA9PiB7XG4gICAgbGV0IHllYXIgPSBuYW1lO1xuICAgIC8vIFx1NUU3NFx1NEVGRFx1NjU3MFx1N0VDNFxuICAgIGxldCBhcnRpY2xlSXRlbXM6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdID0gW107XG5cbiAgICAvLyAyLlx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NjcwOFx1NEVGRFx1NzZFRVx1NUY1NVxuICAgIHN5bmMoYGRvY3MvJHtwYXRofS8ke3llYXJ9LypgLCB7XG4gICAgICBvbmx5RGlyZWN0b3JpZXM6IHRydWUsXG4gICAgICBvYmplY3RNb2RlOiB0cnVlLFxuICAgIH0pLmZvckVhY2goKHsgbmFtZSB9KSA9PiB7XG4gICAgICBsZXQgbW9udGggPSBuYW1lXG5cbiAgICAgIC8vIDMuXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU2NUU1XHU2NzFGXHU3NkVFXHU1RjU1XG4gICAgICBzeW5jKGBkb2NzLyR7cGF0aH0vJHt5ZWFyfS8ke21vbnRofS8qYCwge1xuICAgICAgICBvbmx5RGlyZWN0b3JpZXM6IHRydWUsXG4gICAgICAgIG9iamVjdE1vZGU6IHRydWUsXG4gICAgICB9KS5mb3JFYWNoKCh7IG5hbWUgfSkgPT4ge1xuICAgICAgICBsZXQgZGF5ID0gbmFtZTtcbiAgICAgICAgLy8gNC5cdTgzQjdcdTUzRDZcdTY1RTVcdTY3MUZcdTc2RUVcdTVGNTVcdTRFMEJcdTc2ODRcdTYyNDBcdTY3MDlcdTY1ODdcdTdBRTBcbiAgICAgICAgc3luYyhgZG9jcy8ke3BhdGh9LyR7eWVhcn0vJHttb250aH0vJHtkYXl9LypgLCB7XG4gICAgICAgICAgb25seUZpbGVzOiB0cnVlLFxuICAgICAgICAgIG9iamVjdE1vZGU6IHRydWUsXG4gICAgICAgIH0pLmZvckVhY2goKGFydGljbGUpID0+IHtcbiAgICAgICAgICBjb25zdCBhcnRpY2xlRmlsZSA9IG1hdHRlci5yZWFkKGAke2FydGljbGUucGF0aH1gKTtcbiAgICAgICAgICBjb25zdCB7IGRhdGEgfSA9IGFydGljbGVGaWxlO1xuICAgICAgICAgIGlmIChkYXRhLmlzVG9wKSB7XG4gICAgICAgICAgICAvLyBcdTU0MTFcdTdGNkVcdTk4NzZcdTUyMDZcdTdFQzRcdTUyNERcdThGRkRcdTUyQTBcdTY4MDdcdTk4OThcbiAgICAgICAgICAgIHRvcEFydGljbGVJdGVtcy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgdGV4dDogZGF0YS50aXRsZSxcbiAgICAgICAgICAgICAgbGluazogYC8ke3BhdGh9LyR7eWVhcn0vJHttb250aH0vJHtkYXl9LyR7YXJ0aWNsZS5uYW1lLnJlcGxhY2UoJy5tZCcsICcnKX1gLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gXHU1NDExXHU1RTc0XHU0RUZEXHU1MjA2XHU3RUM0XHU1MjREXHU4RkZEXHU1MkEwXHU2ODA3XHU5ODk4XG4gICAgICAgICAgYXJ0aWNsZUl0ZW1zLnVuc2hpZnQoe1xuICAgICAgICAgICAgdGV4dDogZGF0YS50aXRsZSxcbiAgICAgICAgICAgIGxpbms6IGAvJHtwYXRofS8ke3llYXJ9LyR7bW9udGh9LyR7ZGF5fS8ke2FydGljbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyl9YCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vIFx1NkRGQlx1NTJBMFx1NUU3NFx1NEVGRFx1NTIwNlx1N0VDNFxuICAgIHllYXJHcm91cHMudW5zaGlmdCh7XG4gICAgICB0ZXh0OiBgPGltZyBjbGFzcz1cImNoaW5lc2Utem9kaWFjXCIgc3R5bGU9XCJwb3NpdGlvbjogc3RhdGljOyB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlOyBwYWRkaW5nLWJvdHRvbTogM3B4O1wiIHNyYz1cIi9pbWcvc3ZnL2NoaW5lc2Utem9kaWFjLyR7Z2V0Q2hpbmVzZVpvZGlhYyh5ZWFyLnJlcGxhY2UoJ1x1NUU3NCcsICcnKSl9LnN2Z1wiIHRpdGxlPVwiJHtnZXRDaGluZXNlWm9kaWFjQWxpYXMoeWVhci5yZXBsYWNlKCdcdTVFNzQnLCAnJykpfVwiIGFsdD1cIlx1NzUxRlx1ODA5NlwiPlxuICAgICAgICAgICAgJHt5ZWFyfVx1NUU3NCAoJHthcnRpY2xlSXRlbXMubGVuZ3RofVx1N0JDNylgLFxuICAgICAgaXRlbXM6IGFydGljbGVJdGVtcyxcbiAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICB9KTtcbiAgfSlcblxuICBpZiAodG9wQXJ0aWNsZUl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAvLyBcdTZERkJcdTUyQTBcdTdGNkVcdTk4NzZcdTUyMDZcdTdFQzRcbiAgICB5ZWFyR3JvdXBzLnVuc2hpZnQoe1xuICAgICAgdGV4dDogYDxzdmcgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IHBhZGRpbmctYm90dG9tOiAzcHg7XCIgdmlld0JveD1cIjAgMCAxOTIwIDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMzBcIiBoZWlnaHQ9XCIzMFwiPjxwYXRoIGQ9XCJNMzY3LjQ4OCA2NjcuOTA0aDQyMy43NDR2NDcuMjMySDM2Ny40ODh2LTQ3LjIzMnpNMzIwLjI1NiAyMDQuMzUyaDEzNy4yOHY2OC45OTJoLTEzNy4yOHYtNjguOTkyek0zNjcuNDg4IDc1NC4xMTJoNDIzLjc0NHY0OEgzNjcuNDg4di00OHpNNjkzLjc2IDIwNC4zNTJoMTM3Ljk4NHY2OC45OTJINjkzLjc2di02OC45OTJ6TTUwNy4wMDggMjA0LjM1MmgxMzcuMjh2NjguOTkyaC0xMzcuMjh2LTY4Ljk5MnpcIiBwLWlkPVwiMTA3NDlcIiBmaWxsPVwiI2Q4MWUwNlwiPjwvcGF0aD48cGF0aCBkPVwiTTE3OTIuNTEyIDBIMTI3LjQ4OEM1Ny40NzIgMCAwIDU3LjE1MiAwIDEyNy42MTZ2NzY4Ljc2OEMwIDk2Ni43MiA1Ny4wODggMTAyNCAxMjcuNDg4IDEwMjRoMTY2NS4wODhjNjkuOTUyIDAgMTI3LjQyNC01Ny4xNTIgMTI3LjQyNC0xMjcuNjE2VjEyNy42MTZDMTkyMCA1Ny4yMTYgMTg2Mi45MTIgMCAxNzkyLjUxMiAweiBtLTUyOCAxNzUuMTA0aDQ0Ni45NzZ2NTQuMDE2SDE0OTQuNzJsLTI0IDEwMS4yNDhoMjA2Ljk3NlY2ODkuNmgtNTcuNzI4VjM4NC4zMmgtMjg5LjQ3MnYzMDguMjI0aC01Ny43Mjh2LTM2Mi4yNGgxNDAuMjI0bDIwLjk5Mi0xMDEuMjQ4aC0xNjkuNDcydi01My45NTJ6IG0tOTk2LjAzMi0xMS4yaDYxNC4yNzJ2MTY3LjIzMmgtNTEuMDA4di0xNy4yOEgzMjAuMjU2djE3LjI4SDI2OC40OFYxNjMuOTA0eiBtNjc4Ljc4NCA2ODEuNzI4aC03NDR2LTQzLjUyaDExMS43NDRWNDU0Ljg0OGgyMjkuNTA0di00OC43MDRIMjIxLjI0OHYtNDIuMDQ4aDMyMy4yNjR2LTM5Ljc0NGg1NC4wMTZ2MzkuNzQ0aDMzMS41MnY0MS45ODRoLTMzMS41MnY0OC43NjhoMjQ1LjI0OHYzNDcuMjY0aDEwMy40ODh2NDMuNTJ6IG0yMDMuMjY0LTk0LjUyOGMwIDU5LjUyLTMwLjcyIDg5LjI4LTkyLjIyNCA4OS4yOC0yNS40NzIgMC00Ni4wMTYtMC41MTItNjEuNTA0LTEuNDcyLTIuNDk2LTIyLjk3Ni02LjUyOC00NS4yNDgtMTIuMDMyLTY2Ljc1MiAyMi45NzYgNS41MDQgNDYuNzIgOC4yNTYgNzEuMjMyIDguMjU2IDI0IDAgMzUuOTY4LTExLjUyIDM1Ljk2OC0zNC40OTZWMjQ3Ljg3Mkg5NzEuMnYtNTQuNzJoMjc4Ljk3NnY1NC43MkgxMTUwLjR2NTAzLjIzMnogbTUyMS4yMTYgMTIxLjUzNmMtNjcuMDA4LTU1LjQ4OC0xMzcuMjgtMTA4LjAzMi0yMTAuNzUyLTE1Ny41MDQtNC45OTIgOS45ODQtMTAuNDk2IDE5LjAwOC0xNi41MTIgMjcuMDA4LTQxLjQ3MiA1Ny4wMjQtMTEzLjI4IDEwMS41MDQtMjE1LjIzMiAxMzMuNTA0LTkuNDcyLTE2LjUxMi0yMS41MDQtMzQuNDk2LTM1Ljk2OC01NC4wMTYgOTQuNTI4LTI3LjAwOCAxNjEuMjgtNjQuNTEyIDIwMC4yNTYtMTEyLjUxMiAzNC40OTYtNDQuOTkyIDUxLjc3Ni0xMTMuMDI0IDUxLjc3Ni0yMDQuMDMyVjQyMS4xMmg1Ny43Mjh2ODIuNDk2YzAgNjIuNTI4LTYuNzIgMTE1Ljc3Ni0yMC4yMjQgMTU5Ljc0NCA4NC40OCA1NC4wMTYgMTYxLjQ3MiAxMDcuMDA4IDIzMC45NzYgMTU4Ljk3NmwtNDIuMDQ4IDUwLjMwNHpcIiBwLWlkPVwiMTA3NTBcIiBmaWxsPVwiI2Q4MWUwNlwiPjwvcGF0aD48cGF0aCBkPVwiTTM2Ny40ODggNDk1LjM2aDQyMy43NDR2NDcuMjMySDM2Ny40ODhWNDk1LjM2ek0zNjcuNDg4IDU4MS42MzJoNDIzLjc0NHY0Ny4yMzJIMzY3LjQ4OHYtNDcuMjMyelwiIHAtaWQ9XCIxMDc1MVwiIGZpbGw9XCIjZDgxZTA2XCI+PC9wYXRoPjwvc3ZnPlxuICAgICAgICAgICAgXHU2MjExXHU3Njg0XHU3RjZFXHU5ODc2ICgke3RvcEFydGljbGVJdGVtcy5sZW5ndGh9XHU3QkM3KWAsXG4gICAgICBpdGVtczogdG9wQXJ0aWNsZUl0ZW1zLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICB9KTtcblxuICAgIC8vIFx1NUMwNlx1NjcwMFx1OEZEMVx1NUU3NFx1NEVGRFx1NTIwNlx1N0VDNFx1NUM1NVx1NUYwMFxuICAgIHllYXJHcm91cHNbMV0uY29sbGFwc2VkID0gZmFsc2U7XG4gIH0gZWxzZSB7XG4gICAgLy8gXHU1QzA2XHU2NzAwXHU4RkQxXHU1RTc0XHU0RUZEXHU1MjA2XHU3RUM0XHU1QzU1XHU1RjAwXG4gICAgeWVhckdyb3Vwc1swXS5jb2xsYXBzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIFx1NkRGQlx1NTJBMFx1NUU4Rlx1NTNGN1xuICBhZGRPcmRlck51bWJlcih5ZWFyR3JvdXBzKTtcbiAgcmV0dXJuIHllYXJHcm91cHM7XG59XG5cbi8qKlxuICogXHU2ODM5XHU2MzZFIFx1NjdEMFx1NUMwRlx1OEJGRS9cdTVFOEZcdTUzRjctXHU1MjA2XHU3RUM0L1x1NUU4Rlx1NTNGNy14eHgubWQgXHU3Njg0XHU3NkVFXHU1RjU1XHU2ODNDXHU1RjBGLCBcdTgzQjdcdTUzRDZcdTRGQTdcdThGQjlcdTY4MEZcdTUyMDZcdTdFQzRcdTUzQ0FcdTUyMDZcdTdFQzRcdTRFMEJcdTY4MDdcdTk4OThcbiAqXG4gKiBjb3Vyc2VzL215YmF0aXMvMDEtTXlCYXRpc1x1NTdGQVx1Nzg0MC8wMS14eHgubWRcbiAqXG4gKiBAcGFyYW0gcGF0aCBcdTYyNkJcdTYzQ0ZcdTU3RkFcdTc4NDBcdThERUZcdTVGODRcbiAqIEByZXR1cm5zIHtEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXX1cbiAqL1xuZnVuY3Rpb24gZ2V0SXRlbXMgKHBhdGg6IHN0cmluZykge1xuICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTUyMDZcdTdFQzRcdTY1NzBcdTdFQzRcbiAgbGV0IGdyb3VwczogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10gPSBbXTtcbiAgLy8gXHU0RkE3XHU4RkI5XHU2ODBGXHU1MjA2XHU3RUM0XHU0RTBCXHU2ODA3XHU5ODk4XHU2NTcwXHU3RUM0XG4gIGxldCBpdGVtczogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10gPSBbXTtcbiAgbGV0IHRvdGFsID0gMDtcbiAgLy8gXHU1RjUzXHU1MjA2XHU3RUM0XHU1MTg1XHU2NTg3XHU3QUUwXHU2NTcwXHU5MUNGXHU1QzExXHU0RThFIDIgXHU3QkM3XHU2MjE2XHU2NTg3XHU3QUUwXHU2MDNCXHU2NTcwXHU2NjNFXHU3OTNBXHU4RDg1XHU4RkM3IDIwIFx1N0JDN1x1NjVGNlx1RkYwQ1x1ODFFQVx1NTJBOFx1NjI5OFx1NTNFMFx1NTIwNlx1N0VDNFxuICBjb25zdCBncm91cENvbGxhcHNlZFNpemUgPSAyO1xuICBjb25zdCB0aXRsZUNvbGxhcHNlZFNpemUgPSAyMDtcblxuICAvLyAxLlx1ODNCN1x1NTNENlx1NjI0MFx1NjcwOVx1NTIwNlx1N0VDNFx1NzZFRVx1NUY1NVxuICBzeW5jKGBkb2NzLyR7cGF0aH0vKmAsIHtcbiAgICBvbmx5RGlyZWN0b3JpZXM6IHRydWUsXG4gICAgb2JqZWN0TW9kZTogdHJ1ZSxcbiAgfSkuZm9yRWFjaCgoeyBuYW1lIH0pID0+IHtcbiAgICBsZXQgZ3JvdXBOYW1lID0gbmFtZTtcbiAgICAvLyAyLlx1ODNCN1x1NTNENlx1NTIwNlx1N0VDNFx1NEUwQlx1NzY4NFx1NjI0MFx1NjcwOVx1NjU4N1x1N0FFMFxuICAgIHN5bmMoYGRvY3MvJHtwYXRofS8ke2dyb3VwTmFtZX0vKmAsIHtcbiAgICAgIG9ubHlGaWxlczogdHJ1ZSxcbiAgICAgIG9iamVjdE1vZGU6IHRydWUsXG4gICAgfSkuZm9yRWFjaCgoYXJ0aWNsZSkgPT4ge1xuICAgICAgY29uc3QgYXJ0aWNsZUZpbGUgPSBtYXR0ZXIucmVhZChgJHthcnRpY2xlLnBhdGh9YCk7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGFydGljbGVGaWxlO1xuICAgICAgLy8gXHU1NDExXHU1MjREXHU4RkZEXHU1MkEwXHU2ODA3XHU5ODk4XG4gICAgICBpdGVtcy5wdXNoKHtcbiAgICAgICAgdGV4dDogZGF0YS50aXRsZSxcbiAgICAgICAgbGluazogYC8ke3BhdGh9LyR7Z3JvdXBOYW1lfS8ke2FydGljbGUubmFtZS5yZXBsYWNlKCcubWQnLCAnJyl9YCxcbiAgICAgIH0pO1xuICAgICAgdG90YWwgKz0gMTtcbiAgICB9KVxuXG4gICAgLy8gMy5cdTU0MTFcdTUyNERcdThGRkRcdTUyQTBcdTUyMzBcdTUyMDZcdTdFQzRcbiAgICAvLyBcdTVGNTNcdTUyMDZcdTdFQzRcdTUxODVcdTY1ODdcdTdBRTBcdTY1NzBcdTkxQ0ZcdTVDMTFcdTRFOEUgQSBcdTdCQzdcdTYyMTZcdTY1ODdcdTdBRTBcdTYwM0JcdTY1NzBcdTY2M0VcdTc5M0FcdThEODVcdThGQzcgQiBcdTdCQzdcdTY1RjZcdUZGMENcdTgxRUFcdTUyQThcdTYyOThcdTUzRTBcdTUyMDZcdTdFQzRcbiAgICBncm91cHMucHVzaCh7XG4gICAgICB0ZXh0OiBgJHtncm91cE5hbWUuc3Vic3RyaW5nKGdyb3VwTmFtZS5pbmRleE9mKCctJykgKyAxKX0gKCR7aXRlbXMubGVuZ3RofVx1N0JDNylgLFxuICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgICAgY29sbGFwc2VkOiBpdGVtcy5sZW5ndGggPCBncm91cENvbGxhcHNlZFNpemUgfHwgdG90YWwgPiB0aXRsZUNvbGxhcHNlZFNpemUsXG4gICAgfSlcblxuICAgIC8vIDQuXHU2RTA1XHU3QTdBXHU0RkE3XHU4RkI5XHU2ODBGXHU1MjA2XHU3RUM0XHU0RTBCXHU2ODA3XHU5ODk4XHU2NTcwXHU3RUM0XG4gICAgaXRlbXMgPSBbXTtcbiAgfSlcblxuICAvLyBcdTZERkJcdTUyQTBcdTVFOEZcdTUzRjdcbiAgYWRkT3JkZXJOdW1iZXIoZ3JvdXBzKTtcbiAgcmV0dXJuIGdyb3Vwcztcbn1cblxuLyoqXG4gKiBcdTZERkJcdTUyQTBcdTVFOEZcdTUzRjdcbiAqXG4gKiBAcGFyYW0gZ3JvdXBzIFx1NTIwNlx1N0VDNFx1NjU3MFx1NjM2RVxuICovXG5mdW5jdGlvbiBhZGRPcmRlck51bWJlcihncm91cHMpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IGdyb3Vwc1tpXS5pdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgaXRlbXMgPSBncm91cHNbaV0uaXRlbXM7XG4gICAgICBjb25zdCBpbmRleCA9IGogKyAxO1xuICAgICAgbGV0IGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3ItZ3JheSBtci1bNnB4XVwiIHN0eWxlPVwiZm9udC13ZWlnaHQ6IDU1MDsgZGlzcGxheTogaW5saW5lLWJsb2NrO1wiPiR7aW5kZXh9PC9kaXY+YDtcbiAgICAgIGlmIChpbmRleCA9PSAxKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3ItcmVkIG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSAyKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3Itb3JhbmdlIG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSAzKSB7XG4gICAgICAgIGluZGV4U3R5bGUgPSBgPGRpdiBjbGFzcz1cInRleHQtY29sb3IteWVsbG93IG1yLVs2cHhdXCIgc3R5bGU9XCJmb250LXdlaWdodDogNTUwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+JHtpbmRleH08L2Rpdj5gO1xuICAgICAgfVxuICAgICAgaXRlbXNbal0udGV4dCA9IGAke2luZGV4U3R5bGV9JHtpdGVtc1tqXS50ZXh0fWA7XG4gICAgfVxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUmVwb3NpdG9yaWVzXFxcXHZpdGVwcmVzcy1cXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXHRoZW1lXFxcXHV0aWxzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9SZXBvc2l0b3JpZXMvdml0ZXByZXNzLS9kb2NzLy52aXRlcHJlc3MvdGhlbWUvdXRpbHMudHNcIjsvKipcbiAqIFx1NjgzQ1x1NUYwRlx1NTMxNlx1NjVGNlx1OTVGNFxuICpcbiAqIEBwYXJhbSBkYXRlIFx1NUY4NVx1NjgzQ1x1NUYwRlx1NTMxNlx1NjVGNlx1OTVGNFxuICogQHJldHVybnMgXHU2ODNDXHU1RjBGXHU1MzE2XHU1NDBFXHU3Njg0XHU2NUY2XHU5NUY0KFlZWVkvTU0vZGQgQU0gaGg6bW0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKGRhdGUpIHtcbiAgY29uc3QgZm9ybWF0RGF0ZSA9IG5ldyBEYXRlKGRhdGUpO1xuICByZXR1cm4gZm9ybWF0RGF0ZS50b0xvY2FsZVN0cmluZygnemgnLCB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJywgaG91cjogJ251bWVyaWMnLCBtaW51dGU6ICdudW1lcmljJ30pO1xufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENiBVUkwgXHU4REVGXHU1Rjg0XHU0RTJEXHU3Njg0XHU2MzA3XHU1QjlBXHU1M0MyXHU2NTcwXG4gKlxuICogQHBhcmFtIHBhcmFtTmFtZSBcdTUzQzJcdTY1NzBcdTU0MERcbiAqIEByZXR1cm5zIFx1NTNDMlx1NjU3MFx1NTAzQ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UXVlcnlQYXJhbShwYXJhbU5hbWUpIHtcbiAgY29uc3QgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIrIHBhcmFtTmFtZSArXCI9KFteJl0qKSgmfCQpXCIpO1xuICBsZXQgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkpLm1hdGNoKHJlZyk7XG4gIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZXNjYXBlKHZhbHVlWzJdKTtcbiAgfSBcbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogXHU4REYzXHU4RjZDXHU1MjMwXHU2MzA3XHU1QjlBXHU5NEZFXHU2M0E1XG4gKlxuICogQHBhcmFtIHBhcmFtTmFtZSBcdTUzQzJcdTY1NzBcdTU0MERcbiAqIEBwYXJhbSBwYXJhbVZhbHVlIFx1NTNDMlx1NjU3MFx1NTAzQ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ29Ub0xpbmsodXJsLCBwYXJhbU5hbWUsIHBhcmFtVmFsdWUpIHtcbiAgaWYgKHBhcmFtTmFtZSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsICsgJz8nICsgcGFyYW1OYW1lICsgJz0nICsgcGFyYW1WYWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgfVxufVxuXG4vKipcbiAqIFx1ODNCN1x1NTNENlx1NzUxRlx1ODA5Nlx1NTZGRVx1NjgwN1xuICpcbiAqIEBwYXJhbSB5ZWFyIFx1NUU3NFx1NEVGRFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hpbmVzZVpvZGlhYyh5ZWFyKSB7XG4gIGNvbnN0IGFyciA9IFsnbW9ua2V5JywgJ3Jvb3N0ZXInLCAnZG9nJywgJ3BpZycsICdyYXQnLCAnb3gnLCAndGlnZXInLCAncmFiYml0JywgJ2RyYWdvbicsICdzbmFrZScsICdob3JzZScsICdnb2F0J107XG4gIHJldHVybiBhcnJbeWVhciAlIDEyXTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTc1MUZcdTgwOTZcdTU0MERcdTc5RjBcbiAqXG4gKiBAcGFyYW0geWVhciBcdTVFNzRcdTRFRkRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENoaW5lc2Vab2RpYWNBbGlhcyh5ZWFyKSB7XG4gIGNvbnN0IGFyciA9IFsnXHU3MzM0XHU1RTc0JywgJ1x1OUUyMVx1NUU3NCcsICdcdTcyRDdcdTVFNzQnLCAnXHU3MzJBXHU1RTc0JywgJ1x1OUYyMFx1NUU3NCcsICdcdTcyNUJcdTVFNzQnLCAnXHU4NjRFXHU1RTc0JywgJ1x1NTE1NFx1NUU3NCcsICdcdTlGOTlcdTVFNzQnLCAnXHU4NkM3XHU1RTc0JywgJ1x1OUE2Q1x1NUU3NCcsICdcdTdGOEFcdTVFNzQnXTtcbiAgcmV0dXJuIGFyclt5ZWFyICUgMTJdO1xufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUmVwb3NpdG9yaWVzXFxcXHZpdGVwcmVzcy1cXFxcZG9jc1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZ1xcXFxzZWFyY2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcc2VhcmNoXFxcXGFsZ29saWEtc2VhcmNoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9SZXBvc2l0b3JpZXMvdml0ZXByZXNzLS9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3NlYXJjaC9hbGdvbGlhLXNlYXJjaC50c1wiO2ltcG9ydCB0eXBlIHsgQWxnb2xpYVNlYXJjaE9wdGlvbnMgfSBmcm9tICd2aXRlcHJlc3MnO1xuXG5leHBvcnQgY29uc3QgYWxnb2xpYVNlYXJjaE9wdGlvbnM6IEFsZ29saWFTZWFyY2hPcHRpb25zID0ge1xuICBhcHBJZDogJ0RCWjBHOUhCVVknLFxuICBhcGlLZXk6ICcwMGNlZjQ4MGE1NDMwMDNkMDVkOTgwODExMGVhNWY2NScsXG4gIGluZGV4TmFtZTogJ2NoYXJsZXM3YycsXG4gIGxvY2FsZXM6IHtcbiAgICByb290OiB7XG4gICAgICBwbGFjZWhvbGRlcjogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgICB0cmFuc2xhdGlvbnM6IHtcbiAgICAgICAgYnV0dG9uOiB7XG4gICAgICAgICAgYnV0dG9uVGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJ1xuICAgICAgICB9LFxuICAgICAgICBtb2RhbDoge1xuICAgICAgICAgIHNlYXJjaEJveDoge1xuICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgICByZXNldEJ1dHRvbkFyaWFMYWJlbDogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbkFyaWFMYWJlbDogJ1x1NTNENlx1NkQ4OCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0YXJ0U2NyZWVuOiB7XG4gICAgICAgICAgICByZWNlbnRTZWFyY2hlc1RpdGxlOiAnXHU2NDFDXHU3RDIyXHU1Mzg2XHU1M0YyJyxcbiAgICAgICAgICAgIG5vUmVjZW50U2VhcmNoZXNUZXh0OiAnXHU2Q0ExXHU2NzA5XHU2NDFDXHU3RDIyXHU1Mzg2XHU1M0YyJyxcbiAgICAgICAgICAgIHNhdmVSZWNlbnRTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEZERFx1NUI1OFx1ODFGM1x1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgICAgICByZW1vdmVSZWNlbnRTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEVDRVx1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMlx1NEUyRFx1NzlGQlx1OTY2NCcsXG4gICAgICAgICAgICBmYXZvcml0ZVNlYXJjaGVzVGl0bGU6ICdcdTY1MzZcdTg1Q0YnLFxuICAgICAgICAgICAgcmVtb3ZlRmF2b3JpdGVTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEVDRVx1NjUzNlx1ODVDRlx1NEUyRFx1NzlGQlx1OTY2NCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yU2NyZWVuOiB7XG4gICAgICAgICAgICB0aXRsZVRleHQ6ICdcdTY1RTBcdTZDRDVcdTgzQjdcdTUzRDZcdTdFRDNcdTY3OUMnLFxuICAgICAgICAgICAgaGVscFRleHQ6ICdcdTRGNjBcdTUzRUZcdTgwRkRcdTk3MDBcdTg5ODFcdTY4QzBcdTY3RTVcdTRGNjBcdTc2ODRcdTdGNTFcdTdFRENcdThGREVcdTYzQTUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBmb290ZXI6IHtcbiAgICAgICAgICAgIHNlbGVjdFRleHQ6ICdcdTkwMDlcdTYyRTknLFxuICAgICAgICAgICAgbmF2aWdhdGVUZXh0OiAnXHU1MjA3XHU2MzYyJyxcbiAgICAgICAgICAgIGNsb3NlVGV4dDogJ1x1NTE3M1x1OTVFRCcsXG4gICAgICAgICAgICBzZWFyY2hCeVRleHQ6ICdcdTY0MUNcdTdEMjJcdTYzRDBcdTRGOUJcdTgwMDUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICBub1Jlc3VsdHNTY3JlZW46IHtcbiAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6ICdcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUMnLFxuICAgICAgICAgICAgc3VnZ2VzdGVkUXVlcnlUZXh0OiAnXHU0RjYwXHU1M0VGXHU0RUU1XHU1QzFEXHU4QkQ1XHU2N0U1XHU4QkUyJyxcbiAgICAgICAgICAgIHJlcG9ydE1pc3NpbmdSZXN1bHRzVGV4dDogJ1x1NEY2MFx1OEJBNFx1NEUzQVx1OEJFNVx1NjdFNVx1OEJFMlx1NUU5NFx1OEJFNVx1NjcwOVx1N0VEM1x1Njc5Q1x1RkYxRicsXG4gICAgICAgICAgICByZXBvcnRNaXNzaW5nUmVzdWx0c0xpbmtUZXh0OiAnXHU3MEI5XHU1MUZCXHU1M0NEXHU5OTg4J1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFJlcG9zaXRvcmllc1xcXFx2aXRlcHJlc3MtXFxcXGRvY3NcXFxcLnZpdGVwcmVzc1xcXFxjb25maWdcXFxcdGhlbWUudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1JlcG9zaXRvcmllcy92aXRlcHJlc3MtL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvdGhlbWUudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5pbXBvcnQgeyBuYXYgfSBmcm9tICcuL25hdic7XG5pbXBvcnQgeyBzaWRlYmFyIH0gZnJvbSAnLi9zaWRlYmFyJztcbmltcG9ydCB7IGFsZ29saWFTZWFyY2hPcHRpb25zIH0gZnJvbSAnLi9zZWFyY2gvYWxnb2xpYS1zZWFyY2gnO1xuaW1wb3J0IHsgbG9jYWxTZWFyY2hPcHRpb25zIH0gZnJvbSAnLi9zZWFyY2gvbG9jYWwtc2VhcmNoJztcblxuZXhwb3J0IGNvbnN0IHRoZW1lQ29uZmlnOiBEZWZhdWx0VGhlbWUuQ29uZmlnID0ge1xuICBuYXYsIC8vIFx1NUJGQ1x1ODIyQVx1NjgwRlx1OTE0RFx1N0Y2RVxuICBzaWRlYmFyLCAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTkxNERcdTdGNkVcblxuICBsb2dvOiAnL2xvZ28ucG5nJyxcbiAgb3V0bGluZToge1xuICAgIGxldmVsOiAnZGVlcCcsIC8vIFx1NTNGM1x1NEZBN1x1NTkyN1x1N0VCMlx1NjgwN1x1OTg5OFx1NUM0Mlx1N0VBN1xuICAgIGxhYmVsOiAnXHU3NkVFXHU1RjU1JywgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU2NTg3XHU2NzJDXHU5MTREXHU3RjZFXG4gIH0sXG4gIGRhcmtNb2RlU3dpdGNoTGFiZWw6ICdcdTUyMDdcdTYzNjJcdTY1RTVcdTUxNDkvXHU2Njk3XHU5RUQxXHU2QTIxXHU1RjBGJyxcbiAgc2lkZWJhck1lbnVMYWJlbDogJ1x1NjU4N1x1N0FFMCcsXG4gIHJldHVyblRvVG9wTGFiZWw6ICdcdThGRDRcdTU2REVcdTk4NzZcdTkwRTgnLFxuICBsYXN0VXBkYXRlZDoge1xuICAgIHRleHQ6ICdcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjAnLFxuICAgIGZvcm1hdE9wdGlvbnM6e1xuICAgICAgZGF0ZVN0eWxlOidmdWxsJyxcbiAgICAgIHRpbWVTdHlsZTonc2hvcnQnXG4gICAgfVxuICB9LFxuICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcbiAgZG9jRm9vdGVyOiB7XG4gICAgcHJldjogJ1x1NEUwQVx1NEUwMFx1N0JDNycsXG4gICAgbmV4dDogJ1x1NEUwQlx1NEUwMFx1N0JDNydcbiAgfSxcbiAgLy8gXHU3RjE2XHU4RjkxXHU5NEZFXHU2M0E1XHU5MTREXHU3RjZFXG4gIGVkaXRMaW5rOiB7XG4gICAgcGF0dGVybjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9DaGFybGVzN2MvY2hhcmxlczdjLmdpdGh1Yi5pby9lZGl0L21haW4vZG9jcy86cGF0aCcsXG4gICAgdGV4dDogJ1x1NEUwRFx1NTlBNVx1NEU0Qlx1NTkwNFx1RkYwQ1x1NjU2Q1x1OEJGN1x1OTZDNVx1NkI2MydcbiAgfSxcbiAgLy8gXHU2NDFDXHU3RDIyXHU5MTREXHU3RjZFXHVGRjA4XHU0RThDXHU5MDA5XHU0RTAwXHVGRjA5XG4gIHNlYXJjaDoge1xuICAgIHByb3ZpZGVyOiAnYWxnb2xpYScsXG4gICAgb3B0aW9uczogYWxnb2xpYVNlYXJjaE9wdGlvbnMsXG4gICAgLy8gXHU2NzJDXHU1NzMwXHU3OUJCXHU3RUJGXHU2NDFDXHU3RDIyXG4gICAgLy8gcHJvdmlkZXI6ICdsb2NhbCcsXG4gICAgLy8gb3B0aW9uczogbG9jYWxTZWFyY2hPcHRpb25zXG4gIH0sXG4gIC8vIFx1NUJGQ1x1ODIyQVx1NjgwRlx1NTNGM1x1NEZBN1x1NzkzRVx1NEVBNFx1OTRGRVx1NjNBNVx1OTE0RFx1N0Y2RVxuICBzb2NpYWxMaW5rczogW1xuICAgIHsgaWNvbjogJ2dpdGh1YicsIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vQ2hhcmxlczdjL2NoYXJsZXM3Yy5naXRodWIuaW8nIH0sXG4gICAge1xuICAgICAgaWNvbjoge1xuICAgICAgICBzdmc6ICc8c3ZnIHJvbGU9XCJpbWdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjx0aXRsZT5cdTc4MDFcdTRFOTE8L3RpdGxlPjxwYXRoIGQ9XCJNMTEuOTg0IDBBMTIgMTIgMCAwIDAgMCAxMmExMiAxMiAwIDAgMCAxMiAxMiAxMiAxMiAwIDAgMCAxMi0xMkExMiAxMiAwIDAgMCAxMiAwYTEyIDEyIDAgMCAwLS4wMTYgMHptNi4wOSA1LjMzM2MuMzI4IDAgLjU5My4yNjYuNTkyLjU5M3YxLjQ4MmEuNTk0LjU5NCAwIDAgMS0uNTkzLjU5Mkg5Ljc3N2MtLjk4MiAwLTEuNzc4Ljc5Ni0xLjc3OCAxLjc3OHY1LjYzYzAgLjMyNy4yNjYuNTkyLjU5My41OTJoNS42M2MuOTgyIDAgMS43NzgtLjc5NiAxLjc3OC0xLjc3OHYtLjI5NmEuNTkzLjU5MyAwIDAgMC0uNTkyLS41OTNoLTQuMTVhLjU5Mi41OTIgMCAwIDEtLjU5Mi0uNTkydi0xLjQ4MmEuNTkzLjU5MyAwIDAgMSAuNTkzLS41OTJoNi44MTVjLjMyNyAwIC41OTMuMjY1LjU5My41OTJ2My40MDhhNCA0IDAgMCAxLTQgNEg1LjkyNmEuNTkzLjU5MyAwIDAgMS0uNTkzLS41OTNWOS43NzhhNC40NDQgNC40NDQgMCAwIDEgNC40NDUtNC40NDRoOC4yOTZaXCIvPjwvc3ZnPidcbiAgICAgIH0sXG4gICAgICBsaW5rOiAnaHR0cHM6Ly9naXRlZS5jb20vQ2hhcmxlczdjL2NoYXJsZXM3YydcbiAgICB9LFxuICAgIHtcbiAgICAgIGljb246IHtcbiAgICAgICAgc3ZnOiBgPHN2ZyB3aWR0aD1cIjMzXCIgaGVpZ2h0PVwiMzNcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAxNzQuOCAyMDRcIj5cbiAgICAgICAgICAgICAgICA8dGl0bGU+Q29udGlOZXcgQWRtaW48L3RpdGxlPlxuICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCIjMzA3QUYyXCIgZD1cIk04Ni43LDBsODgsNTF2LjJsLTE2LjMsOS40di0uMkw4Ni43LDE4LjlabTcxLjgsMTQzLjUsMTYuMyw5LjR2LjJMODYuOCwyMDRoMGwtMTYuMy05LjQsMTYuMy05LjRoMGw3MS43LTQxLjV2LS4yWlwiLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiIzEyRDJBQ1wiIGQ9XCJNMTYuMywxNDMuNXYuMkw1OCwxNjcuOGwtMTYuMyw5LjRMMCwxNTMuMXYtLjJaXCIvPlxuICAgICAgICAgICAgICAgIDxwYXRoIGZpbGw9XCIjMTJEMkFDXCIgZD1cIk0xMDQuMSw5MywxNS45LDE0My44bC0uMi0uMVYxMjQuOWwuMi4xTDg3LjcsODMuNiwxMDQuMSw5M1pcIi8+XG4gICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cIiMwMDU3RkVcIiBkPVwiTTg4LjEsMCwuMSw1MXYuMmwxNi4zLDkuNHYtLjJMODguMSwxOC45WlwiLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiIzMwN0FGMlwiIGQ9XCJNLjEsNTAuOS4yLDE1Mi42bC4yLjEsMTYuMy05LjQtLjItLjEtLjEtODIuOUwuMSw1MC45WlwiLz5cbiAgICAgICAgICAgICAgICA8cGF0aCBmaWxsPVwiIzAwNTdGRVwiIGQ9XCJNMTc0LjcsNTAuOWwtLjEsMTAxLjctLjIuMS0xNi4zLTkuNC4yLS4xLjEtODIuOVpcIi8+XG4gICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cIiMxMkQyQUNcIiBkPVwiTTQxLjcsMTU4LjVsMTYuMSw5LjQsMTAwLjYtNTguN1Y5MC40WlwiLz5cbiAgICAgICAgICAgICAgPC9zdmc+YFxuICAgICAgfSxcbiAgICAgIGxpbms6ICdodHRwczovL2NvbnRpbmV3LnRvcC8nXG4gICAgfVxuICBdLFxuXG4gIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjI2OVx1NUM1NTogXHU2NTg3XHU3QUUwXHU1MTQzXHU2NTcwXHU2MzZFXHU5MTREXHU3RjZFXG4gIC8vIEB0cy1pZ25vcmVcbiAgYXJ0aWNsZU1ldGFkYXRhQ29uZmlnOiB7XG4gICAgYXV0aG9yOiAnXHU2N0U1XHU1QzE0XHU2NUFGJywgLy8gXHU2NTg3XHU3QUUwXHU1MTY4XHU1QzQwXHU5RUQ4XHU4QkE0XHU0RjVDXHU4MDA1XHU1NDBEXHU3OUYwXG4gICAgYXV0aG9yTGluazogJ2h0dHBzOi8vY2hhcmxlczdjLnRvcCcsIC8vIFx1NzBCOVx1NTFGQlx1NEY1Q1x1ODAwNVx1NTQwRFx1NjVGNlx1OUVEOFx1OEJBNFx1OERGM1x1OEY2Q1x1NzY4NFx1OTRGRVx1NjNBNVxuICAgIHNob3dWaWV3Q291bnQ6IGZhbHNlLCAvLyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdTY1ODdcdTdBRTBcdTk2MDVcdThCRkJcdTY1NzAsIFx1OTcwMFx1ODk4MVx1NTcyOCBkb2NzLy52aXRlcHJlc3MvdGhlbWUvYXBpL2NvbmZpZy5qcyBcdTUzQ0EgaW50ZXJmYWNlLmpzIFx1OTE0RFx1N0Y2RVx1NTk3RFx1NzZGOFx1NUU5NCBBUEkgXHU2M0E1XHU1M0UzXG4gIH0sXG4gIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjI2OVx1NUM1NTogXHU2NTg3XHU3QUUwXHU3MjQ4XHU2NzQzXHU5MTREXHU3RjZFXG4gIGNvcHlyaWdodENvbmZpZzoge1xuICAgIGxpY2Vuc2U6ICdcdTdGNzJcdTU0MEQtXHU3NkY4XHU1NDBDXHU2NUI5XHU1RjBGXHU1MTcxXHU0RUFCIDQuMCBcdTU2RkRcdTk2NDUgKENDIEJZLVNBIDQuMCknLFxuICAgIGxpY2Vuc2VMaW5rOiAnaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvNC4wLydcbiAgfSxcbiAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2MjY5XHU1QzU1OiBcdThCQzRcdThCQkFcdTkxNERcdTdGNkVcbiAgY29tbWVudENvbmZpZzoge1xuICAgIHR5cGU6ICdnaXRhbGsnLFxuICAgIHNob3dDb21tZW50OiB0cnVlIC8vIFx1NjYyRlx1NTQyNlx1NjYzRVx1NzkzQVx1OEJDNFx1OEJCQVxuICB9LFxuICAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYyNjlcdTVDNTU6IFx1OTg3NVx1ODExQVx1OTE0RFx1N0Y2RVxuICBmb290ZXJDb25maWc6IHtcbiAgICBzaG93Rm9vdGVyOiB0cnVlLCAvLyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdTk4NzVcdTgxMUFcbiAgICBpY3BSZWNvcmRDb2RlOiAnXHU2RDI1SUNQXHU1OTA3eHh4eC0xJywgLy8gSUNQXHU1OTA3XHU2ODQ4XHU1M0Y3XG4gICAgcHVibGljU2VjdXJpdHlSZWNvcmRDb2RlOiAnXHU2RDI1XHU1MTZDXHU3RjUxXHU1Qjg5XHU1OTA3eHh4eFx1NTNGNycsIC8vIFx1ODA1NFx1N0Y1MVx1NTkwN1x1Njg0OFx1NTNGN1xuICAgIGNvcHlyaWdodDogYENvcHlyaWdodCBcdTAwQTkgMjAxOS0ke25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gQ2hhcmxlczdjYCAvLyBcdTcyNDhcdTY3NDNcdTRGRTFcdTYwNkZcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLG9CQUFvQjtBQUM3VSxTQUFTLG1CQUFtQjs7O0FDRGlULElBQU0sT0FBTztBQUVuVixJQUFNLFdBQVc7QUFBQSxFQUN0QixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFDYjtBQUFBLEVBQ0EsT0FBTyxHQUFHLElBQUk7QUFDaEI7OztBQ05PLElBQU0sT0FBcUI7QUFBQSxFQUNoQyxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsTUFBTSxlQUFlLENBQUM7QUFBQSxFQUM5QyxDQUFDLFFBQVEsRUFBRSxNQUFNLFVBQVUsU0FBUyxZ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QztBQUFBO0FBQUEsRUFDekQ7QUFDRjs7O0FSdEZBLElBQU8saUJBQVE7QUFBQSxFQUNiLGFBQWE7QUFBQSxJQUNYLE1BQU0sU0FBUztBQUFBLElBQ2YsT0FBTyxTQUFTO0FBQUEsSUFDaEIsYUFBYSxTQUFTO0FBQUEsSUFFdEIsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBO0FBQUEsSUFFYjtBQUFBO0FBQUEsSUFDQTtBQUFBO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxVQUFVO0FBQUEsUUFDUixpQkFBaUI7QUFBQSxVQUNmLGlCQUFpQixDQUFDLFFBQVEsZUFBZSxTQUFTLEdBQUc7QUFBQSxRQUN2RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBO0FBQUEsRUFDRixDQUFDO0FBQ0g7QUFFQSxJQUFNLGlCQUFpQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjsiLAogICJuYW1lcyI6IFsibmFtZSJdCn0K
