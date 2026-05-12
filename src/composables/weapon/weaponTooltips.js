import { getDetailedCycle, getDoTBreakdown } from '@/stores/utils/unitDecorator/dps/index.js'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse, isTorpedo, isDepthCharge } from '../helpers/weaponHelper'

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

const LAYER_ORDER = ['Seabed', 'Sub', 'Water']

const getMaxTargetCaps = (table) => {
  if (!table) return new Set()
  const longest = Object.values(table).reduce((best, v) => {
    const parts = v.split('|')
    return parts.length > best.length ? parts : best
  }, [])
  return new Set(longest)
}

const getLayerTargetTooltip = (weapon) => {
  if (!isTorpedo(weapon) && !isDepthCharge(weapon)) return null
  const caps = getMaxTargetCaps(weapon.FireTargetLayerCapsTable)
  if (!caps.size) return null
  const targetLayers = LAYER_ORDER.filter(el => caps.has(el))
  if (targetLayers.length >= 3 || !targetLayers.length) return null
  return `Can only target ${targetLayers.join(' / ')} layer${targetLayers.length > 1 ? 's' : ''}`
}

export const getTooltipAttrs = (weapon, col) => {
  if (!weapon) return {}
  let tooltip
  if (col === Column.TYPE) tooltip = getLayerTargetTooltip(weapon)
  else if ([Column.CYCLE, Column.CYCLE_TO_SHIELDS].includes(col))
    tooltip = getDetailedCycle(weapon, col === Column.CYCLE_TO_SHIELDS, isOneTimeUse(weapon)) || null
  else if (col === Column.DOT) tooltip = getDoTTooltip(weapon)

  if (!tooltip) return {}
  return {
    'data-tooltip': tooltip,
    'data-tooltip-params': col === Column.TYPE ? 'big-top-right' : 'big-top-left'
  }
}

export const tractorTooltip = 'Tractor only deals damage once the target is fully pulled in'
