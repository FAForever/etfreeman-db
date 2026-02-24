import { computed } from 'vue'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { addBr } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { createStatsHelper } from '@/composables/weapon/weaponStats'
import { createFormatter } from '@/composables/weapon/weaponFormatters'
import { createStatsCollector } from '@/composables/weapon/StatsCollector'

export const useWeaponGrouping = (weapons, category, columns, economy, isExpanded) => {
  const { calculateWeapon } = useCalcEfficiency('weapon')
  const getEfficiencyValue = (dpsValue) => calculateWeapon(dpsValue, economy)

  const stats = createStatsHelper(category, getEfficiencyValue)
  const formatter = createFormatter(stats)

  const collectStats = () => {
    const collector = createStatsCollector(columns)
    for (const weapon of weapons) {
      for (const stat of columns) {
        collector.add(stat, stats.getStat(weapon, stat))
      }
    }
    return collector.toArray()
  }

  const aggregateStats = (rawStats) => {
    for (const key in rawStats) {
      const result = stats.aggregateColumn(rawStats, key)
      rawStats[key] = result ?? formatter.aggregateColumnFormat(rawStats, key)
      if (rawStats[key] == undefined || rawStats[key] == '') {
        rawStats[key] = '-'
      }
    }
    return rawStats
  }

  const aggregatedStats = computed(() => {
    const rawStats = collectStats()
    return aggregateStats(rawStats)
  })

  const groupedWeapons = computed(() => {
    if (!isExpanded.value) return []

    const groupMap = {}
    for (const weapon of weapons) {
      const signature = columns.map(col => stats.getStat(weapon, col)).join('|')

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
    stats
  }
}
