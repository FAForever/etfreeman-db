import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useShowedSections } from './useShowedSections.js'
import { useCompareToggles } from './useCompareToggles.js'
import { useEfficiencySettings } from './useEfficiencySettings.js'
import { useCustomStats } from './useCustomStats.js'
import { useSettingsSaver } from './useSettingsSaver.js'

export const useCompareStore = defineStore('compare', () => {
  const { showedSections, toggleSection } = useShowedSections()
  const { toggles, unitWidth, gap } = useCompareToggles()
  const { efficiencySettings } = useEfficiencySettings()
  const { customStats, addStat, removeStat, updateStat } = useCustomStats()

  const filterOpen = ref(false)
  const settingsOpen = ref(false)

  const settings = { showedSections, toggles, efficiencySettings, customStats }

  const { save, load } = useSettingsSaver(settings)
  load()
  watch([showedSections, toggles, efficiencySettings, customStats], save, { deep: true })

  return {
    showedSections, toggles, efficiencySettings, customStats,
    filterOpen, settingsOpen,
    gap, unitWidth,
    toggleSection, addStat, removeStat, updateStat,
    toggleFilter: () => filterOpen.value = !filterOpen.value,
    toggleSettings: () => settingsOpen.value = !settingsOpen.value
  }
})
