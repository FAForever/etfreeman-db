import { ref, nextTick, computed, reactive, onUnmounted } from 'vue'

const MAX_SHRINK_LEVEL = 12
const readySet = reactive(new Set())
const isGlobalReady = computed(() => {
  for (const readyRef of readySet)
    if (!readyRef.value) return false
  return true
})

export function useAutoShrinkTable(tableWrapRef, tableRef, weaponGroupRefs) {
  const currentShrinkLevel = ref(0)
  const expandedShrinkLevel = ref(null)
  const collapsedShrinkLevel = ref(null)
  const isReady = ref(false)

  readySet.add(isReady)
  onUnmounted(() => readySet.delete(isReady))

  const findShrinkLevel = async (initial = 0) => {
    const wrap = tableWrapRef.value
    const table = tableRef.value
    if (!wrap || !table) return MAX_SHRINK_LEVEL

    for (let level = initial; level <= MAX_SHRINK_LEVEL; level++) {
      currentShrinkLevel.value = level
      await new Promise(r => requestAnimationFrame(r))
      if (table.offsetWidth <= wrap.offsetWidth + 2) return level
    }
    return MAX_SHRINK_LEVEL
  }

  const setAllExpanded = async (expanded) => {
    const targetRefs = weaponGroupRefs.value.filter(r => r?.isExpanded !== expanded)
    targetRefs.forEach(r => r?.toggleExpanded())
    if (targetRefs.length) await nextTick()
    return targetRefs.length > 0
  }

  const optimizeTableWidth = async () => {
    await document.fonts.ready
    isReady.value = false

    await setAllExpanded(true)
    expandedShrinkLevel.value = await findShrinkLevel()

    await setAllExpanded(false)
    collapsedShrinkLevel.value = await findShrinkLevel(Math.max(0, expandedShrinkLevel.value - 3))

    isReady.value = true
  }

  const handleExpandChange = (isExpanded) => {
    if (expandedShrinkLevel.value === null || collapsedShrinkLevel.value === null) return
    currentShrinkLevel.value = isExpanded ? expandedShrinkLevel.value : collapsedShrinkLevel.value
  }

  return {
    currentShrinkLevel, isReady, isGlobalReady, optimizeTableWidth,
    handleExpandChange, expandedShrinkLevel, collapsedShrinkLevel
  }
}
