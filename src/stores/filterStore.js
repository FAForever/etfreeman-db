import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFilterStore = defineStore('filters', () => {
  const factions = ref(['UEF', 'Cybran', 'Aeon', 'Seraphim'])
  const kinds = ref([])
  const tech = ref([])
  const search = ref('')

  const matches = (unit) => {
    const factionMatch = !factions.value.length || factions.value.includes(unit.faction)
    const kindMatch = !kinds.value.length || kinds.value.includes(unit.kind)
    const techMatch = !tech.value.length || tech.value.includes(unit.tech)

    const searchValue = search.value.trim().toLowerCase()
    const textMatch = !searchValue || ['id', 'name', 'description', 'faction', 'kind']
      .some(field => unit[field]?.toLowerCase().includes(searchValue))

    return factionMatch && kindMatch && techMatch && textMatch
  }

  const toggleFaction = (faction) => {
    const idx = factions.value.indexOf(faction)
    idx >= 0 ? factions.value.splice(idx, 1) : factions.value.push(faction)
  }

  const toggleKind = (kind) => {
    const idx = kinds.value.indexOf(kind)
    idx >= 0 ? kinds.value.splice(idx, 1) : kinds.value.push(kind)
  }

  const toggleTech = (t) => {
    const idx = tech.value.indexOf(t)
    idx >= 0 ? tech.value.splice(idx, 1) : tech.value.push(t)
  }

  const effectiveVisibleFactions = computed(() =>
    !factions.value.length ? ['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'] : factions.value
  )

  return { factions, kinds, tech, search, effectiveVisibleFactions, matches, toggleFaction, toggleKind, toggleTech }
})
