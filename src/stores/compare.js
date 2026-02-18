import { defineStore } from 'pinia'
import { ref, reactive, watch, computed } from 'vue'

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
  linedUpSections: window.innerWidth < 700 ? false : true,
  minorWeaponStats: {
    MuzzleVelocity: window.innerWidth < 700 ? false : true,
    FiringTolerance: false,
    Yaw: false
  },
  calcUnitMode: 'hp/mass',
  calcWeaponMode: 'DPS/mass',
  calcUnitInvert: false,
  calcWeaponInvert: false
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

  const minorWeaponStats = reactive({
    MuzzleVelocity: defaultSettings.minorWeaponStats.MuzzleVelocity,
    FiringTolerance: defaultSettings.minorWeaponStats.FiringTolerance,
    Yaw: defaultSettings.minorWeaponStats.Yaw
  })

  const calcUnitMode = ref(defaultSettings.calcUnitMode)
  const calcWeaponMode = ref(defaultSettings.calcWeaponMode)
  const calcUnitInvert = ref(defaultSettings.calcUnitInvert)
  const calcWeaponInvert = ref(defaultSettings.calcWeaponInvert)

  const gap = ref(8)

  const unitWidth = computed(() => {
    const count = (minorWeaponStats.MuzzleVelocity ? 1 : 0) + (minorWeaponStats.FiringTolerance ? 1 : 0) + (minorWeaponStats.Yaw ? 1 : 0)
    if (count === 3) return 400
    if (count === 2 && minorWeaponStats.Yaw) return 385
    if (!count) return 350
    return 370
  })

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
        MuzzleVelocity: minorWeaponStats.MuzzleVelocity,
        FiringTolerance: minorWeaponStats.FiringTolerance,
        Yaw: minorWeaponStats.Yaw
      },
      calcUnitMode: calcUnitMode.value,
      calcWeaponMode: calcWeaponMode.value,
      calcUnitInvert: calcUnitInvert.value,
      calcWeaponInvert: calcWeaponInvert.value
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
        if (data.minorWeaponStats.MuzzleVelocity !== undefined) minorWeaponStats.MuzzleVelocity = data.minorWeaponStats.MuzzleVelocity
        if (data.minorWeaponStats.FiringTolerance !== undefined) minorWeaponStats.FiringTolerance = data.minorWeaponStats.FiringTolerance
        if (data.minorWeaponStats.Yaw !== undefined) minorWeaponStats.Yaw = data.minorWeaponStats.Yaw
      }
      if (data.calcUnitMode !== undefined) calcUnitMode.value = data.calcUnitMode
      if (data.calcWeaponMode !== undefined) calcWeaponMode.value = data.calcWeaponMode
      if (data.calcUnitInvert !== undefined) calcUnitInvert.value = data.calcUnitInvert
      if (data.calcWeaponInvert !== undefined) calcWeaponInvert.value = data.calcWeaponInvert
    } catch (e) {
      console.error('Failed to parse compare settings', e)
    }
  }

  loadStored()

  watch(
    [showedSections, showUnitId, enhancementsTabs, highlightGroupedWeapons, compactSections, linedUpSections, minorWeaponStats, calcUnitMode, calcWeaponMode, calcUnitInvert, calcWeaponInvert],
    saveToStorage,
    { deep: true }
  )

  return {
    showedSections, filterOpen, settingsOpen, toggleSection, toggleFilter, toggleSettings,
    showUnitId, enhancementsTabs, highlightGroupedWeapons, compactSections, linedUpSections,
    minorWeaponStats, gap, unitWidth, calcUnitMode, calcWeaponMode, calcUnitInvert, calcWeaponInvert
  }
})
