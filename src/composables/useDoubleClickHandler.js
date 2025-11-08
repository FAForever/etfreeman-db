import { ref } from 'vue'

export function useDoubleClickHandler(toggleUnitSelection, contenders, router) {
  const lastClickTime = ref(0)
  const lastClickUnit = ref(null)
  const maxDoubleClickDelay = 500

  const handleUnitClick = (unit, event) => {
    if (event.ctrlKey) {
      window.open('#/' + unit.id, '_blank')
      return
    }

    const now = performance.now()
    const isDoubleClick = lastClickUnit.value === unit && (now - lastClickTime.value) < maxDoubleClickDelay

    if (isDoubleClick) {
      if (!unit.selected) toggleUnitSelection(unit.id)
      router.push('/' + contenders.value.join(','))
    } else {
      lastClickUnit.value = unit
      lastClickTime.value = now
      toggleUnitSelection(unit.id)
    }
  }

  return { handleUnitClick }
}
