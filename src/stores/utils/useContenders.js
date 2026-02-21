import { ref } from 'vue'

export function useContenders({ unitsMap }) {
  const contenders = ref(new Set())
  const updateContenders = (unitId, selected) => selected ? contenders.value.add(unitId) : contenders.value.delete(unitId)

  const toggleUnitSelection = (unit) => {
    unit.selected = !unit.selected
    updateContenders(unit.id, unit.selected)
  }

  const setUnitSelection = (unit, selected) => {
    if (unit.selected === selected) return
    toggleUnitSelection(unit)
  }

  const clearSelection = () => {
    for (const id of contenders.value) {
      const unit = unitsMap.value[id]
      if (unit) unit.selected = false
    }
    contenders.value.clear()
  }

  const smartSelect = (units) => {
    if (!units?.length) return
    const unselected = units.filter(u => !u.selected);
    (unselected.length ? unselected : units)
      .forEach(toggleUnitSelection)
  }

  return { contenders, toggleUnitSelection, setUnitSelection, clearSelection, smartSelect }
}