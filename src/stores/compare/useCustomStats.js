import { reactive } from 'vue'
import { parseStatLabel } from './customStatsVars'

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
    if (!stat) return
    if (updates.label !== undefined && stat.vars) {
      const { vars, error } = parseStatLabel(updates.label)
      if (!error) for (const k in stat.vars) if (!vars.includes(k)) delete stat.vars[k]
    }
    Object.assign(stat, updates)
  }

  const setVar = (id, name, patch) => {
    const stat = customStats.stats.find(s => s.id === id)
    if (!stat) return
    if (!stat.vars) stat.vars = {}
    stat.vars[name] = { value: '', color: '#fff', ...stat.vars[name], ...patch }
  }

  const overrides = reactive({ units: {}, all: {} })

  const getVarValue = (stat, unitId, n) =>
    overrides.units[unitId]?.[stat.id]?.[n] ?? overrides.all[stat.id]?.[n] ?? stat.vars?.[n]?.value ?? 0

  const setVarOverrides = (statId, values, unitId = null) => {
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''))
    const has = Object.keys(clean).length > 0
    if (unitId == null) {
      if (has) overrides.all[statId] = clean
      else delete overrides.all[statId]
      for (const u in overrides.units) delete overrides.units[u][statId]
    } else {
      const map = overrides.units[unitId] ??= {}
      if (has) map[statId] = clean
      else {
        delete map[statId]
        if (!Object.keys(map).length) delete overrides.units[unitId]
      }
    }
  }

  return { customStats, addStat, removeStat, updateStat, setVar, getVarValue, setVarOverrides }
}
