import { computed, inject } from 'vue'

export function useSmartIconScaling() {
  const zoomModifier = inject('zoomModifier')
  const pixelRatio = inject('pixelRatio')

  const iconsScaled = computed(() => (zoomModifier.value > 1) && new URLSearchParams(window.location.search).get('iconScaling'))
  const scaleRatio = computed(() => {
    let ratio = 2 / pixelRatio.value
    while (ratio <= 1) ratio *= 2
    while (ratio > 2) ratio /= 2
    return ratio
  })

  return { iconsScaled, scaleRatio }
}
