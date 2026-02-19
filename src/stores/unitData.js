import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { decorateUnits } from './utils/unitDecorator/decorator.js'
import { generateTierTree, generateTypeTree } from './utils/categorizer.js'
import { useFilterStore } from './filterStore.js'
import { useContenders } from './utils/useContenders.js'

export const useUnitDataStore = defineStore('unitData', () => {
  const units = ref([])
  const unitsMap = ref({})
  const version = ref(null)
  const unitDefauls = ref(null)
  const filterStore = useFilterStore()

  const visibleUnits = computed(() => units.value.filter(u => filterStore.matches(u)))

  const tierTree = computed(() => generateTierTree(visibleUnits.value))
  const typeTree = computed(() => generateTypeTree(visibleUnits.value))

  const { contenders, toggleUnitSelection, setUnitSelection, clearSelection, smartSelect } = useContenders({ unitsMap })

  const setData = (json) => {
    units.value = decorateUnits(json.units || [])
    version.value = json.version || null
    unitDefauls.value = {
      shieldDefaultOverspill: json.shieldDefaultOverspill,
      shieldDefaultRechargeTime: json.shieldDefaultRechargeTime,
      techToVetMultipliers: json.techToVetMultipliers || {},
      veterancyRegenBuffs: json.veterancyRegenBuffs || [],
      wreckageTechMassMults: json.wreckageTechMassMults || {},
      wreckageWaterMult: json.wreckageWaterMult || 0.6
    }

    unitsMap.value = {}
    for (const unit of units.value) {
      unitsMap.value[unit.Id] = unit
    }
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
    unitDefauls,
    contenders,
    units,
    unitsMap,
    tierTree,
    typeTree,
    visibleUnits,

    setData,
    toggleUnitSelection,
    setUnitSelection,
    clearSelection,
    smartSelect,
    loadData
  }
})