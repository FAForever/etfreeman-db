import { onMounted, onUnmounted, provide, ref } from 'vue'
import { throttle } from './helpers/common.js'

export function useResizeWatcher(mobileThreshold = 1120) {
  const isMobile = ref(false)
  const resizeFunctions = ref(new Set([() => {
    const mobile = window.innerWidth < mobileThreshold
    document.body.classList.toggle('mobile', mobile)
    isMobile.value = mobile
  }]))

  const runResize = () => resizeFunctions.value.forEach(fn => fn())
  runResize()
  const onResize = throttle(runResize, 50)

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('resizeFunctions', resizeFunctions)

  return { isMobile, resizeFunctions }
}
