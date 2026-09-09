# 考研 100 天冲刺系统 · API 扩展说明

> 本文档面向未来扩展新功能或对接其他智能体的开发者。
> 系统由两个独立 HTML 页面 + VitePress 博客组成，数据通过 localStorage 同源共享。

## 一、系统架构

```
考研408考点学习管理表.html  ←→  每日规划.html
        │                              │
        ├─ 考点数据 (localStorage)      ├─ 打卡数据 (localStorage)
        ├─ 翻盘队列 (localStorage)      ├─ AI 老师配置 (localStorage)
        ├─ 卡壳记录 (localStorage)      ├─ 明日计划 (localStorage)
        ├─ 学习动态日志 (localStorage)  └─ 导出/导入 (剪贴板桥接)
        └─ 番茄钟 (localStorage)
```

**数据同源共享**：两个页面部署在同一域名下，共享同一份 localStorage。在表格页标记考点状态，规划页刷新即可看到。

## 二、localStorage Key 索引

### 考点表

| Key | 类型 | 说明 |
|-----|------|------|
| `kaoyan_408_data` | JSON | 四科考点全量数据，按 Sheet 分组 |
| `kaoyan_408_mastery` | JSON | 考点掌握状态覆盖（未开始/学习中/已掌握） |
| `kaoyan_408_review` | JSON | 回顾次数 |
| `kaoyan_408_notes` | JSON | 自定义备注 |
| `kaoyan_408_activity_log` | JSON | 学习动态日志（学习/掌握/复盘事件） |
| `kaoyan_408_stuck_points` | JSON | 卡壳点记录（按日期） |
| `kaoyan_408_collapsed` | JSON | 表格折叠状态 |
| `kaoyan_408_pomodoro` | JSON | 番茄钟数据 |
| `kaoyan_408_checkin` | JSON | 日程打卡数据 |

### 每日规划页

| Key | 类型 | 说明 |
|-----|------|------|
| `kaoyan_plan` | JSON | 每日规划全部状态（时段打卡、待办、快闪等） |
| `kaoyan_hermes_cfg` | JSON | AI 老师配置（endpoint / key / model） |
| `kaoyan_plan_override` | JSON | AI 导入的明日计划覆盖（focusSheet / newCount 等） |

## 三、考点数据结构

```javascript
// kaoyan_408_data 结构
{
  "Sheet1_数据结构": [
    {
      "科目": "数据结构",
      "考纲章节": "基本概念",
      "考点": "数据结构的基本概念",
      "09—25考频": "—",
      "热度等级": "⚪ 冷门",
      "掌握程度": "未开始",    // 未开始 / 学习中 / 已掌握
      "回顾次数": 0,
      "备注": "",
      "_custom": false          // true 表示用户自定义考点
    },
    // ...
  ],
  "Sheet2_计算机组成原理": [/* ... */],
  "Sheet3_操作系统": [/* ... */],
  "Sheet4_计算机网络": [/* ... */]
}
```

### Sheet 标识符

| Sheet ID | 科目 |
|----------|------|
| `Sheet1_数据结构` | 数据结构 |
| `Sheet2_计算机组成原理` | 计算机组成原理 |
| `Sheet3_操作系统` | 操作系统 |
| `Sheet4_计算机网络` | 计算机网络 |

### 热度等级

| 文本 | 权重 | 排序优先级 |
|------|------|------------|
| 🔥 高频 | 3 | 1（最优先推荐） |
| 🟡 中频 | 2 | 2 |
| 🟢 低频 | 1 | 3 |
| ⚪ 冷门 | 0 | 4（最后推荐） |

## 四、翻盘队列（间隔复习）

### 队列结构

```javascript
// kaoyan_408_activity_log 中翻盘相关条目
{
  "type": "review_added",     // review_added / review_passed / review_failed
  "sheet": "Sheet2_计算机组成原理",
  "point": "Cache映射方式",
  "chapter": "存储器",
  "stage": 0,                 // 当前轮次 0-5
  "date": "2026-09-10",       // 排期日期
  "timestamp": 1725964800000
}
```

### 间隔周期

```
第1轮: +1 天
第2轮: +2 天
第3轮: +4 天
第4轮: +7 天
第5轮: +15 天
第6轮: +30 天 → 全部通过即固化毕业，自动写回「已掌握」
```

### 翻盘队列 API（全局函数）

| 函数 | 说明 |
|------|------|
| `getReviewList()` | 获取所有在途翻盘项 |
| `getTodayStuckPoints()` | 获取今日卡壳点 |
| `actReview(key, passed)` | 标记翻盘通过/失败，推进或重置轮次 |

## 五、AI 老师对接接口

### 5.1 剪贴板桥接模式（默认，零配置）

无需任何 API，通过复制粘贴在页面和任意 AI（Gemini GEM / ChatGPT / Claude）之间传递数据。

**导出格式**（`buildProgressReport()` 生成）：

```
## 考研冲刺每日汇报
### 基本信息
  Day 2 / 102
  倒计时: 100 天
  当前阶段: 极速清尾 (9.9 - 9.30)

### 时段完成情况 (3/6)
  ✓ 08:00-12:30 数学大核
  ✓ 12:30-14:00 午休·英语
  ✗ 14:00-18:30 408大核
  ...

### 各科进度
  数据结构: 15/45 已掌握 (33%)
  ...

### 盲区清单
  [数据结构] 栈与队列 (线性表) 🔥高频 [学习中]
  ...

### ⚡ 今日卡壳点 (2 个)
  [组成原理] Cache映射方式 (存储器)
    问题: 直接映射的地址计算搞混了

### 明日预设
  日期: 2026-09-11 (Day 3)
  ...
```

