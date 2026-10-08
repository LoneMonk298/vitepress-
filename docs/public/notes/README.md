# 笔记导图 /notes/ — 实现说明与路线图

> 考研复习用的 Markdown 思维导图笔记工具，基于 MindElixir，已部署在 `https://blog.lonemonk.xyz/notes/`
> 入口：数学考点取舍表 → 右上角「笔记导图」按钮

---

## 一、当前实现

### 1. 核心编辑器

- 引擎：**MindElixir 4.4.3**（开源，SVG + foreignObject）
- 部署：本地 vendor，无 CDN 依赖，支持 `file://` 和 `https://` 双模
- 能力：增删节点、拖拽重排、折叠展开、双指缩放、右键菜单、工具栏、键盘快捷键、暗色/亮色主题

### 2. Markdown 语法

所有语法写在节点文本里，保存后保留原文，编辑后不丢失。

```
## 标题节点              → 解析时第一个节点作根
- 列表项                → 普通子节点
  - 缩进嵌套            → 更深层级（自动兼容 2/4 空格）

$(-1)^{i+j}$            → LaTeX 行内公式（KaTeX 渲染）
$$\begin{pmatrix}A&B\end{pmatrix}$$  → LaTeX 块公式
![说明](图片地址)        → 图片
![说明](地址 =300x200)   → 图片（指定尺寸）
[文字](https://...)     → 外链（新标签页打开）
[[目标笔记名]]          → 跳转到另一篇笔记
[自定义文字](note:目标笔记名)  → 跳转（可改显示文字）
```

优先级：图片 > 笔记跳转 > 链接 > 裸 URL > LaTeX

### 3. 功能列表

| 功能 | 位置 | 说明 |
|---|---|---|
| 新建笔记 | 侧栏底部 | 输入名称，创建空导图 |
| 导入 Markdown | 侧栏底部 | 粘贴 AI 生成的 Markdown，转成导图 |
| 编辑 Markdown 源 | 工具栏 | 直接改当前笔记的 Markdown 源，覆盖导图 |
| 笔记间跳转 | 节点内点击 | `[[x]]` 或 `(note:x)`，橙色加粗链接 |
| 返回上一笔记 | 工具栏 | 跳转栈，A→B→C 可逐层返回 |
| 改名 | 工具栏 | 重命名笔记 |
| 导出 JSON | 工具栏 | 导出当前笔记的完整数据 |
| 重置 | 工具栏 | 清空当前笔记所有编辑 |
| 云同步 | 工具栏 | jsonbin.io 多设备同步 |
| 搜索节点 | 工具栏 | 当前笔记内模糊搜索，自动展开定位 |

### 4. 数据架构

```
localStorage:
  mm_notes_list        → 笔记索引数组 [{id, name, created}]
  mm_notes:<id>        → 单篇笔记的完整数据 {nodeData, arrows, summaries, direction, theme}
  mm_notes_sync_config → 云同步凭证 {keyId, accessKey, binId}
  mm_notes_last_sync   → 上次同步时间
```

**关键不变式**：`nodeData` 里每个节点的 `topic` 字段永远是原始纯文本（含 `$...$`、`[[x]]`、`![...](...)` 语法），`dangerouslySetInnerHTML` 是派生的视图层。每次加载都从 `topic` 重新生成 HTML（`applyInlineHtml`），保证编辑→保存→重新打开不丢失公式/链接/图片。

### 5. 与 MindElixir 的关系

库一行没改。所有扩展通过 MindElixir 暴露的公开 API 实现：

- `getData()` / `getDataString()` — 数据导出
- `bus.addListener("operation", cb)` — 编辑事件（自动保存）
- 节点的 `dangerouslySetInnerHTML` 属性 — 富文本渲染
- `refresh()` — 图片加载后重算布局

部署时唯一改动：ESM → 全局脚本（`export { D as default }` → `window.MindElixir = D`），为支持 `file://` 本地打开。

---

## 二、文件结构

```
docs/public/notes/
├── index.html                  # 主页面（解析器 + UI + 同步）
└── vendor/
    ├── mind-elixir.global.js   # 思维导图引擎（官方构建，未修改）
    └── katex/
        ├── katex.min.js        # LaTeX 渲染
        ├── katex.min.css
        └── fonts/*.woff2       # 20 个字体文件
```

---

## 三、未来计划

### 优先级 P0（核心体验）

1. **全局搜索** — 搜所有笔记的节点，结果列表点击跳转
2. **标签系统** — 节点加 `#标签`，侧栏按标签聚合浏览
3. **双链反查** — "谁引用了我"，看哪些笔记跳到了当前节点
4. **移动端优化** — 当前可用但体验一般，需要手势和布局调整

### 优先级 P1（内容能力）

5. **导出 PDF / PNG** — 接 html2canvas 或打印 CSS，导出整篇笔记
6. **版本历史** — 云同步时存快照，可回滚到任意时间点
7. **笔记模板** — 预设常见结构（如"题型模板：适用场景→解题步骤→易错点"）
8. **快捷键面板** — 官方快捷键暴露给用户查看

### 优先级 P2（扩展）

9. **多主题皮肤** — 官方只有两套，可定制颜色方案
10. **统计面板** — 笔记数、节点数、最近编辑时间、同步状态
11. **Markdown 导出整本** — 一键导出所有笔记为一个 .md 文件
12. **离线 PWA** — Service Worker 缓存，断网可用

---

## 四、技术备注

### MindElixir 对外暴露的 API（22 个）

```
init / refresh / getData / getDataString / getDataMd
expandNode / focusNode / toCenter / selectNode / selectNodes
unselectNode / unselectNodes / clearSelection / cancelFocus
enableEdit / disableEdit / scale / initLeft / initRight / initSide
setLocale / install
```

### 已知限制

1. **官方 `getDataMd()` 丢公式和链接** — 我们用自己的 `nodeDataToMd()` 替代，保留原始 topic
2. **千节点以上渲染慢** — 建议单篇笔记控制在 200 节点以内，多了就拆分
3. **图片必须用外链 URL** — 不支持本地文件上传（需要后端图床）
4. **KaTeX 字体 1.2MB** — 首次加载慢，浏览器缓存后不慢

### 踩过的坑

1. `topic` 用 `textContent` 渲染，不解析 HTML → 必须用 `dangerouslySetInnerHTML`
2. `getData()` 在节点带 `dangerouslySetInnerHTML` 时，topic 会变成 HTML 字符串 → 必须用 `applyInlineHtml` 从纯文本重新生成
3. MindElixir 是 ESM，`file://` 下 ESM 被 CORS 拦 → 转全局脚本 + IIFE
4. Cloudflare 缓存旧的 404 → 文件加版本号重命名
5. KaTeX 字体路径相对页面解析 → 用 `./vendor/katex/fonts/`

---

*最后更新：2026-10-08*
