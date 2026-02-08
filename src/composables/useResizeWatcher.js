import { onMounted, onUnmounted, provide, ref } from 'vue'

export function useResizeWatcher(mobileThreshold = 1120) {
  const isMobile = ref(false)
  const resizeFunctions = ref(new Set([() => {
    if (window.innerWidth < mobileThreshold) {
      document.body.classList.add('mobile')
      isMobile.value = true
    } else {
      document.body.classList.remove('mobile')
      isMobile.value = false
    }
  }]))

  const onResize = () => resizeFunctions.value.forEach(fn => fn())
  onResize()

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('resizeFunctions', resizeFunctions)

  return { isMobile, resizeFunctions }
}
