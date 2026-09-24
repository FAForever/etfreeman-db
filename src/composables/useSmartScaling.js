import { computed, ref, watchEffect, provide } from 'vue'
import { storageBool } from './helpers/common'

export function useSmartScaling({ resizeFunctions, windowWidth }) {
  const style = document.documentElement.style
  const manualZoomModifier = ref(localStorage.getItem('zoomModifier') - 0)
  const autoZoom = computed(() => {
    if (windowWidth.value >= 3500) return 1.74
    return windowWidth.value >= 2500 ? 1.2 : 1
  })
  const zoomModifier = computed(() => manualZoomModifier.value || autoZoom.value)
  const manualIconScaling = ref(storageBool[localStorage.getItem('iconsScaled')])
  const manualScalingDown = ref(storageBool[localStorage.getItem('scalingDown')] ?? false)
  const pixelRatio = ref(window.devicePixelRatio)

  resizeFunctions.value.callAndAdd(() => pixelRatio.value = window.devicePixelRatio)

  const normalize = (ratio, min, max) => {
    while (ratio < min) ratio *= 2
    while (ratio >= max) ratio /= 2
    return ratio
  }

  const ratios = computed(() => {
    const base = 2 / pixelRatio.value
    return { up: normalize(base, 1, 2), down: normalize(base, 0.5, 1) }
  })

  const autoIconScaling = computed(() => ratios.value.up <= 1.3 || ratios.value.down >= 0.85)
  const autoScalingDown = computed(() => ratios.value.up > 1.3)

  const iconsScaled = computed(() => manualIconScaling.value ?? autoIconScaling.value)
  const scalingDown = computed(() => manualIconScaling.value ? manualScalingDown.value : autoScalingDown.value)

  const scaleRatio = computed(() => scalingDown.value ? ratios.value.down : ratios.value.up)
  
  watchEffect(() => {
    style.setProperty('--app-zoom', zoomModifier.value)
    if (iconsScaled.value) {
      style.setProperty('--icon-scale-ratio', scaleRatio.value)
      style.setProperty('--icon-rendering', 'pixelated')
      if (scaleRatio.value >= 0.7 && scaleRatio.value <= 1.3) {
        style.setProperty('--secondary-icon-scaling', scaleRatio.value)
      } else {
        style.removeProperty('--secondary-icon-scaling')
      }
    } else {
      style.removeProperty('--icon-scale-ratio')
      style.removeProperty('--secondary-icon-scaling')
      style.removeProperty('--icon-rendering')
    }
  })

  watchEffect(() => {
    if (manualZoomModifier.value) localStorage.setItem('zoomModifier', manualZoomModifier.value)
    else localStorage.removeItem('zoomModifier')
    if (manualIconScaling.value == null) localStorage.removeItem('iconsScaled')
    else localStorage.setItem('iconsScaled', manualIconScaling.value)
    localStorage.setItem('scalingDown', manualScalingDown.value)
  })

  provide('iconsScaled', iconsScaled)
  provide('scalingDown', scalingDown)
  provide('scaleRatio', scaleRatio)
  provide('manualIconScaling', manualIconScaling)
  provide('manualScalingDown', manualScalingDown)
  provide('zoomModifier', zoomModifier)
  provide('manualZoomModifier', manualZoomModifier)
  provide('autoZoom', autoZoom)

  return { iconsScaled, scalingDown, scaleRatio, zoomModifier, manualZoomModifier, autoZoom }
}
