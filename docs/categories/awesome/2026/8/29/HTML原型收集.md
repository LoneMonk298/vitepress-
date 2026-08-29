---
title: HTML 原型收集
author: LoneMonk
date: '2026/8/29 21:00'
description: 收集平时练习的纯 HTML/CSS/JS 原型，通过 VizEmbed 组件直接嵌入博客，方便留存与回顾。
categories:
  - awesome
tags:
  - HTML
  - CSS
  - JavaScript
---

# HTML 原型收集

<!-- more -->

在AI发展的潮流下，想法和创意显得更加重要，我将把平时复刻的一些纯 HTML/CSS/JS 小原型，统一收录在这里。
这些原型完全可以在AI的帮助下封装成其它的形式，比如组件、插件等。

## 响应式滚动时间线

中间一条竖线，年份卡片左右交替排列。滚动页面时，进入视口中心的卡片由模糊变清晰，
竖线另一侧淡入书名标题，同时页面全屏背景图同步切换为当前卡片内的图片；
移动端（≤768px）自动降级为单列靠左布局。

<VizEmbed
  name="timeline"
  title="响应式滚动时间线"
  caption="滚动激活卡片-背景图同步切换（建议点右上角全屏体验）"
  :height="720"
  :collapsed="true"
  show-source
  source-href="https://web.lonemonk.xyz/article/5"
/>

**实现笔记：**

- 所有卡片必须放在同一个 `.timeline` 容器内，`:nth-child(even)` 才能控制左右交替
- 侧标题文字通过 CSS `content: attr(data-text)` 直接读取 HTML 属性，无需额外标签
- 激活判定：视口中心线（`scrollTop + innerHeight/2`）落在卡片范围内即激活
- 位置计算注意坐标基准统一：`getBoundingClientRect().top + scrollTop` 换算为文档坐标

## 左右平滑登录页

毛玻璃质感的登录/注册界面，点击切换时欢迎栏与表单面板左右平滑滑动，
带入场加载动画，纯 CSS transition 实现。


<VizEmbed
  name="login-slide"
  title="左右平滑登录页"
  caption="毛玻璃效果 · 登录/注册面板滑动切换"
  :height="620"
  :collapsed="true"
  show-source
  source-href="https://web.lonemonk.xyz/article/5"
/>

**实现笔记：**

- 毛玻璃：`backdrop-filter: blur()` + 半透明白色背景
- 滑动动画：容器 `overflow: hidden`，面板用 `transform: translateX()` 配合 `transition`
- 待补充……

<!-- ## 新增原型的方法

1. 在 `docs/public/visualizers/` 下新建一个英文目录，原型文件命名为 `index.html`，图片等资源放同目录（用相对路径引用）
2. 在文章中插入组件：

```md
<VizEmbed
  name="目录名"
  title="原型标题"
  caption="一句话说明"
  :height="600"
/> -->
