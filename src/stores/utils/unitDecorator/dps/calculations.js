// FA Game-Accurate DPS Calculator
// Based on: fa\lua\ui\game\unitviewDetail.lua

export const MATH_IRound = (val) => {
  const scaled = val * 10
  const rounded = Math.round(scaled)
  const diff = Math.abs(scaled - rounded)
  if (diff === 0.5) {
    return (rounded % 2 === 0 ? rounded : rounded - 1) / 10
  }
  return rounded / 10
}

export const calculateProjectileDamage = (weapon, toShields = false) => {
  let damage = weapon.TractorDamage || weapon.Damage || 0
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

export const getSalvoInfo = (weapon) => {
  const hasMuzzleSalvo = (weapon.MuzzleSalvoDelay || 0) > 0
  const hasMultiRackSequential = (weapon.RackBones?.length > 1) && !weapon.RackFireTogether
  const hasMultiMuzzleSingleRack = weapon.RackBones?.length === 1 &&
    weapon.RackBones[0].MuzzleBones?.length > 1 &&
    (weapon.MuzzleChargeDelay || 0) > 0
  return {
    hasMuzzleSalvo,
    hasMultiRackSequential,
    hasMultiMuzzleSingleRack,
    isSalvo: hasMuzzleSalvo || hasMultiRackSequential || hasMultiMuzzleSingleRack
  }
}

export const getRoundedTime = (weapon, prop) => {
  const val = weapon[prop] || 0
  return val > 0 ? Math.max(0.1, MATH_IRound(10 * val) / 10) : 0
}

export const getFiringCooldown = (weapon) => {
  return Math.max(0.1, (weapon.TractorDamageInterval || MATH_IRound(10 / weapon.RateOfFire)) / 10)
}

export const isSequentialSingleFire = (weapon, racksToFire) => {
  return (
    racksToFire > 1 &&
    !weapon.RackFireTogether &&
    weapon.RackBones?.every(r => !r.MuzzleBones || r.MuzzleBones.length === 1) &&
    !(weapon.MuzzleSalvoDelay || weapon.RackSalvoReloadTime ||
      (weapon.RackSalvoChargeTime && weapon.RackFireTogether))
  )
}

export const processRackSequence = (weapon, firingCooldown, chargeTime, muzzleDelays, muzzleChargeDelay) => {
  let cycleProjs = 0
  let cycleTime = 0
  let subCycleTime = 0

  const rackBones = weapon.RackBones
  const rackCount = rackBones?.length || 0
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
    cycleProjs = weapon.MuzzleSalvoSize || 1
  }

  return { cycleProjs, cycleTime, subCycleTime, racksToFire }
}
