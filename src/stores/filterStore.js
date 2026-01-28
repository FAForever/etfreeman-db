import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFilterStore = defineStore('filters', () => {
  const factions = ref(new Set(['UEF', 'Cybran', 'Aeon', 'Seraphim']))
  const kinds = ref(new Set())
  const tech = ref(new Set())
  const search = ref('')

  const matches = (unit) => {
    const factionMatch = !factions.value.size || factions.value.has(unit.faction)
    const kindMatch = !kinds.value.size || kinds.value.has(unit.kind)
    const techMatch = !tech.value.size || tech.value.has(unit.tech)

    const searchValue = search.value.trim().toLowerCase()
    const textMatch = !searchValue || ['id', 'name', 'description', 'faction', 'kind']
      .some(field => unit[field]?.toLowerCase().includes(searchValue))

    return factionMatch && kindMatch && techMatch && textMatch
  }

  const toggleFaction = (f) => factions.value.has(f) ? factions.value.delete(f) : factions.value.add(f)
  const toggleKind = (k) => kinds.value.has(k) ? kinds.value.delete(k) : kinds.value.add(k)
  const toggleTech = (t) => tech.value.has(t) ? tech.value.delete(t) : tech.value.add(t)

  const effectiveVisibleFactions = computed(() => factions.value.size ? [...factions.value] : ['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'])

  return { factions, kinds, tech, search, effectiveVisibleFactions, matches, toggleFaction, toggleKind, toggleTech }
})
