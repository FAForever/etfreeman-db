import { computed } from 'vue'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { addBr } from '@/composables/helpers/common'
import { createStatsHelper } from '@/composables/weapon/weaponStats'
import { createStatsCollector } from '@/composables/weapon/StatsCollector'

export const useWeaponGrouping = (weapons, columns, economy, isExpanded) => {
  const { calculateWeapon } = useCalcEfficiency('weapon')
  const getEfficiencyValue = (dpsValue) => calculateWeapon(dpsValue, economy)

  const category = weapons[0]?.__category

  const statsHelper = createStatsHelper(category, getEfficiencyValue)

  const collectStats = () => {
    const collector = createStatsCollector(columns)
    for (const weapon of weapons) {
      for (const column of columns) {
        collector.add(column, statsHelper.getStat(weapon, column))
      }
    }
    return collector.toArray()
  }

  const aggregateStats = (rawStats) => {
    for (const column in rawStats) {
      rawStats[column] = statsHelper.aggregateColumn(rawStats, column)
      if (rawStats[column] == undefined || rawStats[column] == '') {
        rawStats[column] = '-'
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
      const signature = columns.map(col => statsHelper.getStat(weapon, col)).join('|')

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
    if (group.count > 1) return "<b class=\"weaponGroup__important\">" + group.count + "x</b> " + name
    return name
  }

  return {
    aggregatedStats,
    groupedWeapons,
    getDisplayName,
    getStatText: statsHelper.getStatText
  }
}
