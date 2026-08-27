<template>
  <div class="viz-embed" :class="{ 'viz-embed--dark': isDark }">
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      :title="title"
      loading="lazy"
      frameborder="0"
      allow="fullscreen"
      class="viz-embed__iframe"
      @load="onIframeLoad"
    ></iframe>
    <p v-if="caption" class="viz-embed__caption">▲ {{ caption }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  /** 可视化名称，对应 public/visualizers/ 下的子目录 */
  name: { type: String, required: true },
  /** URL 查询参数，如 "mode=pre&hideinput=1" */
  params: { type: String, default: '' },
  /** iframe 高度（像素） */
  height: { type: [String, Number], default: 560 },
  /** 图注文字 */
  caption: { type: String, default: '' },
  /** iframe title 无障碍属性 */
  title: { type: String, default: '交互式可视化' },
})

const { isDark, site } = useData()
const iframeRef = ref<HTMLIFrameElement | null>(null)

/** 构建 iframe src，自动处理 base 路径 */
const iframeSrc = computed(() => {
  const base = (site.value.base || '/').replace(/\/$/, '')
  const basePath = `${base}/visualizers/${props.name}/`
  return props.params ? `${basePath}?${props.params}` : basePath
})

/** iframe 加载后，同步当前暗色模式状态 */
function onIframeLoad() {
  postTheme(isDark.value)
}

/** 向 iframe 发送主题消息 */
function postTheme(dark: boolean) {
  const win = iframeRef.value?.contentWindow
  if (!win) return
  try {
    win.postMessage({ type: 'viz-theme', dark }, '*')
  } catch (e) {
    // cross-origin 等情况忽略
  }
}

/** 监听 VitePress 主题变化，同步到 iframe */
watch(isDark, (dark) => {
  postTheme(dark)
})

onMounted(() => {
  // 初始同步
  if (iframeRef.value?.contentWindow) {
    // iframe 可能还没加载完，load 事件里也会再发一次
    postTheme(isDark.value)
  }
})
</script>

<style scoped>
.viz-embed {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  transition: background 0.3s, box-shadow 0.3s;
}

.viz-embed--dark {
  background: #1e1e20;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
}

.viz-embed__iframe {
  display: block;
  width: 100%;
  border: none;
}

.viz-embed__caption {
  text-align: center;
  font-size: 13px;
  color: #909399;
  margin: 0;
  padding: 10px 16px 14px;
  line-height: 1.5;
}

.viz-embed--dark .viz-embed__caption {
  color: #6b7280;
}
</style>
