<template>
  <div
    class="viz-embed"
    :class="{
      'viz-embed--dark': isDark,
      'viz-embed--collapsed': collapsed && !isFullscreen,
      'viz-embed--fullscreen': isFullscreen,
    }"
  >
    <!-- Header bar -->
    <div class="viz-embed__header">
      <button class="viz-embed__toggle" @click="toggleCollapse">
        <span class="viz-embed__toggle-icon" :class="{ 'is-open': !collapsed }">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
        <span class="viz-embed__title">{{ title }}</span>
        <span v-if="collapsed && !isFullscreen" class="viz-embed__hint">点击展开</span>
      </button>
      <div class="viz-embed__actions">
        <button
          class="viz-embed__action-btn"
          title="全屏"
          @click="toggleFullscreen"
        >
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
            <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
            <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Iframe body -->
    <div class="viz-embed__body" v-show="!collapsed || isFullscreen" :style="bodyStyle">
      <iframe
        v-if="!iframeError"
        ref="iframeRef"
        :src="iframeSrc"
        :title="title"
        :loading="isFullscreen ? 'eager' : 'lazy'"
        frameborder="0"
        allow="fullscreen"
        class="viz-embed__iframe"
        @load="onIframeLoad"
        @error="onIframeError"
      ></iframe>
      <div v-else class="viz-embed__error">
        <p>⚠️ 可视化加载失败</p>
        <p class="viz-embed__error-path">{{ iframeSrc }}</p>
      </div>
      <p v-if="caption && !isFullscreen" class="viz-embed__caption">▲ {{ caption }}</p>
      <!-- 源码下载 / 新窗口预览链接条（需 show-source 开启，全屏时隐藏） -->
      <div v-if="showSource && !isFullscreen" class="viz-embed__source-bar">
        <a
          class="viz-embed__source-btn viz-embed__source-btn--primary"
          :href="sourceUrl"
          :download="downloadFile"
          :target="isExternalSource ? '_blank' : undefined"
          :rel="isExternalSource ? 'noopener' : undefined"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>下载源码</span>
        </a>
        <a
          class="viz-embed__source-btn viz-embed__source-btn--ghost"
          :href="sourceUrl"
          target="_blank"
          rel="noopener"
        >
          <span>新窗口预览</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  /** 可视化名称，对应 public/visualizers/ 下的子目录 */
  name: { type: String, required: true },
  /** URL 查询参数，如 "mode=pre&hideinput=1" */
  params: { type: String, default: '' },
  /** iframe 高度（像素），展开状态下 */
  height: { type: [String, Number], default: 560 },
  /** 图注文字 */
  caption: { type: String, default: '' },
  /** 标题（显示在顶栏） */
  title: { type: String, default: '交互式可视化' },
  /** 默认是否折叠 */
  collapsed: { type: Boolean, default: false },
  /** 是否显示"下载源码 / 新窗口预览"链接条（默认关闭，需要时在文章中传 show-source 开启） */
  showSource: { type: Boolean, default: false },
  /** 源码/下载链接，默认自动指向 public/visualizers/<name>/index.html */
  sourceHref: { type: String, default: '' },
  /** 下载源码时保存的文件名 */
  downloadName: { type: String, default: '' },
})

const emit = defineEmits(['expand', 'collapse', 'fullscreen-change'])

const { isDark } = useData()
const iframeRef = ref<HTMLIFrameElement | null>(null)
const collapsed = ref(props.collapsed)
const isFullscreen = ref(false)
const iframeError = ref(false)

/** Vite 提供的 base 路径，兼容子目录部署 */
const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

/** 构建 iframe src — 直接指向 index.html，避免目录索引问题 */
const iframeSrc = computed(() => {
  const basePath = `${baseUrl}/visualizers/${props.name}/index.html`
  return props.params ? `${basePath}?${props.params}` : basePath
})

