import { ref } from "vue"

export function useContenders({ unitsMap }) {
  const contenders = ref(new Set())
  const updateContenders = (unitId, selected) => selected ? contenders.value.add(unitId) : contenders.value.delete(unitId)

  const toggleUnitSelection = (unitId) => {
    const unit = unitsMap.value[unitId]
    if (!unit) return
    unit.selected = !unit.selected
    updateContenders(unitId, unit.selected)
  }

  const setUnitSelection = (unitId, selected) => {
    const unit = unitsMap.value[unitId]
    if (!unit || unit.selected === selected) return
    toggleUnitSelection(unitId)
  }

  const clearSelection = () => {
    for (const id of contenders.value) {
      const unit = unitsMap.value[id]
      if (unit) unit.selected = false
    }
    contenders.value.clear()
  }

  return { contenders, toggleUnitSelection, setUnitSelection, clearSelection }
}