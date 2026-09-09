---
title: 复习资料
description: 考研复习资料库：讲义、笔记与速查表按科目归档，构建时自动索引，随时在线查阅与下载。
head:
  - - meta
    - { name: robots, content: noindex }
---

<script setup>
import { computed } from 'vue'
import { data as reviewFiles } from '../../review-files.data.js'

const TYPE_MAP = {
  pdf: { label: 'PDF', color: '#ef4444' },
  doc: { label: 'Word', color: '#2563eb' },
  docx: { label: 'Word', color: '#2563eb' },
  xls: { label: '表格', color: '#16a34a' },
  xlsx: { label: '表格', color: '#16a34a' },
  csv: { label: '表格', color: '#16a34a' },
  ppt: { label: '幻灯', color: '#ea580c' },
  pptx: { label: '幻灯', color: '#ea580c' },
  png: { label: '图片', color: '#0d9488' },
  jpg: { label: '图片', color: '#0d9488' },
  jpeg: { label: '图片', color: '#0d9488' },
  gif: { label: '图片', color: '#0d9488' },
  webp: { label: '图片', color: '#0d9488' },
  svg: { label: '图片', color: '#0d9488' },
  bmp: { label: '图片', color: '#0d9488' },
  zip: { label: '压缩包', color: '#9333ea' },
  rar: { label: '压缩包', color: '#9333ea' },
  '7z': { label: '压缩包', color: '#9333ea' },
  mp4: { label: '视频', color: '#db2777' },
  mov: { label: '视频', color: '#db2777' },
  mkv: { label: '视频', color: '#db2777' },
  mp3: { label: '音频', color: '#ca8a04' },
  wav: { label: '音频', color: '#ca8a04' },
  txt: { label: '文本', color: '#64748b' },
  md: { label: '文本', color: '#64748b' },
  _default: { label: '文件', color: '#64748b' },
}

const groups = computed(() => {
  const map = new Map()
  for (const f of reviewFiles) {
    const key = f.folder || '综合'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(f)
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'zh'))
    .map(([folder, items]) => ({
      folder,
      count: items.length,
      totalSize: items.reduce((s, f) => s + f.size, 0),
      items: items.slice().sort((a, b) => b.mtime.localeCompare(a.mtime)),
    }))
})

const totalCount = computed(() => reviewFiles.length)
const totalSize = computed(() => reviewFiles.reduce((s, f) => s + f.size, 0))

function typeOf(ext) {
  return TYPE_MAP[ext] || TYPE_MAP._default
}

function fmtSize(n) {
  if (n < 1024) return n + ' B'
  const units = ['KB', 'MB', 'GB']
  let v = n
  let i = -1
  do {
    v /= 1024
    i++
  } while (v >= 1024 && i < units.length - 1)
  return v.toFixed(v >= 100 ? 0 : 1) + ' ' + units[i]
}
</script>

<div class="rvf-page">
  <div class="rvf-stats" v-if="totalCount">
    <span class="rvf-stat">📂 {{ totalCount }} 个文件</span>
    <span class="rvf-stat">💾 共 {{ fmtSize(totalSize) }}</span>
    <span class="rvf-stat">🗂 {{ groups.length }} 个分类</span>
  </div>

  <div v-if="!totalCount" class="rvf-empty">
    <div class="rvf-empty-icon">📂</div>
    <p class="rvf-empty-title">还没有任何资料</p>
    <p class="rvf-empty-desc">把复习文件放入 <code>docs/public/review/</code> 后推送，即可自动出现在这里</p>
  </div>

  <section v-for="g in groups" :key="g.folder" class="rvf-group">
    <header class="rvf-group-head">
      <span class="rvf-group-name">{{ g.folder }}</span>
      <span class="rvf-group-meta">{{ g.count }} 个文件 · {{ fmtSize(g.totalSize) }}</span>
    </header>
    <a v-for="f in g.items" :key="f.url" :href="f.url" :download="f.name" class="rvf-file">
      <span class="rvf-badge" :style="{ color: typeOf(f.ext).color, borderColor: typeOf(f.ext).color + '55', background: typeOf(f.ext).color + '14' }">
        {{ typeOf(f.ext).label }}
      </span>
      <span class="rvf-info">
        <span class="rvf-name">{{ f.name }}</span>
        <span class="rvf-meta">{{ fmtSize(f.size) }} · 更新于 {{ f.mtime }}</span>
      </span>
      <span class="rvf-dl" aria-hidden="true">↓</span>
    </a>
  </section>

  <div class="rvf-tip">
    <b>如何上传资料：</b>将文件放入仓库的 <code>docs/public/review/</code> 目录（可按科目建子文件夹，如
    <code>review/计算机组成原理/</code>），提交并推送到 <code>main</code> 分支后，GitHub Actions
    会自动构建发布，文件即在本页列出，访问路径为 <code>/review/&lt;文件名&gt;</code>。
  </div>
</div>

<style>
.rvf-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 8px;
}

.rvf-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.rvf-stat {
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 5px 14px;
  border-radius: 14px;
  font-variant-numeric: tabular-nums;
}

.rvf-empty {
  text-align: center;
  padding: 48px 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}

.rvf-empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.rvf-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 6px;
}

.rvf-empty-desc {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0;
}

.rvf-group {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.rvf-group-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px 16px;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
}

.rvf-group-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.rvf-group-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.rvf-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: background-color 0.15s;
}

.rvf-file:last-child {
  border-bottom: none;
}

.rvf-file:hover {
  background: var(--vp-c-bg-alt);
}

.rvf-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid;
  letter-spacing: 0.02em;
}

.rvf-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rvf-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rvf-file:hover .rvf-name {
  color: var(--vp-c-brand-1);
}

.rvf-meta {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.rvf-dl {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
}

.rvf-file:hover .rvf-dl {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.rvf-tip {
  font-size: 13px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
}

.rvf-tip code {
  font-size: 12px;
}
</style>
