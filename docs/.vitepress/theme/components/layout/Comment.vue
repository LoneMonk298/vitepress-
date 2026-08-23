<template>
  <div id="comment-container"></div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted } from 'vue';
  import { useData } from 'vitepress';
  import { init } from '@waline/client';
  import '@waline/client/style';

  // 定义属性
  const props = defineProps({
    commentConfig: Object,
  });

  const data = reactive({
    type: props.commentConfig?.type ?? 'waline',
  })
  const { type } = toRefs(data);

  const { page } = useData();

  onMounted(() => {
    if (type.value === 'waline') {
      const config = props.commentConfig ?? {};
      init({
        el: '#comment-container',
        serverURL: config.serverURL,
        path: window.location.pathname,
        lang: 'zh-CN',
        dark: 'html.dark',
        pageview: true,
        comment: true,
        reaction: false,
      });
    }
  })
</script>

<style scoped></style>
