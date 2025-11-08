import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUnitDataStore } from '../stores/unitData.js'

export function useUnitData() {
  const store = useUnitDataStore()
  const { units, visibleUnits, contenders, version, selectedFilterFactions, selectedFilterKinds, selectedFilterTech, textFilter } = storeToRefs(store)

  return {
    units,
    visibleUnits,
    contenders,
    version,
    selectedFactions: selectedFilterFactions,
    selectedKinds: selectedFilterKinds,
    selectedTech: selectedFilterTech,
    textFilter,

    loadData: store.loadData,
    toggleFaction: store.toggleFaction,
    toggleKind: store.toggleKind,
    toggleTech: store.toggleTech,
    toggleUnitSelection: store.toggleUnitSelection,
    setUnitSelection: store.setUnitSelection,
    clearSelection: store.clearSelection,

    isFactionSelected: (faction) => selectedFilterFactions.value.includes(faction),
    isKindSelected: (kind) => selectedFilterKinds.value.includes(kind),
    isTechSelected: (tech) => selectedFilterTech.value.includes(tech),

    effectiveVisibleFactions: computed(() =>
      !selectedFilterFactions.value.length ? ['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'] : selectedFilterFactions.value
    ),

    strain: (unit) =>
      (!selectedFilterFactions.value.length || selectedFilterFactions.value.includes(unit.faction)) &&
      (!selectedFilterKinds.value.length || selectedFilterKinds.value.includes(unit.classification)) &&
      (!selectedFilterTech.value.length || selectedFilterTech.value.includes(unit.tech))
  }
}