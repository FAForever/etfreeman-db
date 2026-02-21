import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { throttle } from './helpers/common.js'

export const useUnitsPerRow = (containerRef) => {
  const compareStore = useCompareStore()
  const unitsPerRow = ref(1)

  const calculate = () => {
    if (!containerRef.value) return
    const style = getComputedStyle(containerRef.value)
    const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
    const innerWidth = containerRef.value.clientWidth - paddingH
    const newUnitsPerRow = Math.max(1, Math.floor((innerWidth + compareStore.gap) / (compareStore.unitWidth + compareStore.gap)))
    if (newUnitsPerRow !== unitsPerRow.value) {
      unitsPerRow.value = newUnitsPerRow
    }
  }

  const resizeObserver = new ResizeObserver(throttle(calculate, 100))
  onUnmounted(() => resizeObserver.disconnect())
  onMounted(() => {
    resizeObserver.observe(containerRef.value)
    calculate()
  })

  watch(() => compareStore.unitWidth, calculate)

  return { unitsPerRow }
}
