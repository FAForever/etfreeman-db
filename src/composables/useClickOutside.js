import { onMounted, onUnmounted } from 'vue'

export const useClickOutside = (target, fn) => {
  const handler = e => target.value && !target.value.contains(e.target) && fn()
  onMounted(() => document.addEventListener('click', handler))
  onUnmounted(() => document.removeEventListener('click', handler))
}
