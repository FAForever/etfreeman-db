// FA Game-Accurate DPS Calculator
// Based on: fa\lua\ui\game\unitviewDetail.lua

// Banker's rounding to 0.1 precision - per FA engine spec
// At .05 boundary, rounds to even tenth: 1.75 → 1.8, 1.65 → 1.6
// See: fa\engine\Core.lua
export const MATH_IRound = (val) => {
  const scaled = val * 10
  const rounded = Math.round(scaled)

  // Check if we're exactly at .5 (tie case)
  const diff = Math.abs(scaled - rounded)
  if (diff === 0.5) {
    // Round to nearest even integer
    return (rounded % 2 === 0 ? rounded : rounded - 1) / 10
  }

  return rounded / 10
}

export const calculateProjectileDamage = (weapon, toShields = false) => {
  let damage = weapon.TractorDamage ||weapon.Damage || 0
  if (weapon.NukeInnerRingDamage) {
    return damage + weapon.NukeInnerRingDamage + weapon.NukeOuterRingDamage
  }

  if (toShields && weapon.DamageToShields) {
    damage += weapon.DamageToShields
  }

  if ((weapon.BeamLifetime || 0) > 0) {
    const beamTicks = Math.floor(MATH_IRound(weapon.BeamLifetime * 10))
    const collisionTicks = Math.floor(MATH_IRound((weapon.BeamCollisionDelay || 0) * 10))
    damage = damage * (1 + Math.floor(beamTicks / (collisionTicks + 1)))
  } else {
    damage = damage * (weapon.DoTPulses || 1) + (weapon.InitialDamage || 0)

    // Use pre-calculated total fragment multiplier (includes nested fragments)
    if (weapon.ProjectileFragmentMultiplier) {
      damage *= weapon.ProjectileFragmentMultiplier
    }
  }

  return damage
}

export const getBeamDamageTicks = (weapon) => {
  if (!weapon.BeamLifetime || weapon.BeamLifetime <= 0) return 0
  const beamTicks = Math.floor(MATH_IRound(weapon.BeamLifetime * 10))
  const collisionTicks = Math.floor(MATH_IRound((weapon.BeamCollisionDelay || 0) * 10))
  return 1 + Math.floor(beamTicks / (collisionTicks + 1))
}

export const getDoTBreakdown = (weapon) => {
  if (weapon.BeamLifetime !== undefined) return { hasDoT: false }

  const hasDoT = (weapon.DoTPulses || 1) > 1
  if (!hasDoT) return { hasDoT: false }

  const ticks = (weapon.DoTPulses || 1) - 1
  const instant = weapon.Damage + (weapon.InitialDamage || 0)
  const dotTotal = weapon.Damage * ticks

  return {
    hasDoT: true,
    instant,
    dotTotal,
    ticks,
    interval: weapon.DoTTime / ticks,
    totalTime: weapon.DoTTime
  }
}

