<template>
  <Teleport to="body">
    <Transition name="image-viewer">
      <div
        v-if="visible"
        class="image-viewer"
        role="dialog"
        aria-modal="true"
        :aria-label="alt || '图片预览'"
        @click.self="close"
      >
        <button class="image-viewer__close" type="button" aria-label="关闭图片预览" @click="close">
          &times;
        </button>
        <img class="image-viewer__image" :src="src" :alt="alt" @click.stop>
        <p v-if="alt" class="image-viewer__caption">{{ alt }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const visible = ref(false);
const src = ref('');
const alt = ref('');
let previousOverflow = '';

function open(image: HTMLImageElement) {
  src.value = image.currentSrc || image.src;
  alt.value = image.alt || '';
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  visible.value = true;
}

function close() {
  if (!visible.value) return;
  visible.value = false;
  document.body.style.overflow = previousOverflow;
}

function handleClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement) || !target.closest('.vp-doc')) return;
  if (target.closest('a')) event.preventDefault();
  open(target);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close();
}

onMounted(() => {
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClick);
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = previousOverflow;
});
</script>

<style scoped>
.image-viewer {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 56px 24px 44px;
  background: rgba(0, 0, 0, 0.86);
  cursor: zoom-out;
}

.image-viewer__image {
  display: block;
  max-width: min(94vw, 1600px);
  max-height: calc(100vh - 120px);
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  cursor: default;
}

.image-viewer__close {
  position: fixed;
  top: 16px;
  right: 18px;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.image-viewer__close:hover,
.image-viewer__close:focus-visible {
  background: rgba(255, 255, 255, 0.22);
  outline: 2px solid rgba(255, 255, 255, 0.7);
  outline-offset: 2px;
}

.image-viewer__caption {
  position: fixed;
  right: 24px;
  bottom: 14px;
  left: 24px;
  margin: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-viewer-enter-active,
.image-viewer-leave-active {
  transition: opacity 0.18s ease;
}

.image-viewer-enter-from,
.image-viewer-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .image-viewer {
    padding: 56px 12px 40px;
  }

  .image-viewer__image {
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 104px);
  }
}
</style>
