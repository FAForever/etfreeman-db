import { onMounted, onUnmounted, provide, ref } from 'vue'

export function useResizeWatcher(mobileThreshold = 1120) {
  const isMobile = ref(false)
  const resizeFunctions = ref(new Set([() => {
    const mobile = window.innerWidth < mobileThreshold
    document.body.classList.toggle('mobile', mobile)
    isMobile.value = mobile
  }]))

  const onResize = () => resizeFunctions.value.forEach(fn => fn())
  onResize()

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  provide('isMobile', isMobile)
  provide('resizeFunctions', resizeFunctions)

  return { isMobile, resizeFunctions }
}
