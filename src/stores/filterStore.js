import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSetSaver } from '@/composables/useSetSaver.js'

export const useFilterStore = defineStore('filters', () => {
  const factions = ref(new Set(['uef', 'cybran', 'aeon', 'seraphim']))
  const kinds = ref(new Set())
  const tech = ref(new Set())
  const search = ref('')
  const searchFields = useSetSaver('faf-search-fields', ['id', 'name', 'description', 'faction', 'kind'])

  const passesFilters = (unit) => {
    const factionMatch = !factions.value.size || factions.value.has(unit.faction)
    const kindMatch = !kinds.value.size || kinds.value.has(unit.kind)
    const techMatch = !tech.value.size || tech.value.has(unit.tech)

    const searchValue = search.value.trim().toLowerCase()
    const textMatch = !searchValue || [...searchFields.value]
      .some(field => Array.isArray(unit[field]) ?
                    unit[field].some(v => v.toLowerCase().includes(searchValue)) :
                    unit[field]?.toLowerCase().includes(searchValue))

    return factionMatch && kindMatch && techMatch && textMatch
  }

  const toggleFaction = (f) => factions.value.has(f) ? factions.value.delete(f) : factions.value.add(f)
  const toggleKind = (k) => kinds.value.has(k) ? kinds.value.delete(k) : kinds.value.add(k)
  const toggleTech = (t) => tech.value.has(t) ? tech.value.delete(t) : tech.value.add(t)
  const toggleSearchField = (f) => searchFields.value.has(f) ? searchFields.value.delete(f) : searchFields.value.add(f)

  const effectiveVisibleFactions = computed(() => factions.value.size ? [...factions.value] : ['uef', 'cybran', 'aeon', 'seraphim', 'nomads'])

  return {
    factions, kinds, tech, search, searchFields,
    effectiveVisibleFactions,
    passesFilters, toggleFaction, toggleKind, toggleTech, toggleSearchField
  }
})
