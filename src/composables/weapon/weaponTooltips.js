import { getDetailedCycle, getDoTBreakdown } from '@/stores/utils/unitDecorator/dps/index.js'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse } from '../helpers/weaponHelper'

const getDoTTooltip = (weapon) => {
  const dot = getDoTBreakdown(weapon)
  if (!dot.hasDoT) return undefined

  const { cycleProjs } = weapon.firingCycle
  if (cycleProjs > 1) {
    const totalDot = dot.dotTotal * cycleProjs
    return "Each of " + cycleProjs + " projectiles:\n" + dot.ticks + " tick" + (dot.ticks > 1 ? 's' : '') + " of " + weapon.Damage + "dmg / " + dot.interval.toFixed(1) + "s\nTotal DoT: " + cycleProjs + " × " + dot.dotTotal + " = " + totalDot + "dmg"
  }

  return dot.ticks + " tick" + (dot.ticks > 1 ? 's' : '') + " of " + weapon.Damage + "dmg / " + dot.interval.toFixed(1) + "s\nTotal DoT: " + dot.dotTotal + "dmg"
}

export const getTooltip = (weapon, col) => {
  if (!weapon) return undefined
  if ([Column.CYCLE, Column.CYCLE_TO_SHIELDS].includes(col)) {
    return getDetailedCycle(weapon, col === Column.CYCLE_TO_SHIELDS, isOneTimeUse(weapon)) || null
  }
  if (col === Column.DOT) return getDoTTooltip(weapon)
  return undefined
}

export const tractorTooltip = 'Tractor only deals damage once the target is fully pulled in'
