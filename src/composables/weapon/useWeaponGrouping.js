import { computed } from 'vue'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { addBr } from '@/composables/helpers/common'
import { createStatsHelper } from '@/composables/weapon/weaponStats'
import { createStatsCollector } from '@/composables/weapon/StatsCollector'

export const useWeaponGrouping = (weaponsRef, columnsRef, economyRef, isExpanded) => {
  const { calculateWeapon } = useCalcEfficiency('weapon')

  const statsHelper = computed(() => {
    const getEfficiencyValue = (dpsValue) => calculateWeapon(dpsValue, economyRef.value)
    return createStatsHelper(weaponsRef.value[0]?.__category, getEfficiencyValue)
  })

  const aggregatedStats = computed(() => {
    const weapons = weaponsRef.value
    const columns = columnsRef.value
    const stats = statsHelper.value

    const collector = createStatsCollector(columns)
    for (const weapon of weapons) {
      for (const column of columns) {
        collector.add(column, stats.getStat(weapon, column))
      }
    }
    const rawStats = collector.toArray()

    const result = {}
    for (const column in rawStats) {
      result[column] = stats.aggregateColumn(rawStats, column)
    }
    return result
  })

  const groupedWeapons = computed(() => {
    if (!isExpanded.value) return []

    const weapons = weaponsRef.value
    const columns = columnsRef.value
    const stats = statsHelper.value

    const groupMap = {}
    for (const weapon of weapons) {
      const signature = columns.map(col => stats.getStat(weapon, col)).join('|')

      const existing = groupMap[signature]
      if (existing) {
        existing.count++
        existing.weapons.push(weapon)
      } else {
        groupMap[signature] = { count: 1, weapons: [weapon] }
      }
    }
    return Object.values(groupMap)
  })

  const getDisplayName = (group) => {
    const name = addBr(group.weapons[0].DisplayName, 10)
    if (group.count > 1) return "<b class=\"weaponGroup__important\">" + group.count + "x</b> " + name
    return name
  }

  const getStatText = (weapon, stat) => statsHelper.value.getStatText(weapon, stat)

  return { aggregatedStats, groupedWeapons, getDisplayName, getStatText }
}
