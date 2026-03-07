import { toRaw } from 'vue'

const STORAGE_KEY = 'faf-compare-v4'

export function useSettingsSaver(settings) {
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      showedSections: toRaw(settings.showedSections),
      toggles: toRaw(settings.toggles),
      efficiencySettings: toRaw(settings.efficiencySettings),
      customStats: toRaw(settings.customStats)
    }))
  }

  const load = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const data = JSON.parse(stored)
    for (const key in settings) {
      if (data[key]) Object.assign(settings[key], data[key])
    }
  }

  return { save, load }
}
