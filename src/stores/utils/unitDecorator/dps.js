import { projectileMultiplierLookup } from './exceptions.js'

const formatBeamCycle = (shots, cycle, totalDmg) =>
  `${shots} beam(s) / ${cycle}s, ${totalDmg} dmg total`

const formatContinuousBeam = (dmg) =>
  `continuous beam: ${dmg}`

const formatSalvoCycle = (projectiles, salvoDelay, reload, cycle, totalDmg) =>
  `${projectiles} times 1 projectile / ${salvoDelay} sec + ${reload} sec reload = ${cycle} sec total, ${totalDmg} dmg total`

const formatStandardShots = (shots, cycle, totalDmg) => {
  const plural = shots > 1 ? 's' : ''
  const cycleTime = cycle === 1 ? '' : Math.round(cycle * 10) / 10
  return `${shots} shot${plural} / ${cycleTime} sec<br/>${totalDmg} total dmg`
}


export const calculateDps = (weapon, stats, isSpecial) => {
  if (weapon.NukeWeapon) return -1
  if (isSpecial) return (stats.shots * weapon.Damage * stats.dotPulse) / stats.cycle

  const trueReloadBase = Math.max(0.1 * Math.floor(10 / weapon.RateOfFire), 0.1)
  const trueReload = Math.max(
    (weapon.RackSalvoChargeTime || 0) +
    (weapon.RackSalvoReloadTime || 0) +
    (weapon.MuzzleSalvoDelay || 0) * ((weapon.MuzzleSalvoSize || 1) - 1),
    trueReloadBase
  )

  let trueSalvoSize = 1
  if ((weapon.MuzzleSalvoDelay || 0) > 0) {
    trueSalvoSize = weapon.MuzzleSalvoSize || 1
  } else if (weapon.RackBones && weapon.RackBones.length > 0) {
    if (weapon.RackFireTogether) {
      trueSalvoSize = weapon.RackBones.length * weapon.RackBones[0].MuzzleBones.length
    } else {
      trueSalvoSize = weapon.RackBones[0].MuzzleBones.length
    }
  }

  let trueDamage = weapon.Damage * (weapon.DoTPulses || 1) + (weapon.InitialDamage || 0)
  trueDamage = Math.max(
    (Math.floor((weapon.BeamLifetime || 0) / ((weapon.BeamCollisionDelay || 0) + 0.1)) + 1) * weapon.Damage,
    trueDamage
  )

  const salvoDamage = trueSalvoSize * trueDamage * (isSpecial ? weapon.ProjectilesPerOnFire || 1 : 1)
  const trueDPS = salvoDamage / trueReload

  return trueDPS
}

export const weaponStats = (weapon) => {
  let shots = weapon.ManualFire ? 1 : 0
  const rate = weapon.RateOfFire
  let cycle = 1 / rate
  const ppf = weapon.ProjectilesPerOnFire ? weapon.ProjectilesPerOnFire : 1
  let salvoSize = typeof weapon.MuzzleSalvoSize !== 'undefined' ? weapon.MuzzleSalvoSize : 1
  let salvoDelay = typeof weapon.MuzzleSalvoDelay !== 'undefined' ? weapon.MuzzleSalvoDelay : 1
  const dotPulse = typeof weapon.DoTPulses !== 'undefined' ? weapon.DoTPulses : 1
  const rackCount = weapon.RackBones ? weapon.RackBones.length : 1
  const damage = weapon.Damage * ppf * dotPulse

  salvoDelay = salvoDelay === 0 ? 0 : salvoDelay - 0.1

  const x = Math.pow(10, 1 || 0)
  cycle = Math.round((cycle || 0) * x) / x
  salvoDelay = Math.round((salvoDelay || 0) * x) / x
  salvoSize = Math.round((salvoSize || 0) * x) / x

  if (weapon.MuzzleSalvoDelay === 0) {
    shots += weapon.RackBones[0].MuzzleBones.length
  }

  if (((typeof weapon.ProjectileId !== 'undefined') || (typeof weapon.ProjectileLifetimeUsesMultiplier !== 'undefined')) &&
    typeof weapon.ForceSingleFire === 'undefined') {
    if (salvoDelay === 0) {
      shots = weapon.RackBones[0].MuzzleBones.length
      if (weapon.RackFireTogether) {
        shots = shots * rackCount
      }
    } else {
      shots = salvoSize
      if (weapon.RackFireTogether) {
        shots = shots * rackCount
      }
    }

    if (projectileMultiplierLookup[weapon.ProjectileId]) {
      shots = projectileMultiplierLookup[weapon.ProjectileId]
    }

    if (weapon.RateOfFire !== 1) {
      cycle = weapon.WeaponCategory === 'Kamikaze' ? 1 : cycle
    } else if (weapon.RackSalvoReloadTime !== 0) {
      const reloadCharge = weapon.RackSalvoChargeTime !== 0 ? Math.floor(weapon.RackSalvoReloadTime / weapon.RackSalvoChargeTime) : 0
      const salvoReload = weapon.RackSalvoChargeTime > weapon.RackSalvoReloadTime ? weapon.RackSalvoChargeTime : reloadCharge + weapon.RackSalvoReloadTime
      cycle = salvoReload + rate + salvoDelay * shots
    } else {
      cycle = weapon.RackSalvoChargeTime + weapon.RateOfFire
    }
  }

  return { shots, cycle, damage, salvoDelay, salvoSize, dotPulse }
}

export const fireCycle = (weapon) => {
  const stats = weaponStats(weapon)

  if (weapon.BeamLifetime === 1) {
    return formatBeamCycle(stats.shots, stats.cycle, (11 * weapon.Damage) * stats.shots)
  }

  if (weapon.BeamLifetime === 0) {
    return formatContinuousBeam(weapon.Damage * stats.shots)
  }

  if (stats.salvoDelay !== 0) {
    const projectiles = stats.shots
    const x = Math.pow(10, 1 || 0)
    const reload = Math.round(((stats.cycle - ((projectiles - 1) * stats.salvoDelay)) || 0) * x) / x
    return formatSalvoCycle(projectiles, stats.salvoDelay, reload, stats.cycle, weapon.Damage * projectiles)
  }

  return formatStandardShots(stats.shots, stats.cycle, weapon.Damage * stats.shots)
}

const formatBeamCollisionCycle = (shots, dmg, perShotDelay, totalDmg) => {
  const delayText = shots > 1 ? `/ ${perShotDelay} sec ` : ''
  return `${shots} times ${dmg} dmg ${delayText}${totalDmg} dmg total`
}

const formatStandardBeam = (dmg, totalDmg) =>
  `11 times / 0.1 sec ${dmg} dmg = ${totalDmg} dmg total, 1.1 sec total`

//TODO why we even have "strandard" beam? Whats the diff?

const formatNonStandardBeam = (dmg, lifetime) =>
  `${lifetime * 10 + 1} times / 0.1 sec ${dmg} dmg = ${(lifetime * 10 + 1) * dmg} dmg total, 1.1 sec total`

const formatDotPulses = (pulses, dmg, timePerPulse, totalDmg, totalTime) =>
  `${pulses} times ${dmg} dmg / ${timePerPulse} sec = ${totalDmg} total ${totalTime} sec total`

export const beamCycle = (weapon) => {
  if (weapon.BeamCollisionDelay > 0.1) {
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

export const getDps = (weapon, isSpecial) => {
  const stats = weaponStats(weapon)
  if (weapon.ForceSingleFire) return null
  return calculateDps(weapon, stats, isSpecial)
}

export const isTML = (weapon) => !!weapon.ForceSingleFire