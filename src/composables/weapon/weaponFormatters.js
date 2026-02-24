import { round, roundIfPossible, shorten, smartRound } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse, isOneTimeUseCategory } from '@/composables/useWeaponStats'
import { getStatText } from '@/composables/weapon/weaponStats'

export const wrapWithClass = (values, key, category, getEfficiencyValue, className = 'shrinkable-param') => {
  const content = values.length === 1
    ? getStatText(null, key, values[0], category, getEfficiencyValue)
    : values.map(el => getStatText(null, key, el ?? 0, category, getEfficiencyValue)).join(', ')
  return `<div class="${className}">${content}</div>`
}

export const aggregateColumnFormat = (stats, key, category, getEfficiencyValue) => {
  switch (key) {
    case Column.RANGE:
      return wrapWithClass(stats[key], key, category, getEfficiencyValue)

    case Column.FIRING_TOLERANCE: {
      const valueStr = String(stats[key].length == 1 ? stats[key][0] : stats[key].map(el => getStatText(null, key, el || 0, category, getEfficiencyValue)).join(', '))
      const needsShrink = valueStr.includes(',') ? valueStr.length > 3 : valueStr.length > 2
      const className = needsShrink ? 'shrinkable-param' : ''
      if (stats[key].length == 1) return `<div class="${className}">${roundIfPossible(stats[key][0], 2)}</div>`
      return `<div class="${className}">${stats[key].map(el => getStatText(null, key, el || 0, category, getEfficiencyValue)).join(', ')}</div>`
    }

    case Column.MUZZLE_VELOCITY:
    case Column.YAW:
      return wrapWithClass(stats[key], key, category, getEfficiencyValue)

    default:
      if (stats[key].length == 1) return roundIfPossible(stats[key][0], 2)
      return stats[key].map(el => getStatText(null, key, el || 0, category, getEfficiencyValue)).join(', ')
  }
}
