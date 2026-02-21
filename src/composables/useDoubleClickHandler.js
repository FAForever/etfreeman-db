import { ref } from 'vue'

const maxDoubleClickDelay = 200

export function useDoubleClickHandler(toggleUnitSelection, contenders, router) {
  const lastClickTime = ref(0)
  const lastClickUnit = ref(null)

  const handleUnitClick = (unit) => {
    const now = performance.now()
    const isDoubleClick = lastClickUnit.value === unit && (now - lastClickTime.value) < maxDoubleClickDelay

    if (isDoubleClick) {
      if (!unit.selected) toggleUnitSelection(unit)
      router.push('/' + [...contenders.value].join(','))
    } else {
      lastClickUnit.value = unit
      lastClickTime.value = now
      toggleUnitSelection(unit)
    }
  }

  return { handleUnitClick }
}
