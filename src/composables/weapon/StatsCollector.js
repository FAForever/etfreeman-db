import { Column } from '@/composables/useWeaponColumns.js'

export const createStatsCollector = (columns, sumColumns = [Column.DPS, Column.DPS_PER_MASS, Column.DPS_TO_SHIELDS, Column.DPS_TO_SHIELDS_PER_MASS, Column.CYCLE, Column.CYCLE_TO_SHIELDS]) => {
  const configs = new Map()

  for (const col of columns) {
    configs.set(col, {
      values: sumColumns.includes(col) ? [] : new Map(),
      isSum: sumColumns.includes(col)
    })
  }

  const toKey = (value) => {
    if (value == null) return '\x00'
    if (Array.isArray(value)) return value.join('|')
    return String(value)
  }

  const add = (column, value) => {
    const config = configs.get(column)
    if (!config) return

    if (config.isSum) {
      config.values.push(value)
    } else {
      config.values.set(toKey(value), value)
    }
  }

  const getValues = (column) => {
    const config = configs.get(column)
    if (!config) return []
    return config.isSum ? config.values : Array.from(config.values.values())
  }

  const toArray = () => {
    const result = {}
    for (const col of configs.keys()) {
      result[col] = getValues(col)
    }
    return result
  }

  return { add, getValues, toArray }
}
