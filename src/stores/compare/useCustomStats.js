import { reactive } from 'vue'

const DEFAULTS = {
  stats: []
}

export function useCustomStats() {
  const customStats = reactive({ ...DEFAULTS })

  const addStat = () => {
    customStats.stats.push({
      id: Date.now(),
      label: '',
      formula: '',
      fullLine: false
    })
  }

  const removeStat = (id) => {
    const index = customStats.stats.findIndex(s => s.id === id)
    if (index > -1) customStats.stats.splice(index, 1)
  }

  const updateStat = (id, updates) => {
    const stat = customStats.stats.find(s => s.id === id)
    if (stat) Object.assign(stat, updates)
  }

  return { customStats, addStat, removeStat, updateStat }
}