export const simulateFiringCycle = (weapon) => {
  let cycleProjs = 0
  let cycleTime = 0

  const firingCooldown = Math.max(0.1, (weapon.TractorDamageInterval || MATH_IRound(10 / weapon.RateOfFire)) / 10)
  if (firingCooldown * 10 % 1) {
    console.error('Bad firing cooldown:', firingCooldown, ' engine will round it to something?')
  }

  let chargeTime = weapon.RackSalvoChargeTime || 0
  if (chargeTime > 0) {
    chargeTime = Math.max(0.1, MATH_IRound(10 * chargeTime) / 10)
  }

  let muzzleDelays = weapon.MuzzleSalvoDelay || 0
  if (muzzleDelays > 0) {
    muzzleDelays = Math.max(0.1, MATH_IRound(10 * muzzleDelays) / 10)
  }

  let muzzleChargeDelay = weapon.MuzzleChargeDelay || 0
  if (muzzleChargeDelay > 0) {
    muzzleChargeDelay = Math.max(0.1, MATH_IRound(10 * muzzleChargeDelay) / 10)
  }

  let reloadTime = weapon.RackSalvoReloadTime || 0
  if (reloadTime > 0) {
    reloadTime = Math.max(0.1, MATH_IRound(10 * reloadTime) / 10)
  }

  let subCycleTime = 0
  const rackBones = weapon.RackBones
  const rackCount = rackBones?.length || 0
  // RackSalvoSize only limits racks when: RackFireTogether=false AND MuzzleSalvoDelay > 0
  const shouldLimitRacks = !weapon.RackFireTogether && (weapon.MuzzleSalvoDelay || 0) > 0
  const racksToFire = shouldLimitRacks && rackCount > 0
    ? Math.min(weapon.RackSalvoSize ?? rackCount, rackCount)
    : rackCount

  if (rackBones && rackBones.length > 0) {
    for (let index = 0; index < racksToFire; index++) {
      const rack = rackBones[index]
      let muzzleCount = weapon.MuzzleSalvoSize || 1

      if ((weapon.MuzzleSalvoDelay || 0) === 0) {
        muzzleCount = rack.MuzzleBones ? rack.MuzzleBones.length : 1
      }

      cycleProjs += muzzleCount
      subCycleTime += muzzleCount * muzzleDelays + muzzleCount * muzzleChargeDelay

      if (!weapon.RackFireTogether && index !== racksToFire - 1) {
        if (firingCooldown <= subCycleTime + chargeTime) {
          cycleTime += subCycleTime + chargeTime + Math.max(0.1, firingCooldown - subCycleTime - chargeTime)
        } else {
          cycleTime += firingCooldown
        }
        subCycleTime = 0
      }
    }
  } else {
    // No RackBones data - default to at least 1 projectile
    cycleProjs = weapon.MuzzleSalvoSize || 1
  }
  if (firingCooldown <= (subCycleTime + chargeTime + reloadTime)) {
    cycleTime += subCycleTime + reloadTime + chargeTime + Math.max(0.1, firingCooldown - subCycleTime - chargeTime - reloadTime)
  } else {
    cycleTime += firingCooldown
  }

  const isSequentialSingleFire =
    racksToFire > 1 &&
    !weapon.RackFireTogether &&
    weapon.RackBones?.every(r => !r.MuzzleBones || r.MuzzleBones.length === 1) &&
    !(weapon.MuzzleSalvoDelay || weapon.RackSalvoReloadTime ||
      (weapon.RackSalvoChargeTime && weapon.RackFireTogether))

  if (isSequentialSingleFire) {
    cycleTime /= cycleProjs
    cycleProjs = 1
  }

  if ((weapon.WeaponUnpackAnimation && weapon.NukeInnerRingDamage) || isNaN(cycleTime)) {
    cycleTime = null
  }

  weapon.__cycleProjs = cycleProjs
  weapon.__cycleTime = cycleTime

  return { cycleProjs, cycleTime }
}

export const calculateDps = (weapon, toShields = false) => {
  if (!weapon.RateOfFire || weapon.ForceSingleFire || weapon.FireOnDeath || ['Teleport',"Kamikaze"].includes(weapon.WeaponCategory)) return null

  const damage = calculateProjectileDamage(weapon, toShields)
  const { cycleProjs, cycleTime } = simulateFiringCycle(weapon)
  //if (weapon.__unitID == 'UAA0310') console.log(weapon)
    
  return Number(((damage * cycleProjs) / cycleTime).toFixed(2))
}

const formatBeamCollisionCycle = (shots, dmg, perShotDelay, totalDmg) => {
  const delayText = shots > 1 ? `/ ${perShotDelay} sec ` : ''
  return `${shots} times ${dmg} dmg ${delayText}${totalDmg} dmg total`
}

const formatNonStandardBeam = (dmg, lifetime, collisionDelay = 0) => {
  const ticks = getBeamDamageTicks({ BeamLifetime: lifetime, BeamCollisionDelay: collisionDelay })
  return `${ticks} times / 0.1 sec ${dmg} dmg = ${ticks * dmg} dmg total`
}

const formatDotPulses = (pulses, dmg, timePerPulse, totalDmg, totalTime) =>
  `${pulses} times ${dmg} dmg / ${timePerPulse} sec = ${totalDmg} total ${totalTime} sec total`

export const beamCycle = (weapon) => {
  if (weapon.BeamCollisionDelay >= 0.1) {
    const shots = Math.round(weapon.BeamLifetime / (0.1 + weapon.BeamCollisionDelay))
    const perShotDelay = weapon.BeamCollisionDelay + 0.1
    return formatBeamCollisionCycle(shots, weapon.Damage, perShotDelay, weapon.Damage * shots)
  }

  if (weapon.BeamLifetime) {
    return formatNonStandardBeam(weapon.Damage, weapon.BeamLifetime, weapon.BeamCollisionDelay || 0)
  }

  if (weapon.DoTPulses) {
    const timePerPulse = weapon.DoTTime / 10
    const totalDmg = weapon.damage * weapon.DoTPulses
    const totalTime = weapon.DoTTime / 10 * weapon.DoTPulses - 0.1
    return formatDotPulses(weapon.DoTPulses, weapon.Damage, timePerPulse, totalDmg, totalTime)
  }

  return `${weapon.Damage} dmg`
}

