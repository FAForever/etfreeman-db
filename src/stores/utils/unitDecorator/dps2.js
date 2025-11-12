// FA Game-Accurate DPS Calculator
// Based on: fa\lua\ui\game\unitviewDetail.lua

import projectiles from '../../../../tools/generator/data/projectiles.json'

const MATH_IRound = (val) => Math.round(val * 10) / 10

const getFragmentMultiplier = (fragmentId) => {
  let multiplier = 1
  let currentId = fragmentId

  while (currentId) {
    const fragment = projectiles[currentId.toLowerCase()]
    if (!fragment || !fragment.fragments) break

    multiplier *= fragment.fragments
    currentId = fragment.fragmentId
  }

  return multiplier
}

const calculateProjectileDamage = (weapon, toShields = false) => {
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

    if (weapon.ProjectileFragments) {
      damage *= weapon.ProjectileFragments

      // Check for nested fragmentation
      if (weapon.ProjectileFragmentId) {
        damage *= getFragmentMultiplier(weapon.ProjectileFragmentId)
      }
    }
  }

  return damage
}

const simulateFiringCycle = (weapon) => {
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
