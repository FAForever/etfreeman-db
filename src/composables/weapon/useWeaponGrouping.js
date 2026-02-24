import { computed } from 'vue'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { addBr } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { getStat, EFF_COLUMNS, aggregateColumn } from '@/composables/weapon/weaponStats'
import { aggregateColumnFormat } from '@/composables/weapon/weaponFormatters'
import { createStatsCollector } from '@/composables/weapon/StatsCollector'

export const useWeaponGrouping = (weapons, category, columns, economy, isExpanded) => {
  const { calculateWeapon } = useCalcEfficiency('weapon')
  const getEfficiencyValue = (dpsValue) => calculateWeapon(dpsValue, economy)

  const collectStats = () => {
    const collector = createStatsCollector(columns, EFF_COLUMNS)
    for (const weapon of weapons) {
      for (const stat of columns) {
        collector.add(stat, getStat(weapon, stat, category, getEfficiencyValue))
      }
    }
    return collector.toArray()
  }

  const aggregateStats = (stats) => {
    for (const key in stats) {
      const result = aggregateColumn(stats, key, category, getEfficiencyValue)
      stats[key] = result ?? aggregateColumnFormat(stats, key, category, getEfficiencyValue)
      if (stats[key] == undefined || stats[key] == '') {
        stats[key] = '-'
      }
    }
    return stats
  }

  const aggregatedStats = computed(() => {
    const rawStats = collectStats()
    return aggregateStats(rawStats)
  })

  const groupedWeapons = computed(() => {
    if (!isExpanded.value) return []

    const groupMap = {}
    for (const weapon of weapons) {
      const signature = columns.map(col =>
        col === Column.TYPE ? category : getStat(weapon, col, category, getEfficiencyValue)
      ).join('|')

      const existing = groupMap[signature]
      if (existing) {
        existing.count++
        existing.weapons.push(weapon)
      } else {
        groupMap[signature] = { signature, count: 1, weapons: [weapon] }
      }
    }
    return Object.values(groupMap)
  })

  const getDisplayName = (group) => {
    const name = addBr(group.weapons[0].DisplayName, 10)
    if (group.count > 1) return `<b class="weaponGroup__important">${group.count}x</b> ${name}`
    return name
  }

  return {
    aggregatedStats,
    groupedWeapons,
    getDisplayName,
    getEfficiencyValue
  }
}
