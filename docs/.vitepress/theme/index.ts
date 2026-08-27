import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue';
import VizEmbed from './components/VizEmbed.vue';
import './styles/vars.css';
import './styles/custom.css';
import axios from 'axios';
import api from './api/index';

const scrollStoragePrefix = 'vitepress:scroll:';

function scrollStorageKey(path = window.location.pathname + window.location.search) {
  return `${scrollStoragePrefix}${path}`;
}

function saveReadingPosition() {
  sessionStorage.setItem(scrollStorageKey(), String(Math.round(window.scrollY)));
}

function restoreReadingPosition(to?: string) {
  const url = new URL(to || window.location.href, window.location.origin);
  if (url.hash) return;

  const storedPosition = sessionStorage.getItem(scrollStorageKey(url.pathname + url.search));
  if (storedPosition === null) return;

  const position = Number(storedPosition);
  if (!Number.isFinite(position)) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo({ top: position, behavior: 'auto' }));
  });
}

export default {
  ...DefaultTheme,
  Layout: MyLayout,
  enhanceApp(ctx) {
    // extend default theme custom behaviour.
    DefaultTheme.enhanceApp(ctx);

    // 全局挂载 API 接口
    ctx.app.config.globalProperties.$http = axios
    if (typeof window !== 'undefined') {
      window.$api = api;
      history.scrollRestoration = 'manual';

      let scrollTimer: number | undefined;
      window.addEventListener('scroll', () => {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(saveReadingPosition, 120);
      }, { passive: true });
      window.addEventListener('pagehide', saveReadingPosition);

      const beforeRouteChange = ctx.router.onBeforeRouteChange;
      ctx.router.onBeforeRouteChange = async (to) => {
        saveReadingPosition();
        return beforeRouteChange?.(to);
      };

      const afterRouteChange = ctx.router.onAfterRouteChange;
      ctx.router.onAfterRouteChange = async (to) => {
        await afterRouteChange?.(to);
        restoreReadingPosition(to);
      };

      window.setTimeout(() => restoreReadingPosition(), 0);
    }

    // register your custom global components
    ctx.app.component('VizEmbed', VizEmbed)
  }
}
