import { round } from '@/composables/helpers/common.js'
import { getBeamDamageTicks, getRoundedTime } from './calculations.js'
import { isAntiMissileFlare, isAntiTorpedo, isMissile, isTorpedo } from '@/composables/helpers/weaponHelper.js'

const roughRound = (num) => round(num, 1)

const splitProjCount = (weapon, cycleProjs) =>  weapon.__splitCount? `${cycleProjs}x${weapon.__splitCount}` : cycleProjs
const splitDamage = (weapon, damage) => damage / (weapon.__splitCount || 1)
const generateMissileSplitTooltip = (weapon, first) => {
  if (!weapon.SplitDamage) return ''
  return `${!first?'\n\n':''}Projectile splits into ${weapon.childCount}\nchildren upon destruction\n(${weapon.SplitDamage.DamageAmount} dmg, ${weapon.SplitDamage.DamageRadius} AoE each)`
}
const generateAntitorpedoFlareTooltip = (weapon, first) => {
  if (!weapon.DepthCharge?.ProjectilesToDeflect) return ''
  return `${!first?'\n\n':''}Flare: projectile deflects\n up to ${weapon.DepthCharge.ProjectilesToDeflect} torpedoes in ${weapon.DepthCharge.Radius} radius`
}
const generateAntimissileFlareTooltip = (weapon, first) => {
  if (!weapon.isAntiMissileFlare?.deflectLimit) return ''
  return `${!first?'\n\n':''}Flare: projectile deflects\n up to ${weapon.isAntiMissileFlare?.deflectLimit} missiles in ${weapon.isAntiMissileFlare?.deflectRadius} radius`
}

const getAllTooltips = (weapon, first) => {
  const missile = generateMissileSplitTooltip(weapon, first)
  const flare = generateAntitorpedoFlareTooltip(weapon, first && !missile)
  const antiMissileFlare = generateAntimissileFlareTooltip(weapon, first && !missile && !flare)
  return missile + flare + antiMissileFlare
}

export const formatDmg = (dmg, dot, perProjDamage) => {
  if (!dot.hasDoT) return `${roughRound(dmg)}\xA0dmg\xA0total`
  const instantPart = roughRound(dot.instant * (dmg / perProjDamage))
  const dotPart = roughRound(dot.dotTotal * (dmg / perProjDamage))
  return `${instantPart}dmg +\xA0${dotPart}\xA0DoT`
}

export const formatStandardBeamCycle = (weapon, cycleProjs, cycleTime) => {
  const damageTicks = getBeamDamageTicks(weapon)
  const combinedPerTick = weapon.Damage * cycleProjs
  const totalDamage = combinedPerTick * damageTicks
  const reloadTime = Math.max(0, cycleTime - damageTicks * 0.1)

  let result = `${damageTicks} times / 0.1\xA0sec ${roughRound(combinedPerTick)}\xA0dmg`
  if (reloadTime > 0.1) result += ` +\n${reloadTime.toFixed(1)}s\xA0reload`
  result += ` = ${roughRound(totalDamage)}\xA0dmg\xA0total`

  return result
}

export const formatMuzzleSalvoCycle = (weapon, cycleProjs, cycleTime, perProjDamage, formatDmgFn) => {
  const muzzleChargeDelay = weapon.MuzzleChargeDelay || 0
  const muzzleDelay = getRoundedTime(weapon, 'MuzzleSalvoDelay')

  const salvoTime = muzzleChargeDelay > 0
    ? muzzleChargeDelay + (cycleProjs - 1) * (muzzleDelay + muzzleChargeDelay)
    : (cycleProjs - 1) * muzzleDelay + 0.1

  const actualReload = cycleTime - salvoTime
  const reloadText = actualReload > 0 ? ` +\n${actualReload.toFixed(1)}s reload` : ''

  return `${splitProjCount(weapon, cycleProjs)} times ${roughRound(splitDamage(weapon, perProjDamage))}dmg in ${salvoTime.toFixed(1)}s${reloadText} = ${cycleTime.toFixed(1)}s total,\n${formatDmgFn(perProjDamage * cycleProjs)}` + getAllTooltips(weapon)
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

  let damagePerShot = roughRound(splitDamage(weapon, dmgPerShot))
  if (projsPerShot > 1 && (isAntiTorpedo(weapon) || isTorpedo(weapon))) {
    damagePerShot =  projsPerShot + 'x' + roughRound(splitDamage(weapon, perProjDamage))
  }
  return `${splitProjCount(weapon, shots)}\xA0times ${damagePerShot}dmg in\xA0${actualFiringTime.toFixed(1)}s${reloadText} = ${cycleTime.toFixed(1)}s\xA0total, ${formatDmgFn(perProjDamage * cycleProjs)}` + getAllTooltips(weapon)
}

export const formatNukeCycle = (weapon) => {
  const innerTotal = weapon.NukeInnerRingDamage + weapon.NukeOuterRingDamage
  const inner = `${roughRound(innerTotal)}\xA0dmg in\xA0${weapon.NukeInnerRingRadius}\xA0radius`
  const outer = `${roughRound(weapon.NukeOuterRingDamage)}\xA0dmg in\xA0${weapon.NukeOuterRingRadius}\xA0radius`
  return `${inner},\n${outer}` + getAllTooltips(weapon)
}

export const formatCommonCycle = (weapon, cycleProjs, perProjDamage, formatDmgFn, hasDot) => {
  const fragmentsCount = weapon.__fragmentCount
  if (fragmentsCount) {
    if (cycleProjs > 1)
      return `${cycleProjs} projectiles, each splits into ${fragmentsCount} fragments of\xA0${roughRound(perProjDamage / fragmentsCount)}dmg`
    else
      return `Projectile splits into ${fragmentsCount} fragments,\n ${roughRound(perProjDamage / fragmentsCount)}\xA0dmg\xA0each`
  }
  if (!hasDot) {
    if (cycleProjs > 1) { 
      if (isMissile(weapon))
        return 'Launches ' + cycleProjs + ' missiles at once' + generateMissileSplitTooltip(weapon)
      if (isTorpedo(weapon))
        return 'Launches ' + cycleProjs + ' torpedoes at once'
      if (isAntiTorpedo(weapon))
        return 'Launches ' + cycleProjs + ' anti-torpedoes at once' + generateAntitorpedoFlareTooltip(weapon)
      if (isAntiMissileFlare(weapon))
        return 'Launches ' + cycleProjs + ' anti-missiles at once' + generateAntimissileFlareTooltip(weapon)
    }
    return getAllTooltips(weapon, true)
  }
  const totalDamage = perProjDamage * cycleProjs
  if (cycleProjs == 1) return formatDmgFn(totalDamage)
  return `${formatDmgFn(totalDamage)}\nin ${cycleProjs} projectiles` + getAllTooltips(weapon)
}
