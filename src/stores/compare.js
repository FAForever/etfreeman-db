import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'faf-compare-v3'

const defaultSettings = {
  showedSections: {
    Defense: true,
    Economy: true,
    Offense: true,
    Physics: true,
    Abilities: true,
    Intel: true,
    Transport: true,
    Veterancy: true,
    Wreckage: true,
    Enhancements: true
  },
  showUnitId: false,
  enhancementsTabs: true,
  highlightGroupedWeapons: true,
  compactSections: true,
  linedUpSections: true,
  minorWeaponStats: {
    MuzzleVelocity: true,
    FiringTolerance: true,
    Yaw: false
  }
}

export const useCompareStore = defineStore('compare', () => {
  const showedSections = ref({ ...defaultSettings.showedSections })
  const filterOpen = ref(false)
  const settingsOpen = ref(false)

  const showUnitId = ref(defaultSettings.showUnitId)
  const enhancementsTabs = ref(defaultSettings.enhancementsTabs)
  const highlightGroupedWeapons = ref(defaultSettings.highlightGroupedWeapons)
  const compactSections = ref(defaultSettings.compactSections)
  const linedUpSections = ref(defaultSettings.linedUpSections)

  const minorWeaponStats = {
    MuzzleVelocity: ref(defaultSettings.minorWeaponStats.MuzzleVelocity),
    FiringTolerance: ref(defaultSettings.minorWeaponStats.FiringTolerance),
    Yaw: ref(defaultSettings.minorWeaponStats.Yaw)
  }

  const toggleSection = (section) => {
    showedSections.value[section] = !showedSections.value[section]
  }

  const toggleFilter = () => {
    filterOpen.value = !filterOpen.value
  }

  const toggleSettings = () => {
    settingsOpen.value = !settingsOpen.value
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      showedSections: showedSections.value,
      showUnitId: showUnitId.value,
      enhancementsTabs: enhancementsTabs.value,
      highlightGroupedWeapons: highlightGroupedWeapons.value,
      compactSections: compactSections.value,
      linedUpSections: linedUpSections.value,
      minorWeaponStats: {
        MuzzleVelocity: minorWeaponStats.MuzzleVelocity.value,
        FiringTolerance: minorWeaponStats.FiringTolerance.value,
        Yaw: minorWeaponStats.Yaw.value
      }
    }))
  }

  const loadStored = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const data = JSON.parse(stored)
      if (data.showedSections) Object.assign(showedSections.value, data.showedSections)
      if (data.showUnitId !== undefined) showUnitId.value = data.showUnitId
      if (data.enhancementsTabs !== undefined) enhancementsTabs.value = data.enhancementsTabs
      if (data.highlightGroupedWeapons !== undefined) highlightGroupedWeapons.value = data.highlightGroupedWeapons
      if (data.compactSections !== undefined) compactSections.value = data.compactSections
      if (data.linedUpSections !== undefined) linedUpSections.value = data.linedUpSections
      if (data.minorWeaponStats) {
        if (data.minorWeaponStats.MuzzleVelocity !== undefined) minorWeaponStats.MuzzleVelocity.value = data.minorWeaponStats.MuzzleVelocity
        if (data.minorWeaponStats.FiringTolerance !== undefined) minorWeaponStats.FiringTolerance.value = data.minorWeaponStats.FiringTolerance
        if (data.minorWeaponStats.Yaw !== undefined) minorWeaponStats.Yaw.value = data.minorWeaponStats.Yaw
      }
    } catch (e) {
      console.error('Failed to parse compare settings', e)
    }
  }

  loadStored()

  watch(
    [showedSections, showUnitId, enhancementsTabs, highlightGroupedWeapons, compactSections, linedUpSections,
     minorWeaponStats.MuzzleVelocity, minorWeaponStats.FiringTolerance, minorWeaponStats.Yaw],
    saveToStorage,
    { deep: true }
  )

  return {
    showedSections, filterOpen, settingsOpen, toggleSection, toggleFilter, toggleSettings,
    showUnitId, enhancementsTabs, highlightGroupedWeapons, compactSections, linedUpSections,
    minorWeaponStats
  }
})
