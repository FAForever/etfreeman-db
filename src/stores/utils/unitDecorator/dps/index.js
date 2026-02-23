// FA Game-Accurate DPS Calculator
// Based on: fa\lua\ui\game\unitviewDetail.lua

import { calculateProjectileDamage, getRoundedTime, getFiringCooldown, processRackSequence, isSequentialSingleFire, getDoTBreakdown, getSalvoInfo } from './calculations.js'
import { formatDmg, formatStandardBeamCycle, formatContinuousBeamCycle, formatMuzzleSalvoCycle, formatMultiRackSalvoCycle, formatCommonCycle } from './formatters.js'

export const calculateFiringCycle = (weapon) => {
  const firingCooldown = getFiringCooldown(weapon)
  if (firingCooldown * 10 % 1) {
    console.error('Bad firing cooldown:', firingCooldown, ' engine will round it to something?')
  }

  const chargeTime = getRoundedTime(weapon, 'RackSalvoChargeTime')
  const muzzleDelays = getRoundedTime(weapon, 'MuzzleSalvoDelay')
  const muzzleChargeDelay = getRoundedTime(weapon, 'MuzzleChargeDelay')
  const reloadTime = getRoundedTime(weapon, 'RackSalvoReloadTime')

  const { cycleProjs: rackProjs, cycleTime: rackCycleTime, subCycleTime, racksToFire } =
    processRackSequence(weapon, firingCooldown, chargeTime, muzzleDelays, muzzleChargeDelay)

  let cycleProjs = rackProjs
  let cycleTime = rackCycleTime
  if (firingCooldown <= (subCycleTime + chargeTime + reloadTime)) {
    cycleTime += subCycleTime + reloadTime + chargeTime + Math.max(0.1, firingCooldown - subCycleTime - chargeTime - reloadTime)
  } else {
    cycleTime += firingCooldown
  }

  if (isSequentialSingleFire(weapon, racksToFire)) {
    cycleTime /= cycleProjs
    cycleProjs = 1
  }

  if ((weapon.WeaponUnpackAnimation && (weapon.NukeInnerRingDamage || weapon.ManualFire)) || isNaN(cycleTime)) {
    cycleTime = null
  }

  return { cycleProjs, cycleTime }
}

export const calculateDps = (weapon, toShields = false) => {
  if (!weapon.RateOfFire || weapon.ForceSingleFire || weapon.FireOnDeath || ['Teleport', "Kamikaze"].includes(weapon.WeaponCategory)) return null
  const damage = calculateProjectileDamage(weapon, toShields)
  return Number(((damage * weapon.firingCycle.cycleProjs) / weapon.firingCycle.cycleTime).toFixed(2))
}

export const getDetailedCycle = (weapon, toShields = false, nullIfSimple = true) => {
  if (toShields) return null

  const { cycleProjs, cycleTime } = weapon.firingCycle
  if (!cycleTime) return null

  if (weapon.BeamLifetime && weapon.BeamLifetime !== 0) {
    return formatStandardBeamCycle(weapon, cycleProjs, cycleTime)
  }

  if (weapon.BeamLifetime === 0) {
    return formatContinuousBeamCycle(weapon, cycleProjs, nullIfSimple)
  }

  const perProjDamage = calculateProjectileDamage(weapon)
  const dot = getDoTBreakdown(weapon)
  const formatDmgFn = (dmg) => formatDmg(dmg, dot, perProjDamage)
  const { hasMuzzleSalvo, hasMultiMuzzleSingleRack, isSalvo } = getSalvoInfo(weapon)

  if (isSalvo && cycleProjs > 1) {
    if (hasMuzzleSalvo) {
      return formatMuzzleSalvoCycle(weapon, cycleProjs, cycleTime, perProjDamage, formatDmgFn)
    }
    return formatMultiRackSalvoCycle(weapon, cycleProjs, cycleTime, perProjDamage, hasMuzzleSalvo, hasMultiMuzzleSingleRack, formatDmgFn)
  }

  return formatCommonCycle(cycleProjs, cycleTime, perProjDamage, dot, nullIfSimple)
}

// Re-export helpers used externally
export { calculateProjectileDamage, getDoTBreakdown }