/** 兜底路径：如果 index.html 404，尝试不带 index.html 的目录路径 */
const fallbackSrc = computed(() => {
  const basePath = `${baseUrl}/visualizers/${props.name}/`
  return props.params ? `${basePath}?${props.params}` : basePath
})

/** 源码链接：未显式传入时自动指向原型 index.html */
const sourceUrl = computed(() => props.sourceHref || `${baseUrl}/visualizers/${props.name}/index.html`)

/** 下载保存的文件名：未显式传入时用 <name>.html */
const downloadFile = computed(() => props.downloadName || `${props.name}.html`)

/** 是否为外站链接：跨域时 download 属性无效，自动改为新标签页打开 */
const isExternalSource = computed(() => /^https?:\/\//i.test(sourceUrl.value))

const bodyStyle = computed(() => {
  if (isFullscreen.value) {
    return { maxHeight: '100%', opacity: '1' }
  }
  return { maxHeight: 'none', opacity: '1' }
})

function toggleCollapse() {
  if (isFullscreen.value) return
  collapsed.value = !collapsed.value
  emit(collapsed.value ? 'collapse' : 'expand')
  if (!collapsed.value) {
    nextTick(() => {
      postTheme(isDark.value)
    })
  }
}

function toggleFullscreen() {
  if (!isFullscreen.value) {
    enterFullscreen()
  } else {
    exitFullscreen()
  }
}

/** 进入自定义全屏（不是浏览器原生 fullscreen API，而是覆盖视口） */
function enterFullscreen() {
  isFullscreen.value = true
  collapsed.value = false
  document.body.style.overflow = 'hidden'
  emit('fullscreen-change', true)
  nextTick(() => postTheme(isDark.value))
}

function exitFullscreen() {
  isFullscreen.value = false
  document.body.style.overflow = ''
  emit('fullscreen-change', false)
  nextTick(() => postTheme(isDark.value))
}

/** ESC 键退出全屏 */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    exitFullscreen()
  }
}

/** iframe 加载后，同步当前暗色模式状态 */
function onIframeLoad() {
  postTheme(isDark.value)
}

/** iframe 加载失败（很少触发，因为 404 也是有效页面） */
function onIframeError() {
  iframeError.value = true
}

/** 向 iframe 发送主题消息 */
function postTheme(dark: boolean) {
  const win = iframeRef.value?.contentWindow
  if (!win) return
  try {
    win.postMessage({ type: 'viz-theme', dark }, '*')
  } catch (e) {
    // ignore
  }
}

