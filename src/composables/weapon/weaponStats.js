import { round, shorten, smartRound } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse, isOneTimeUseCategory } from '@/composables/useWeaponStats'

export const EFF_COLUMNS = [Column.DPS, Column.DPS_PER_MASS, Column.DPS_TO_SHIELDS, Column.DPS_TO_SHIELDS_PER_MASS, Column.CYCLE, Column.CYCLE_TO_SHIELDS]

export const sumArray = (arr) => arr.reduce((acc, val) => acc + (val ?? 0), 0)

export const getStat = (weapon, stat, category, getEfficiencyValue) => {
  if (!weapon) return null
  switch (stat) {
    case Column.TYPE:
      return category
    case Column.RANGE:
      if (weapon?.MinRadius) return [weapon.MinRadius, weapon.MaxRadius]
      return weapon?.MaxRadius || null
    case Column.AOE:
      return weapon.DamageRadius || (weapon.NukeInnerRingRadius ? [weapon.NukeInnerRingRadius, weapon.NukeOuterRingRadius] : undefined)
    case Column.DPS:
      return weapon.dps
    case Column.DPS_PER_MASS:
      return getEfficiencyValue?.(weapon.dps)
    case Column.DPS_TO_SHIELDS:
      return weapon.dpsShields
    case Column.DPS_TO_SHIELDS_PER_MASS:
      return getEfficiencyValue?.(weapon.dpsShields)
    case Column.DOT:
      return weapon.DoTTime || null
    case Column.MUZZLE_VELOCITY:
      if (weapon.BeamLifetime !== undefined) return '∞'
      return weapon.MuzzleVelocity
    case Column.RANDOMNESS:
      return weapon.FiringRandomness
    case Column.RANDOMNESS_MOVE:
      return weapon.FiringRandomnessWhileMoving
    case Column.FIRING_TOLERANCE:
      return weapon.FiringTolerance
    case Column.YAW:
      return weapon.TurretYawRange
    case Column.HP:
      return weapon.Projectile?.Health || null
    case Column.CYCLE: {
      const damageMultiplier = category === 'Defense' ? 1 : weapon.fullDamage
      const cycleTime = isOneTimeUse(weapon, category) ? null : weapon.firingCycle.cycleTime
      return [damageMultiplier * weapon.firingCycle.cycleProjs, cycleTime]
    }
    case Column.CYCLE_TO_SHIELDS: {
      if (!weapon.DamageToShields) return null
      const damageMultiplier = category === 'Defense' ? 1 : (weapon.Damage + weapon.DamageToShields)
      const cycleTime = isOneTimeUse(weapon, category) ? null : weapon.firingCycle.cycleTime
      return [damageMultiplier * weapon.firingCycle.cycleProjs, cycleTime]
    }
    default:
      console.error(`Unknown stat: ${stat}`)
      return null
  }
}

export const getCycleTextFromVal = (val, weapon, category) => {
  const isNukeWithNullCycle = weapon?.NukeInnerRingDamage && val[1] === null
  const hasDoT = (weapon?.DoTPulses || 1) > 1
  const needsTooltip = hasDoT && (isOneTimeUse(weapon, category) || val[1] === null)
  const dmgPart = shorten(val[0], false).toUpperCase() + (category === 'Defense' ? '&nbsp;proj.' : '&nbsp;dmg')

  if (isNukeWithNullCycle || needsTooltip) {
    return `<div data-tooltip-target>${dmgPart}</div>`
  }
  return dmgPart + (!isOneTimeUseCategory(category) && val[1] !== null ? `<br><div data-tooltip-target> every&nbsp;${round(val[1], 1)}s</div>` : '')
}

export const getStatText = (weapon, stat, value, category, getEfficiencyValue) => {
  let val = value ?? getStat(weapon, stat, category, getEfficiencyValue)
  if (val == null) {
    val = '-'
  }
  if (stat == Column.DOT)
    return (val && !isNaN(val)) ? round(val, 1) + 's' : val
  if (stat == Column.CYCLE || stat == Column.CYCLE_TO_SHIELDS)
    return getCycleTextFromVal(val, weapon, category)
  if (stat == Column.HP)
    return shorten(val)
  if ([Column.RANGE, Column.AOE].includes(stat) && Array.isArray(val))
    return `${val[0]}&#8209;${shorten(val[1])}`
  if (typeof (val) == 'number') {
    return smartRound(val)
  }
  return val
}

export const aggregateColumn = (stats, key, category, getEfficiencyValue) => {
  switch (key) {
    case Column.DPS:
    case Column.DPS_TO_SHIELDS:
      return smartRound(sumArray(stats[key]))

    case Column.DPS_PER_MASS:
    case Column.DPS_TO_SHIELDS_PER_MASS: {
      const efficiency = getEfficiencyValue?.(sumArray(stats[key]))
      return smartRound(efficiency)
    }

    case Column.CYCLE:
    case Column.CYCLE_TO_SHIELDS: {
      const [sum, times] = stats[key].reduce((acc, val) => val ? [acc[0] + val[0], acc[1].add(val[1])] : acc, [0, new Set()])
      if (times.size != 1 || times.has(null)) return 'different'
      return getCycleTextFromVal([sum, Array.from(times)[0]], null, category)
    }

    default:
      return null // Handled by aggregateColumnFormat in weaponFormatters.js
  }
}
