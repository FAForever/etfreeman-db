import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { decorateUnits } from './utils/unitDecorator/index.js'
import { generateTierTree, generateTypeTree } from './utils/categorizer.js'

export const useUnitDataStore = defineStore('unitData', () => {
  const units = ref([])
  const unitsMap = ref({})
  const version = ref(null)
  const contenders = ref([])

  const selectedFilterFactions = ref(['UEF', 'Cybran', 'Aeon', 'Seraphim'])
  const selectedFilterKinds = ref([])
  const selectedFilterTech = ref([])
  const textFilter = ref('')

  const lastListViewRoute = ref('/')

  const toggleArrayItem = (arr, item) => {
    const idx = arr.indexOf(item)
    idx >= 0 ? arr.splice(idx, 1) : arr.push(item)
  }

  const visibleUnits = computed(() => {
    return units.value.filter(unit => {
      const factionMatch = !selectedFilterFactions.value.length || selectedFilterFactions.value.includes(unit.faction)
      const kindMatch = !selectedFilterKinds.value.length || selectedFilterKinds.value.includes(unit.kind)
      const techMatch = !selectedFilterTech.value.length || selectedFilterTech.value.includes(unit.tech)

      const search = textFilter.value.trim().toLowerCase()
      const textMatch = !search || ['id', 'name', 'description', 'faction', 'kind']
        .some(field => unit[field]?.toLowerCase().includes(search))

      return factionMatch && kindMatch && techMatch && textMatch
    })
  })

  const tierTree = computed(() => generateTierTree(visibleUnits.value))
  const typeTree = computed(() => generateTypeTree(visibleUnits.value))

  const setData = (index) => {
    units.value = decorateUnits(index.units || [])
    version.value = index.version || null

    unitsMap.value = {}
    for (const unit of units.value) {
      unitsMap.value[unit.Id] = unit
    }
  }

  const toggleFaction = (faction) => toggleArrayItem(selectedFilterFactions.value, faction)
  const toggleKind = (kind) => toggleArrayItem(selectedFilterKinds.value, kind)
  const toggleTech = (tech) => toggleArrayItem(selectedFilterTech.value, tech)

  const updateContenders = (unitId, selected) => {
    const idx = contenders.value.indexOf(unitId)
    selected ? (idx === -1 && contenders.value.push(unitId)) : (idx >= 0 && contenders.value.splice(idx, 1))
  }

  const toggleUnitSelection = (unitId) => {
    const unit = units.value.find(u => u.id === unitId)
    if (!unit) return
    unit.selected = !unit.selected
    updateContenders(unitId, unit.selected)
  }

  const setUnitSelection = (unitId, selected) => {
    const unit = units.value.find(u => u.id === unitId)
    if (!unit) return
    unit.selected = selected
    updateContenders(unitId, selected)
  }

  const clearSelection = () => {
    units.value.forEach(unit => unit.selected = false)
    contenders.value.length = 0
  }

  const loadData = () => {
    const baseUrl = import.meta.env.BASE_URL
    const dataUrl = window.location.search.includes('fat') ? `${baseUrl}data/index.fat.json` : `${baseUrl}data/index.json`

    return fetch(dataUrl)
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => {
        console.error('Failed to load unit data:', error)
        throw error
      })
  }

  return {
    version,
    contenders,
    selectedFilterFactions,
    selectedFilterKinds,
    selectedFilterTech,
    textFilter,
    lastListViewRoute: computed({
      get: () => lastListViewRoute.value,
      set: (val) => lastListViewRoute.value = val
    }),

    units,
    unitsMap,
    tierTree,
    typeTree,
    visibleUnits,

    setData,
    toggleFaction,
    toggleKind,
    toggleTech,
    toggleUnitSelection,
    setUnitSelection,
    clearSelection,
    loadData
  }
})