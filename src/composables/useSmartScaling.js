import { computed, ref, watchEffect, provide } from 'vue'
import { storageBool } from './helpers/common'

export function useSmartScaling({ resizeFunctions, windowWidth }) {
  const manualZoomModifier = ref(localStorage.getItem('zoomModifier') - 0)
  const autoZoom = computed(() => {
    if (windowWidth.value >= 3500) return 1.74
    return windowWidth.value >= 2500 ? 1.2 : 1
  })
  const zoomModifier = computed(() => manualZoomModifier.value || autoZoom.value)
  const iconsScaled = ref(storageBool[localStorage.getItem('iconsScaled')] ?? false)
  const scalingDown = ref(storageBool[localStorage.getItem('scalingDown')] ?? false)
  const pixelRatio = ref(window.devicePixelRatio)

  resizeFunctions.value.callAndAdd(() => pixelRatio.value = window.devicePixelRatio)

  const scaleBorders = computed(() => scalingDown.value ? [0.5, 1] : [1, 2])

  const scaleRatio = computed(() => {
    const [min, max] = scaleBorders.value
    let ratio = 2 / pixelRatio.value
    while (ratio < min) ratio *= 2
    while (ratio >= max) ratio /= 2
    return ratio
  })

  watchEffect(() => {
    document.documentElement.style.setProperty('--app-zoom', zoomModifier.value)
    if (iconsScaled.value) {
      document.documentElement.style.setProperty('--icon-scale-ratio', scaleRatio.value)
      document.documentElement.style.setProperty('--icon-rendering', 'pixelated')
      if (scaleRatio.value >= 0.7 && scaleRatio.value <= 1.3) {
        document.documentElement.style.setProperty('--secondary-icon-scaling', scaleRatio.value)
      } else {
        document.documentElement.style.removeProperty('--secondary-icon-scaling')
      }
    } else {
      document.documentElement.style.removeProperty('--icon-scale-ratio')
      document.documentElement.style.removeProperty('--secondary-icon-scaling')
      document.documentElement.style.removeProperty('--icon-rendering')
    }
  })

  watchEffect(() => {
    if (manualZoomModifier.value) localStorage.setItem('zoomModifier', manualZoomModifier.value)
    else localStorage.removeItem('zoomModifier')
    localStorage.setItem('iconsScaled', iconsScaled.value)
    localStorage.setItem('scalingDown', scalingDown.value)
  })

  provide('iconsScaled', iconsScaled)
  provide('scalingDown', scalingDown)
  provide('scaleRatio', scaleRatio)
  provide('zoomModifier', zoomModifier)
  provide('manualZoomModifier', manualZoomModifier)
  provide('autoZoom', autoZoom)

  return { iconsScaled, scalingDown, scaleRatio, zoomModifier, manualZoomModifier, autoZoom }
}
