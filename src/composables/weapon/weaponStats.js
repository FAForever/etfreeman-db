import { round, roundIfPossible, shorten, smartRound } from '@/composables/helpers/common'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse } from '../helpers/weaponHelper'

const getStat = (ctx, weapon, stat) => {
  const { category, getEfficiencyValue } = ctx
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
      return getEfficiencyValue(weapon.dps)
    case Column.DPS_TO_SHIELDS:
      return weapon.dpsShields
    case Column.DPS_TO_SHIELDS_PER_MASS:
      return getEfficiencyValue(weapon.dpsShields)
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
      const cycleTime = isOneTimeUse(weapon) ? null : weapon.firingCycle.cycleTime
      return [weapon.fullDamage * weapon.firingCycle.cycleProjs, cycleTime]
    }
    case Column.CYCLE_TO_SHIELDS: {
      if (!weapon.DamageToShields) return null
      const cycleTime = isOneTimeUse(weapon) ? null : weapon.firingCycle.cycleTime
      return [(weapon.fullDamage + weapon.DamageToShields) * weapon.firingCycle.cycleProjs, cycleTime]
    }
    default:
      console.error("Unknown stat: " + stat)
      return null
  }
}

const getCycleTextFromVal = (val, weapon) => {
  const noCycle = isOneTimeUse(weapon) || val[1] === null
  const dmgPart = shorten(val[0], false).toUpperCase() + '&nbsp;dmg'
  if (noCycle)
    return "<div>" + dmgPart + "</div>"
  else
    return dmgPart + "<br><div data-tooltip-target> every&nbsp;" + round(val[1], 1) + "s</div>"
}

const formatValue = (val, stat) => {
  if ([undefined, null, NaN].includes(val)) return '-'
  if (stat == Column.DOT) return (typeof val === 'number') ? round(val, 1) + 's' : val
  if (stat == Column.CYCLE || stat == Column.CYCLE_TO_SHIELDS) return getCycleTextFromVal(val, null)
  if (stat == Column.HP) return shorten(val)
  if ([Column.RANGE, Column.AOE].includes(stat) && Array.isArray(val)) return val[0] + "&#8209;" + shorten(val[1])
  if (typeof val == 'number') return smartRound(val)
  return val
}

const getStatText = (ctx, weapon, stat) => {
  const val = getStat(ctx, weapon, stat)
  return formatValue(val, stat)
}

const formatShrinkableParam = (values, column) => {
  const content = values.length === 1
    ? formatValue(values[0], column)
    : values.map(el => formatValue(el ?? 0, column)).join(', ')
  return '<div class="shrinkable-param">' + content + '</div>'
}

const aggregateColumn = (ctx, stats, column) => {
  const { getEfficiencyValue } = ctx
  const values = stats[column]

  switch (column) {
    case Column.DPS:
    case Column.DPS_TO_SHIELDS:
      return smartRound(values.reduce((a, b) => a + (b || 0), 0))

    case Column.DPS_PER_MASS:
      return smartRound(getEfficiencyValue((stats[Column.DPS] || []).reduce((a, b) => a + (b || 0), 0)))
    case Column.DPS_TO_SHIELDS_PER_MASS:
      return smartRound(getEfficiencyValue((stats[Column.DPS_TO_SHIELDS] || []).reduce((a, b) => a + (b || 0), 0)))

    case Column.CYCLE:
    case Column.CYCLE_TO_SHIELDS: {
      const [sum, times] = values.reduce((acc, val) => val && val[0] ? [acc[0] + val[0], acc[1].add(val[1])] : acc, [0, new Set()])
      if (!times.size) return '-'
      if (times.size != 1 || times.has(null)) return 'different'
      return getCycleTextFromVal([sum, Array.from(times)[0]], null)
    }

    case Column.RANGE:
    case Column.FIRING_TOLERANCE:
    case Column.MUZZLE_VELOCITY:
    case Column.YAW:
      return formatShrinkableParam(values, column)

    default:
      if (values.length == 1) return roundIfPossible(values[0], 2)
      return values.map(el => formatValue(el || 0, column)).join(', ')
  }
}

export const createStatsHelper = (category, getEfficiencyValue) => {
  const ctx = { category, getEfficiencyValue }

  return {
    getStat: (weapon, stat) => getStat(ctx, weapon, stat),
    getStatText: (weapon, stat) => getStatText(ctx, weapon, stat),
    aggregateColumn: (stats, column) => aggregateColumn(ctx, stats, column)
  }
}
