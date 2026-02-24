import { shorten } from '@/composables/helpers/common'
import { getDetailedCycle, getDoTBreakdown } from '@/stores/utils/unitDecorator/dps/index.js'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse } from '@/composables/useWeaponStats'

export const getCycleTooltip = (weapon, stat, category) => {
  if (stat === Column.CYCLE_TO_SHIELDS) {
    return getDetailedCycle(weapon, true)
  }

  if (weapon.NukeInnerRingDamage) {
    const innerTotal = weapon.NukeInnerRingDamage + weapon.NukeOuterRingDamage
    return `${shorten(innerTotal)} damage in ${weapon.NukeInnerRingRadius} radius,\n${shorten(weapon.NukeOuterRingDamage)} damage in ${weapon.NukeOuterRingRadius} radius`
  }

  const detailed = getDetailedCycle(weapon, false)
  if (detailed) return detailed

  const dot = getDoTBreakdown(weapon)
  if (dot.hasDoT) {
    const { cycleProjs } = weapon.firingCycle
    const instant = Math.round(dot.instant * cycleProjs)
    const dotDmg = Math.round(dot.dotTotal * cycleProjs)

    if (isOneTimeUse(weapon, category)) {
      return `${instant}dmg + ${dotDmg} DoT`
    }

    const plural = cycleProjs > 1 ? 's' : ''
    const cycleTime = weapon.firingCycle.cycleTime
    const cycleTimeText = cycleTime === 1 ? '' : cycleTime?.toFixed(1)
    return `${instant}dmg + ${dotDmg} DoT\n${cycleProjs} shot${plural} / ${cycleTimeText}s`
  }

  return null
}

export const getDoTTooltip = (weapon) => {
  const dot = getDoTBreakdown(weapon)
  if (!dot.hasDoT) return undefined

  const { cycleProjs } = weapon.firingCycle
  if (cycleProjs > 1) {
    const totalDot = dot.dotTotal * cycleProjs
    return `Each of ${cycleProjs} projectiles:\n${dot.ticks} tick${dot.ticks > 1 ? 's' : ''} of ${weapon.Damage}dmg / ${dot.interval.toFixed(1)}s\nTotal DoT: ${cycleProjs} × ${dot.dotTotal} = ${totalDot}dmg`
  }

  return `${dot.ticks} tick${dot.ticks > 1 ? 's' : ''} of ${weapon.Damage}dmg / ${dot.interval.toFixed(1)}s\nTotal DoT: ${dot.dotTotal}dmg`
}

export const getTooltip = (weapon, col, category) => {
  if (!weapon) return undefined
  if (col === Column.CYCLE || col === Column.CYCLE_TO_SHIELDS) {
    return getCycleTooltip(weapon, col, category)
  }
  if (col === Column.DOT) {
    return getDoTTooltip(weapon)
  }
  return undefined
}

export const getTractorTooltip = (weapons) => {
  if (!weapons.some(w => w.TractorDamage)) return undefined
  return 'Tractor only deals damage once the target is fully pulled in'
}
