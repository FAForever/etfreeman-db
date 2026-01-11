// FA Game-Accurate DPS Calculator
// Based on: fa\lua\ui\game\unitviewDetail.lua

const MATH_IRound = (val) => Math.round(val * 10) / 10

export const calculateProjectileDamage = (weapon, toShields = false) => {
  let damage = weapon.Damage || 0

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

export const simulateFiringCycle = (weapon) => {
  let cycleProjs = 0
  let cycleTime = 0

  const firingCooldown = Math.max(0.1, MATH_IRound(10 / weapon.RateOfFire) / 10)

  let chargeTime = weapon.RackSalvoChargeTime || 0
  if (chargeTime > 0) {
    chargeTime = Math.max(0.1, MATH_IRound(10 * chargeTime) / 10)
  }

  let muzzleDelays = weapon.MuzzleSalvoDelay || 0
  if (muzzleDelays > 0) {
    muzzleDelays = Math.max(0.1, MATH_IRound(10 * muzzleDelays) / 10)
  }

  const muzzleChargeDelay = weapon.MuzzleChargeDelay || 0
  if (muzzleChargeDelay > 0) {
    muzzleDelays = muzzleDelays + Math.max(0.1, MATH_IRound(10 * muzzleChargeDelay) / 10)
  }

  let reloadTime = weapon.RackSalvoReloadTime || 0
  if (reloadTime > 0) {
    reloadTime = Math.max(0.1, MATH_IRound(10 * reloadTime) / 10)
  }

  let subCycleTime = 0
  const rackBones = weapon.RackBones

  if (rackBones && rackBones.length > 0) {
    const rackCount = rackBones.length

    for (let index = 0; index < rackCount; index++) {
      const rack = rackBones[index]
      let muzzleCount = weapon.MuzzleSalvoSize || 1

      if ((weapon.MuzzleSalvoDelay || 0) === 0) {
        muzzleCount = rack.MuzzleBones ? rack.MuzzleBones.length : 1
      }

      cycleProjs += muzzleCount
      subCycleTime += muzzleCount * muzzleDelays

      if (!weapon.RackFireTogether && index !== rackCount - 1) {
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

  return { cycleProjs, cycleTime }
}

export const calculateDps2 = (weapon, toShields = false) => {
  if (weapon.NukeWeapon) return -1
  if (weapon.ForceSingleFire) return null

  const damage = calculateProjectileDamage(weapon, toShields)
  const { cycleProjs, cycleTime } = simulateFiringCycle(weapon)

  return Number(((damage * cycleProjs) / cycleTime).toFixed(2))
}

const formatBeamCollisionCycle = (shots, dmg, perShotDelay, totalDmg) => {
  const delayText = shots > 1 ? `/ ${perShotDelay} sec ` : ''
  return `${shots} times ${dmg} dmg ${delayText}${totalDmg} dmg total`
}

const formatStandardBeam = (dmg, totalDmg) =>
  `11 times / 0.1 sec ${dmg} dmg = ${totalDmg} dmg total, 1.1 sec total`

const formatNonStandardBeam = (dmg, lifetime) =>
  `${lifetime * 10 + 1} times / 0.1 sec ${dmg} dmg = ${(lifetime * 10 + 1) * dmg} dmg total`

const formatDotPulses = (pulses, dmg, timePerPulse, totalDmg, totalTime) =>
  `${pulses} times ${dmg} dmg / ${timePerPulse} sec = ${totalDmg} total ${totalTime} sec total`

export const beamCycle = (weapon) => {
  if (weapon.BeamCollisionDelay >= 0.1) {
    const shots = Math.round(weapon.BeamLifetime / (0.1 + weapon.BeamCollisionDelay))
    const perShotDelay = weapon.BeamCollisionDelay + 0.1
    return formatBeamCollisionCycle(shots, weapon.Damage, perShotDelay, weapon.Damage * shots)
  }

  if (weapon.BeamLifetime) {
    return formatNonStandardBeam(weapon.Damage, weapon.BeamLifetime)
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
    return `${cycleProjs} beam${cycleProjs > 1? 's': ''} / ${cycleTime}s, ${Math.round(totalDamage)} dmg total`
  }

  const hasMuzzleSalvo = (weapon.MuzzleSalvoDelay || 0) > 0
  const hasMultiRackSequential = (weapon.RackBones?.length > 1) && !weapon.RackFireTogether
  const isSalvo = hasMuzzleSalvo || hasMultiRackSequential

  if (isSalvo && cycleProjs > 1) {
    const reloadTime = weapon.RackSalvoReloadTime || 0
    const firingTime = cycleTime - reloadTime

    if (hasMuzzleSalvo) {
      const muzzleDelay = weapon.MuzzleSalvoDelay || 0
      const salvoTime = muzzleDelay * (cycleProjs - 1)
      const actualReload = cycleTime - salvoTime
      return `${cycleProjs} times 1 projectile in ${salvoTime.toFixed(1)} sec + ${actualReload.toFixed(1)} sec reload = ${cycleTime.toFixed(1)} sec total, ${Math.round(totalDamage)} dmg total`
    }

    const rackCount = weapon.RackBones?.length || 1
    const shots = hasMuzzleSalvo ? cycleProjs : rackCount
    const projsPerShot = cycleProjs / shots
    return `${shots} times ${projsPerShot} projectiles in ${firingTime.toFixed(1)} sec + ${reloadTime.toFixed(1)} sec reload = ${cycleTime.toFixed(1)} sec total, ${Math.round(totalDamage)} dmg total`
  }

  const plural = cycleProjs > 1 ? 's' : ''
  const cycleTimeText = cycleTime === 1 ? '' : cycleTime.toFixed(1)
  return `${cycleProjs} shot${plural} / ${cycleTimeText} sec<br/>${Math.round(totalDamage)} total dmg`
}

export const formatDotText = (weapon) => {
  if (!weapon.DoTPulses || !weapon.DoTTime) return null

  const interval = weapon.DoTTime / (weapon.DoTPulses - 1)
  const nonInitialPulses = weapon.DoTPulses - 1
  const damagePerTick = weapon.Damage

  return `+ after ${interval.toFixed(1)} sec, ${nonInitialPulses} tick${nonInitialPulses > 1?'s':''} of ${damagePerTick}dmg${nonInitialPulses > 1?` / ${interval.toFixed(1)} sec`:''}`
}

export const isTML = (weapon) => !!weapon.ForceSingleFire