export const fireCycle = (weapon) => {
  const perProjDamage = calculateProjectileDamage(weapon)
  const { cycleProjs, cycleTime } = simulateFiringCycle(weapon)
  const totalDamage = perProjDamage * cycleProjs

  if (weapon.BeamLifetime === 0) {
    return `continuous beam: ${Math.round(totalDamage)}`
  }

  if (weapon.BeamLifetime) {
    return `${cycleProjs} beam${cycleProjs > 1 ? 's' : ''} / ${cycleTime}s, ${Math.round(totalDamage)} dmg total`
  }

  const hasMuzzleSalvo = (weapon.MuzzleSalvoDelay || 0) > 0
  const hasMultiRackSequential = (weapon.RackBones?.length > 1) && !weapon.RackFireTogether
  const hasMultiMuzzleSingleRack = weapon.RackBones?.length === 1 &&
    weapon.RackBones[0].MuzzleBones?.length > 1 &&
    (weapon.MuzzleChargeDelay || 0) > 0
  const isSalvo = hasMuzzleSalvo || hasMultiRackSequential || hasMultiMuzzleSingleRack

  if (isSalvo && cycleProjs > 1) {
    const reloadTime = weapon.RackSalvoReloadTime || 0
    const firingTime = cycleTime - reloadTime
    const muzzleChargeDelay = weapon.MuzzleChargeDelay || 0

    if (hasMuzzleSalvo) {
      const muzzleDelay = weapon.MuzzleSalvoDelay || 0
      const salvoTime = muzzleChargeDelay > 0
        ? muzzleChargeDelay + (cycleProjs - 1) * (muzzleDelay + muzzleChargeDelay)
        : (cycleProjs - 1) * muzzleDelay + 0.1
      const actualReload = cycleTime - salvoTime
      return `${cycleProjs} times 1 projectile in ${salvoTime.toFixed(1)} sec ${actualReload ? `+ ${actualReload.toFixed(1)} sec reload ` : ''}= ${cycleTime.toFixed(1)} sec total, ${Math.round(totalDamage)} dmg total`
    }

    const rackCount = weapon.RackBones?.length || 1
    const shots = hasMuzzleSalvo ? cycleProjs : rackCount
    const projsPerShot = cycleProjs / shots
    return `${shots} times ${projsPerShot} projectiles in ${firingTime.toFixed(1)} sec ${reloadTime ? `+ ${reloadTime.toFixed(1)} sec reload ` : ''}= ${cycleTime.toFixed(1)} sec total, ${Math.round(totalDamage)} dmg total`
  }

  const plural = cycleProjs > 1 ? 's' : ''
  const cycleTimeText = cycleTime === 1 ? '' : cycleTime.toFixed(1)
  return `${cycleProjs} shot${plural} / ${cycleTimeText} sec<br/>${Math.round(totalDamage)} total dmg`
}

