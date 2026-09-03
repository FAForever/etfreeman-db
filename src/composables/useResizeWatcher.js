import { onMounted, onUnmounted, provide, ref } from 'vue'
import { throttle } from './helpers/common.js'

export function useResizeWatcher(mobileThreshold = 1120, wideScreenThreshold = 2500, ultraWideScreenThreshold = 3500) {
  const isMobile = ref(false)
  const isWideScreen = ref(false)
  const isUltraWideScreen = ref(false)
  const zoomModifier = ref(1)
  const pixelRatio = ref(window.devicePixelRatio)
  const resizeFunctions = ref(new Set([() => {
    const mobile = window.innerWidth < mobileThreshold
    document.body.classList.toggle('mobile', mobile)
    isMobile.value = mobile
    isWideScreen.value = window.innerWidth >= wideScreenThreshold
    isUltraWideScreen.value = window.innerWidth >= ultraWideScreenThreshold
    zoomModifier.value = isUltraWideScreen.value ? 1.74 : isWideScreen.value ? 1.2 : 1
    pixelRatio.value = window.devicePixelRatio
  }]))

  const onResize = throttle(() => resizeFunctions.value.forEach(fn => fn()), 50)
  onResize()

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('isWideScreen', isWideScreen)
  provide('isUltraWideScreen', isUltraWideScreen)
  provide('zoomModifier', zoomModifier)
  provide('resizeFunctions', resizeFunctions)
  provide('pixelRatio', pixelRatio)

  return { isMobile, isWideScreen, isUltraWideScreen, zoomModifier, resizeFunctions, pixelRatio }
}
