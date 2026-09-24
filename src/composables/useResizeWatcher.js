import { onMounted, onUnmounted, provide, ref } from 'vue'
import { throttle } from './helpers/common.js'

export function useResizeWatcher(mobileThreshold = 1140) {
  const isMobile = ref(false)
  const windowWidth = ref(window.innerWidth)

  const resizeFunctions = ref(new Set([() => {
    const mobile = window.innerWidth < mobileThreshold
    document.body.classList.toggle('mobile', mobile)
    isMobile.value = mobile
    windowWidth.value = window.innerWidth
  }]))
  resizeFunctions.value.callAndAdd = fn => { fn(); resizeFunctions.value.add(fn) }
  const onResize = throttle(() => resizeFunctions.value.forEach(fn => fn()), 50)
  onResize()

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('resizeFunctions', resizeFunctions)

  return { isMobile, windowWidth, resizeFunctions}
}
