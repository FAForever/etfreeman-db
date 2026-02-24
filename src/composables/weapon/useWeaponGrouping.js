import { computed } from 'vue'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { addBr } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { getStat, EFF_COLUMNS, aggregateColumn } from '@/composables/weapon/weaponStats'

export const useWeaponGrouping = (weapons, category, columns, economy, isExpanded) => {
  const { calculateWeapon } = useCalcEfficiency('weapon')
  const getEfficiencyValue = (dpsValue) => calculateWeapon(dpsValue, economy)

  const collectStats = () => {
    const stats = Object.fromEntries(columns.map(col => [col, EFF_COLUMNS.includes(col) ? [] : new Set()]))
    for (const weapon of weapons) {
      for (const stat of columns) {
        if (EFF_COLUMNS.includes(stat)) {
          stats[stat].push(getStat(weapon, stat, category, getEfficiencyValue))
        } else if (stat == Column.RANGE) {
          stats[stat].add(JSON.stringify(getStat(weapon, stat, category, getEfficiencyValue)))
        } else {
          stats[stat].add(getStat(weapon, stat, category, getEfficiencyValue))
        }
      }
    }
    for (const key in stats) {
      if (!Array.isArray(stats[key])) {
        stats[key] = Array.from(stats[key])
      }
    }
    return stats
  }

  const aggregateStats = (stats) => {
    for (const key in stats) {
      stats[key] = aggregateColumn(stats, key, category, getEfficiencyValue)
      if (stats[key] == undefined || stats[key] == '') {
        stats[key] = '-'
      }
    }
    return stats
  }

  const getGroupStatText = computed(() => {
    const rawStats = collectStats()
    return aggregateStats(rawStats)
  })

  const groupedWeapons = computed(() => {
    if (!isExpanded.value) return []

    const groups = []
    for (const weapon of weapons) {
      const signature = columns.map(col =>
        col === Column.TYPE ? category : getStat(weapon, col, category, getEfficiencyValue)
      ).join('|')

      const existing = groups.find(g => g.signature === signature)
      if (existing) {
        existing.count++
        existing.weapons.push(weapon)
      } else {
        groups.push({ signature, count: 1, weapons: [weapon] })
      }
    }
    return groups
  })

  const getDisplayName = (group) => {
    const name = addBr(group.weapons[0].DisplayName, 10)
    if (group.count > 1) return `<b class="weaponGroup__important">${group.count}x</b> ${name}`
    return name
  }

  return {
    getGroupStatText,
    groupedWeapons,
    getDisplayName,
    getEfficiencyValue
  }
}
