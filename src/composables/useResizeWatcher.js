import { onMounted, onUnmounted, provide, ref } from 'vue'
import { throttle } from './helpers/common.js'

export function useResizeWatcher(mobileThreshold = 1120, wideScreenThreshold = 2500) {
  const isMobile = ref(false)
  const isWideScreen = ref(false)
  const resizeFunctions = ref(new Set([() => {
    const mobile = window.innerWidth < mobileThreshold
    document.body.classList.toggle('mobile', mobile)
    isMobile.value = mobile
    isWideScreen.value = window.innerWidth >= wideScreenThreshold
  }]))

  const onResize = throttle(() => resizeFunctions.value.forEach(fn => fn()), 50)
  onResize()

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('isWideScreen', isWideScreen)
  provide('resizeFunctions', resizeFunctions)

  return { isMobile, isWideScreen, resizeFunctions }
}
