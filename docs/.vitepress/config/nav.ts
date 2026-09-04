import type { DefaultTheme } from "vitepress";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadContentRegistry } from "../../../content-registry.mjs";

function getCategoryNavItems(): DefaultTheme.NavItem[] {
  return loadContentRegistry()
    .categories.filter((category) =>
      existsSync(
        path.resolve(process.cwd(), "docs/categories", category.id, "index.md"),
      ),
    )
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((category) => ({
      text: category.name,
      link: `/categories/${category.id}/index`,
      activeMatch: `/categories/${category.id}/`,
    }));
}

export const nav: DefaultTheme.Config["nav"] = [
  {
    text: "文章分类",
    items: [...getCategoryNavItems()],
    activeMatch: "/categories/",
  },
  {
    text: "课程尝试",
    items: [
      {
        text: "课程1",
        link: "/courses/course1/index",
        activeMatch: "/courses/course1/",
      },
    ],
    activeMatch: "/courses/",
  },
  {
    text: "文章标签",
    link: "/tags",
    activeMatch: "/tags",
  },
  {
    text: "文章归档",
    link: "/archives",
    activeMatch: "/archives",
  },
  {
    text: "408学习表",
    link: "/考研408考点学习管理表.html",
    target: "_blank",
  },
  {
    text: "考研资源",
    items: [
      { text: "研砖", link: "https://yanbrick.com/?ref=1", target: "_blank" },
      { text: "杂货铺", link: "https://www.csgraduates.com/", target: "_blank" },
      {
        text: "研可岸真题",
        link: "https://zhenti.kaoyansou.cn/",
        target: "_blank",
      },
      {
        text: "研可岸择校",
        link: "https://www.kaoyansou.cn/f/sc/index.html?utm_source=zhenti.kaoyansou.cn#/school",
        target: "_blank",
      },
    ],
  },
];