/** 监听 VitePress 主题变化，同步到 iframe */
watch(isDark, (dark) => {
  postTheme(dark)
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // 检查可视化文件是否存在，提前发现 404
  if (!collapsed.value) {
    fetch(iframeSrc.value, { method: 'HEAD' })
      .then(res => {
        if (!res.ok) {
          iframeError.value = true
          console.warn('[VizEmbed] 可视化文件不存在:', iframeSrc.value)
        }
      })
      .catch(() => {
        // 跨域等情况忽略，iframe 仍会尝试加载
      })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.viz-embed {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  background: var(--vp-c-bg-soft, #ffffff);
  border: 1px solid var(--vp-c-divider-light, #e9ecef);
  transition: box-shadow 0.2s;
}

.viz-embed:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Header */
.viz-embed__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 0 14px;
  height: 40px;
  background: var(--vp-c-bg-soft, #f8f9fa);
  border-bottom: 1px solid var(--vp-c-divider-light, #e9ecef);
  user-select: none;
}

.viz-embed__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  color: var(--vp-c-text-1, #343a40);
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.viz-embed__toggle:hover {
  background: var(--vp-c-bg-mute, #e9ecef);
}

.viz-embed__toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  color: var(--vp-c-text-3, #868e96);
}

.viz-embed__toggle-icon.is-open {
  transform: rotate(180deg);
}

.viz-embed__title {
  font-size: 13px;
}

.viz-embed__hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--vp-c-text-3, #adb5bd);
  margin-left: 4px;
}

/* Actions */
.viz-embed__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.viz-embed__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-2, #495057);
  cursor: pointer;
  transition: all 0.2s;
}

.viz-embed__action-btn:hover {
  background: var(--vp-c-brand-soft, #d3f9d8);
  color: var(--vp-c-brand-1, #2f9e44);
}

/* Body */
.viz-embed__body {
  overflow: hidden;
}

.viz-embed__iframe {
  display: block;
  width: 100%;
  border: none;
  height: v-bind('props.height + "px"');
}

.viz-embed__caption {
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-2, #868e96);
  margin: 0;
  padding: 10px 16px 14px;
  line-height: 1.5;
}

/* ===== 源码下载 / 预览链接条 ===== */
.viz-embed__source-bar {
  display: flex;
  gap: 10px;
  padding: 0 16px 16px;
}

.viz-embed__source-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease,
    border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.viz-embed__source-btn svg {
  flex-shrink: 0;
}

/* 主按钮：品牌绿渐变 + 投影 */
.viz-embed__source-btn--primary {
  background: linear-gradient(135deg, var(--vp-c-brand-1, #2f9e44), var(--vp-c-brand-2, #37b24d));
  color: #fff;
  box-shadow: 0 2px 8px rgba(47, 158, 68, 0.25);
}

.viz-embed__source-btn--primary:hover {
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(47, 158, 68, 0.4);
}

/* 次按钮：透明底 + 描边 */
.viz-embed__source-btn--ghost {
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-2, #495057);
  border: 1px solid var(--vp-c-divider, #dee2e6);
}

.viz-embed__source-btn--ghost:hover {
  color: var(--vp-c-brand-1, #2f9e44);
  border-color: var(--vp-c-brand-1, #2f9e44);
  background: var(--vp-c-brand-soft, #d3f9d8);
}

/* 窄屏：两个按钮上下堆叠，避免文字挤压 */
@media (max-width: 480px) {
  .viz-embed__source-bar {
    flex-direction: column;
  }
}

/* Error state */
.viz-embed__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--vp-c-text-2, #868e96);
  font-size: 14px;
  gap: 8px;
}

.viz-embed__error-path {
  font-size: 12px;
  font-family: monospace;
  color: var(--vp-c-text-3, #adb5bd);
  background: var(--vp-c-bg-mute, #f1f3f5);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
  max-width: 90%;
}

/* Collapsed state */
.viz-embed--collapsed {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* Fullscreen state */
.viz-embed--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  border-radius: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: var(--vp-c-bg, #ffffff);
}

.viz-embed--fullscreen .viz-embed__header {
  height: 48px;
  padding: 0 10px 0 18px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--vp-c-divider, #dee2e6);
  background: var(--vp-c-bg-soft, #f8f9fa);
}

.viz-embed--fullscreen .viz-embed__title {
  font-size: 14px;
}

.viz-embed--fullscreen .viz-embed__toggle {
  cursor: default;
}

.viz-embed--fullscreen .viz-embed__toggle:hover {
  background: transparent;
}

.viz-embed--fullscreen .viz-embed__toggle-icon {
  display: none;
}

.viz-embed--fullscreen .viz-embed__action-btn {
  width: 36px;
  height: 36px;
}

.viz-embed--fullscreen .viz-embed__body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viz-embed--fullscreen .viz-embed__iframe {
  flex: 1;
  height: auto;
  min-height: 0;
}

/* Dark mode overrides */
.viz-embed--dark {
  background: var(--vp-c-bg-soft, #1e1e20);
  border-color: var(--vp-c-divider, #3a3d44);
}

.viz-embed--dark .viz-embed__header {
  background: var(--vp-c-bg-mute, #252529);
  border-color: var(--vp-c-divider, #3a3d44);
}

.viz-embed--dark .viz-embed__action-btn:hover {
  background: var(--vp-c-brand-soft, rgba(47,158,68,0.2));
}
</style>