export const getDetailedCycle = (weapon, toShields = false, nullIfSimple = true) => {
  if (toShields) return null // TODO: handle cycle to shields

  const { cycleProjs, cycleTime } = simulateFiringCycle(weapon)
  if (!cycleTime) return null

  // Beam weapon - combine beamCycle internals with fireCycle reload
  if (weapon.BeamLifetime && weapon.BeamLifetime !== 0) {
    const damageTicks = getBeamDamageTicks(weapon)
    const perBeamPerTick = weapon.Damage
    const combinedPerTick = perBeamPerTick * cycleProjs
    const totalDamage = combinedPerTick * damageTicks

    const reloadTime = Math.max(0, cycleTime - damageTicks * 0.1)
    let result = `${damageTicks} times / 0.1 sec ${Math.round(combinedPerTick)} dmg` + (reloadTime > 0.1? ' +\n ':'')
    if (reloadTime > 0.1) result += `${reloadTime.toFixed(1)}s reload`
    result += ` = ${Math.round(totalDamage)} dmg total`

    return result
  }

  // Continuous beam - return null or format based on nullIfSimple parameter
  if (weapon.BeamLifetime === 0) {
    if (nullIfSimple) return null
    return `continuous beam: ${Math.round(calculateProjectileDamage(weapon) * cycleProjs)}`
  }

  // Non-beam weapons - custom format showing damage per projectile instead of count
  const perProjDamage = calculateProjectileDamage(weapon)
  const totalDamage = perProjDamage * cycleProjs
  const dot = getDoTBreakdown(weapon)
  const formatDmg = (dmg) => {
    if (!dot.hasDoT) return `${Math.round(dmg)} dmg total`
    const instantPart = Math.round(dot.instant * (dmg / perProjDamage))
    const dotPart = Math.round(dot.dotTotal * (dmg / perProjDamage))
    return `${instantPart}dmg + ${dotPart} DoT dmg`
  }
  const hasMuzzleSalvo = (weapon.MuzzleSalvoDelay || 0) > 0
  const hasMultiRackSequential = (weapon.RackBones?.length > 1) && !weapon.RackFireTogether
  const hasMultiMuzzleSingleRack = weapon.RackBones?.length === 1 &&
    weapon.RackBones[0].MuzzleBones?.length > 1 &&
    (weapon.MuzzleChargeDelay || 0) > 0
  const isSalvo = hasMuzzleSalvo || hasMultiRackSequential || hasMultiMuzzleSingleRack

  if (isSalvo && cycleProjs > 1) {
    const reloadTime = weapon.RackSalvoReloadTime || 0
    const firingTime = cycleTime - reloadTime
    const muzzleChargeDelay = weapon.MuzzleChargeDelay || 0

    if (hasMuzzleSalvo) {
      const muzzleDelay = weapon.MuzzleSalvoDelay || 0
      const salvoTime = muzzleChargeDelay > 0
        ? muzzleChargeDelay + (cycleProjs - 1) * (muzzleDelay + muzzleChargeDelay)
        : (cycleProjs - 1) * muzzleDelay + 0.1
      const actualReload = cycleTime - salvoTime
      const hasReload = actualReload > 0.1
      const displaySalvoTime = salvoTime
      const displayReload = actualReload
      return `${cycleProjs} times ${Math.round(perProjDamage)}dmg in ${displaySalvoTime.toFixed(1)}s${displayReload > 0 ? ` +\n${displayReload.toFixed(1)}s reload` : ''} = ${cycleTime.toFixed(1)}s total,\n${formatDmg(totalDamage)}`
    }

    const rackCount = weapon.RackBones?.length || 1
    const shots = hasMuzzleSalvo ? cycleProjs : (hasMultiMuzzleSingleRack ? cycleProjs : rackCount)
    const projsPerShot = cycleProjs / shots
    const dmgPerShot = perProjDamage * projsPerShot
    const actualFiringTime = hasMultiMuzzleSingleRack ? cycleProjs * (weapon.MuzzleChargeDelay || 0) : firingTime
    const actualCycleTime = hasMultiMuzzleSingleRack ? cycleTime : cycleTime
    const actualReloadTime = hasMultiMuzzleSingleRack ? cycleTime - actualFiringTime : cycleTime - firingTime
    return `${shots} times ${Math.round(dmgPerShot)}dmg in ${actualFiringTime.toFixed(1)}s${actualReloadTime > 0 ? ` +\n ${actualReloadTime.toFixed(1)}s reload` : ''} = ${actualCycleTime.toFixed(1)}s total,\n${formatDmg(totalDamage)}`
  }

  // Simple shots (no salvo) - return null or format based on nullIfSimple parameter
  if (nullIfSimple) return null

  const plural = cycleProjs > 1 ? 's' : ''
  const cycleTimeText = cycleTime === 1 ? '' : cycleTime.toFixed(1)
  return `${formatDmg(totalDamage)}\n${cycleProjs} shot${plural} / ${cycleTimeText}s`
}

export const getShotsAmount = (weapon) => {
  if (weapon.BeamLifetime === 0 || weapon.BeamLifetime) return null
  const { cycleProjs, cycleTime } = simulateFiringCycle(weapon)

  const hasMuzzleSalvo = (weapon.MuzzleSalvoDelay || 0) > 0
  const hasMultiRackSequential = (weapon.RackBones?.length > 1) && !weapon.RackFireTogether
  const hasMultiMuzzleSingleRack = weapon.RackBones?.length === 1 &&
    weapon.RackBones[0].MuzzleBones?.length > 1 &&
    (weapon.MuzzleChargeDelay || 0) > 0
  const isSalvo = hasMuzzleSalvo || hasMultiRackSequential || hasMultiMuzzleSingleRack
  if (isSalvo && cycleProjs > 1) return null
  return cycleProjs
}

export const formatDotText = (weapon) => {
  if (!weapon.DoTPulses || !weapon.DoTTime) return null

  const interval = weapon.DoTTime / (weapon.DoTPulses - 1)
  const nonInitialPulses = weapon.DoTPulses - 1
  const damagePerTick = weapon.Damage

  return `+ after ${interval.toFixed(1)} sec, ${nonInitialPulses} tick${nonInitialPulses > 1 ? 's' : ''} of ${damagePerTick}dmg${nonInitialPulses > 1 ? ` / ${interval.toFixed(1)} sec` : ''}`
}

export const isTML = (weapon) => !!weapon.ForceSingleFire
