import { getDetailedCycle, getDoTBreakdown } from '@/stores/utils/unitDecorator/dps/index.js'
import { Column } from '@/composables/useWeaponColumns'
import { isOneTimeUse, isTorpedo, isDepthCharge } from '../helpers/weaponHelper'
import { getStunTooltip } from './stunTooltip.js'
import { useUnitDataStore } from '@/stores/unitData.js'
import { shorten, round } from '../helpers/common.js'

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

const getOCTooltip = (weapon, energyRatio) => {
  const { minDamage, maxDamage, commandDamage, structureDamage, energyMult } = weapon.Overcharge
  const base = minDamage * energyRatio
  const cap = Math.round(base / energyMult)
  const low = weapon.EnergyRequired < base
    ? `\nBelow ${shorten(base)} E stored dmg scales down to ${round(energyMult * 100, 1)}% of available energy / ${energyRatio} (min shot: ${shorten(Math.round(weapon.EnergyRequired * energyMult / energyRatio))} dmg for ${shorten(Math.round(weapon.EnergyRequired * energyMult))} E).`
    : ''
  return `Deals ${shorten(commandDamage)} dmg to ACUs for ${shorten(base)} E.
Deals ${shorten(structureDamage)} dmg to structures for ${shorten(base)} E.
Deals ${shorten(minDamage)}–${shorten(maxDamage)} dmg to units for ${shorten(base)}–${shorten(maxDamage * energyRatio)} E.
Fires only above ${shorten(weapon.EnergyRequired)} E stored; above ${shorten(cap)} E never drains more than ${round(energyMult * 100, 1)}% of available energy.${low}`
}

const getEnergyTooltip = (weapon) => {
  if (weapon.Overcharge)
    return getOCTooltip(weapon, useUnitDataStore().unitDefaults.overchargeEnergyRatio)
  if (!(weapon.EnergyRequired > 0)) return null
  return `Requires ${shorten(weapon.EnergyRequired)} energy per cycle`
    + (weapon.EnergyDrainPerSecond > 0 ? `\n(drains ${shorten(weapon.EnergyDrainPerSecond)} E/s while charging)` : '')
}

export const getTooltipAttrs = (weapon, col) => {
  if (!weapon) return {}
  let tooltip
  let stunActive = false
  if (col === Column.TYPE) {
    const layer = getLayerTargetTooltip(weapon)
    const stun = getStunTooltip(weapon)
    stunActive = !!stun
    tooltip = [[layer, stun].filter(Boolean).join('\n'), getEnergyTooltip(weapon)].filter(Boolean).join('\n\n')
  }
  else if ([Column.CYCLE, Column.CYCLE_TO_SHIELDS].includes(col))
    tooltip = getDetailedCycle(weapon, col === Column.CYCLE_TO_SHIELDS, isOneTimeUse(weapon)) || null
  else if (col === Column.DOT) tooltip = getDoTTooltip(weapon)

  if (!tooltip) return {}
  const params = col === Column.TYPE
    ? (stunActive || weapon.Overcharge ? 'widest-top-right' : 'big-top-right')
    : 'big-top-left'
  return {
    'data-tooltip': tooltip,
    'data-tooltip-params': params
  }
}

export const tractorTooltip = 'Tractor only deals damage once the target is fully pulled in'
