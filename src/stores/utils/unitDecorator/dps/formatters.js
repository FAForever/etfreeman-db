import { getBeamDamageTicks, calculateProjectileDamage, getRoundedTime } from './calculations.js'

export const formatDmg = (dmg, dot, perProjDamage) => {
  if (!dot.hasDoT) return `${Math.round(dmg)} dmg total`
  const instantPart = Math.round(dot.instant * (dmg / perProjDamage))
  const dotPart = Math.round(dot.dotTotal * (dmg / perProjDamage))
  return `${instantPart}dmg + ${dotPart} DoT`
}

export const formatStandardBeamCycle = (weapon, cycleProjs, cycleTime) => {
  const damageTicks = getBeamDamageTicks(weapon)
  const combinedPerTick = weapon.Damage * cycleProjs
  const totalDamage = combinedPerTick * damageTicks
  const reloadTime = Math.max(0, cycleTime - damageTicks * 0.1)

  let result = `${damageTicks} times / 0.1 sec ${Math.round(combinedPerTick)} dmg`
  if (reloadTime > 0.1) result += ` +\n ${reloadTime.toFixed(1)}s reload`
  result += ` = ${Math.round(totalDamage)} dmg total`

  return result
}

export const formatContinuousBeamCycle = (weapon, cycleProjs, nullIfSimple) => {
  if (nullIfSimple) return null
  return `continuous beam: ${Math.round(calculateProjectileDamage(weapon) * cycleProjs)}`
}

export const formatMuzzleSalvoCycle = (weapon, cycleProjs, cycleTime, perProjDamage, formatDmgFn) => {
  const muzzleChargeDelay = weapon.MuzzleChargeDelay || 0
  const muzzleDelay = getRoundedTime(weapon, 'MuzzleSalvoDelay')

  const salvoTime = muzzleChargeDelay > 0
    ? muzzleChargeDelay + (cycleProjs - 1) * (muzzleDelay + muzzleChargeDelay)
    : (cycleProjs - 1) * muzzleDelay + 0.1

  const actualReload = cycleTime - salvoTime
  const reloadText = actualReload > 0 ? ` +\n${actualReload.toFixed(1)}s reload` : ''

  return `${cycleProjs} times ${Math.round(perProjDamage)}dmg in ${salvoTime.toFixed(1)}s${reloadText} = ${cycleTime.toFixed(1)}s total,\n${formatDmgFn(perProjDamage * cycleProjs)}`
}

export const formatMultiRackSalvoCycle = (weapon, cycleProjs, cycleTime, perProjDamage, hasMuzzleSalvo, hasMultiMuzzleSingleRack, formatDmgFn) => {
  const reloadTime = weapon.RackSalvoReloadTime || 0
  const firingTime = cycleTime - reloadTime

  const rackCount = weapon.RackBones?.length || 1
  const shots = hasMuzzleSalvo ? cycleProjs : (hasMultiMuzzleSingleRack ? cycleProjs : rackCount)
  const projsPerShot = cycleProjs / shots
  const dmgPerShot = perProjDamage * projsPerShot

  const actualFiringTime = hasMultiMuzzleSingleRack ? cycleProjs * (weapon.MuzzleChargeDelay || 0) : firingTime
  const actualReloadTime = hasMultiMuzzleSingleRack ? cycleTime - actualFiringTime : cycleTime - firingTime

  const reloadText = actualReloadTime > 0 ? ` +\n ${actualReloadTime.toFixed(1)}s reload` : ''

  return `${shots} times ${Math.round(dmgPerShot)}dmg in ${actualFiringTime.toFixed(1)}s${reloadText} = ${cycleTime.toFixed(1)}s total,\n${formatDmgFn(perProjDamage * cycleProjs)}`
}

export const formatCommonCycle = (cycleProjs, cycleTime, perProjDamage, dot, nullIfSimple) => {
  if (nullIfSimple) return null

  const formatDmgFn = (dmg) => formatDmg(dmg, dot, perProjDamage)
  const totalDamage = perProjDamage * cycleProjs
  const plural = cycleProjs > 1 ? 's' : ''
  const cycleTimeText = cycleTime === 1 ? '' : cycleTime.toFixed(1)

  return `${formatDmgFn(totalDamage)}\n${cycleProjs} shot${plural} / ${cycleTimeText}s`
}