**导入格式**（AI 回复末尾的 JSON 代码块）：

```json
{
  "focusSheet": "Sheet2_计算机组成原理",
  "newCount": 5,
  "mathNote": "明天重点练换元法",
  "reviewNote": "复盘 Cache 映射",
  "generalNote": "英语开始背作文模板",
  "suggestedTopics": ["Cache映射方式", "指令流水线"]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `focusSheet` | string | Sheet ID，明日 408 主攻科目 |
| `newCount` | number | 明日推荐新学考点数量 |
| `mathNote` | string | 数学重点提示 |
| `reviewNote` | string | 复盘重点提示 |
| `generalNote` | string | 其他建议 |
| `suggestedTopics` | string[] | 推荐优先攻克的考点名称列表 |

### 5.2 API 直连模式（OpenAI 兼容格式）

配置端点后，页面直接通过 `fetch` 调用 AI，支持流式响应。

**配置存储**（`kaoyan_hermes_cfg`）：

```json
{
  "endpoint": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  "key": "YOUR_API_KEY",
  "model": "gemini-2.5-flash"
}
```

**请求格式**：

```javascript
POST {endpoint}
Headers: { "Authorization": "Bearer {key}", "Content-Type": "application/json" }
Body: {
  "model": "gemini-2.5-flash",
  "messages": [
    { "role": "system", "content": "系统提示词（班主任角色 + JSON 输出约定）" },
    { "role": "user", "content": "每日汇报数据 + 用户消息" }
  ],
  "stream": true   // 流式输出
}
```

**预设服务商**：

| 预设 | 端点 | 模型 |
|------|------|------|
| Gemini Flash | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | `gemini-2.5-flash` |
| Gemini Pro | 同上 | `gemini-2.5-pro` |
| Hermes | 自填 | 自填 |
| OpenAI | `https://api.openai.com/v1/chat/completions` | `gpt-4o-mini` |

### 5.3 对接新智能体的步骤

1. **确认智能体提供 OpenAI 兼容端点**（`/v1/chat/completions` 格式）
2. 在规划页点 ⚙ → 填入端点、Key、模型名 → 保存
3. 如果不是标准格式，需修改以下函数：
   - `window.__hermesReport()` — 汇报请求发送
   - `window.__hermesChat()` — 对话请求发送
   - 流式解析逻辑（SSE `data:` 行解析）
4. 如果智能体不支持流式，将 `stream: true` 改为 `false`，并适配一次性响应的解析

### 5.4 系统提示词模板

```
你是我的考研辅导老师，专带 408 + 数学二冲刺。学生正在执行 100 天极限冲刺（9.9-12.18），目标 330 分。

你能看到学生每次发来的：每日完成情况、各科精确盲区清单（带考频热度）、翻盘队列状态、近期学习动态、今日卡壳点。

⚡ 卡壳点是学生当天学习时记录的「哪里搞不懂」，请优先分析并给出突破建议。

当学生要求更新明日计划时，在回复末尾附加 JSON 代码块：
```json
{"focusSheet":"Sheet2_计算机组成原理","newCount":5,"mathNote":"重点","reviewNote":"复盘","generalNote":"其他","suggestedTopics":["考点A","考点B"]}
```
```

## 六、扩展新功能指南

### 新增一个考点字段

1. 在 `考研408考点学习管理表.html` 的 `<thead>` 加 `<th>`
2. 在 `INITIAL_DATA` 的每个考点对象加对应字段
3. 在 `renderTable()` 的行模板加 `<td>`
4. 在 `openDetailModal()` / `submitAddPoint()` 加读写逻辑

### 新增一个每日规划时段

1. 在 `每日规划.html` 的 `TIME_SLOTS` 数组加新条目：
   ```javascript
   { start: 分钟数, end: 分钟数, icon: '🎯', title: '时段名', detail: '描述' }
   ```
2. 在 `render()` 函数中加对应的 `blockOpen()` + 内容渲染
3. 打卡数据自动适配（`plan.slots` 数组按索引对应）

### 新增一个复习资料文件

1. 把文件放入 `docs/public/review/`
2. 可选：建子文件夹按科目分类
3. 提交推送 → `review-files.data.js` 自动扫描 → 资料页和表格 tab 自动更新

### 新增一个可视化页面

1. 在 `docs/public/` 下放独立 HTML 文件
2. 在 `考研408考点学习管理表.html` 的 tab 栏加链接：
   ```html
   <a class="tab tab-link" href="新页面.html">入口名</a>
   ```
3. 在 `nav.ts` 加导航栏入口（可选）

## 七、构建与部署

```bash
# 本地构建
node node_modules/vitepress/bin/vitepress.js build docs

# 推送 main 分支，GitHub Actions 自动部署
git add . && git commit -m "feat: 描述" && git push origin main
```

## 八、文件清单

| 文件 | 说明 |
|------|------|
| `docs/public/考研408考点学习管理表.html` | 考点表主页面（含日程看板、翻盘队列、卡壳记录、番茄钟） |
| `docs/public/每日规划.html` | 每日规划页（六时段打卡、AI 老师对接、剪贴板桥接） |
| `docs/public/review/` | 复习资料存放目录 |
| `review-files.data.js` | VitePress 构建时扫描 review 目录的加载器 |
| `docs/review/index.md` | 复习资料库列表页 |
| `docs/.vitepress/config/nav.ts` | 导航栏配置 |
| `article.data.js` | 文章数据加载器（日期规范化） |
