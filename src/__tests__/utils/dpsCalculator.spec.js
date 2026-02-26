// DPS Calculator Tests - FA-Accurate DPS Calculation
// Tests critical weapon DPS calculations for accuracy
import { describe, it, expect } from 'vitest'
import { calculateDps, calculateFiringCycle } from '@/stores/utils/unitDecorator/dps/index.js'

const calcDps = (weapon) => {
  weapon.firingCycle = calculateFiringCycle(weapon)
  return calculateDps(weapon, false)
}

describe('DPS Calculator', () => {
  it('mantis (URL0107)', () => {
    const weapon = {
      'Damage': 8,
      'DamageRadius': 0,
      'RateOfFire': 3.3333333333333335,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle_01'] },
        { 'MuzzleBones': ['Turret_Muzzle_02'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(26.67, 1)
  })

  it('Exodus Class (UAS0201) - Oblivion Cannon', () => {
    const weapon = {
      'Damage': 1060,
      'DamageRadius': 1.4,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Front_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      'MuzzleChargeDelay': 0.1
    }
    expect(calcDps(weapon)).toBeCloseTo(212, 1)
  })

  it('Uashavoh (XSS0201) - Front Ultrachromatic Beam Generator', () => {
    const weapon = {
      'Damage': 45,
      'DamageRadius': 1,
      'BeamCollisionDelay': 0,
      'BeamLifetime': 1,
      'RateOfFire': 0.25,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Front_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(123.75, 1)
  })

  it('Uashavoh (XSS0201) - Rear Ultrachromatic Beam Generator', () => {
    const weapon = {
      'Damage': 26,
      'DamageRadius': 1,
      'BeamCollisionDelay': 0,
      'BeamLifetime': 1,
      'RateOfFire': 0.25,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Rear_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(71.5, 1)
  })

  it('Valiant Class (UES0201) - Gauss Cannon', () => {
    const weapon = {
      'Damage': 305,
      'DamageRadius': 1,
      'RateOfFire': 0.25,
      'RackBones': [
        { 'MuzzleBones': ['Front_Turret01_Muzzle01'] },
        { 'MuzzleBones': ['Front_Turret01_Muzzle02'] }
      ],
      'RackFireTogether': true,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(152.5, 1)
  })

  it('Cooper (XES0102) - Angler Torpedo', () => {
    const weapon = {
      'Damage': 80,
      'RateOfFire': 0.3125,
      'RackBones': [
        { 'MuzzleBones': ['Projectile01'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 4,
      'MuzzleSalvoDelay': 0.4
    }
    expect(calcDps(weapon)).toBeCloseTo(100, 1)
  })

  it('Vesper (XAS0204) - Chrono Torpedo', () => {
    const weapon = {
      'Damage': 90,
      'RateOfFire': 0.25,
      'RackBones': [
        { 'MuzzleBones': ['Projectile_Front_Right', 'Projectile_Front_Left'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 4,
      'MuzzleSalvoDelay': 0.4
    }
    expect(calcDps(weapon)).toBeCloseTo(90, 1)
  })

  it('Lobo (UEL0103) - Fragmentation Artillery', () => {
    const weapon = {
      'Damage': 100,
      'DamageRadius': 1,
      'RateOfFire': 0.12048192771084337,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle'] }
      ],
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      '__fragmentCount': 5
    }
    expect(calcDps(weapon)).toBeCloseTo(60.24, 1)
  })

  it('Zthuee (XSL0103) - Thuntho Artillery Cannon', () => {
    const weapon = {
      'Damage': 45,
      'DamageRadius': 1.5,
      'RateOfFire': 0.3448275862068966,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      '__fragmentCount': 5
    }
    expect(calcDps(weapon)).toBeCloseTo(77.59, 1)
  })

  it('Wailer (XRA0305) - Disintegrator Pulse Laser', () => {
    const weapon = {
      'Damage': 140,
      'RateOfFire': 1.6666666666666667,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Down_Muzzle_01'] },
        { 'MuzzleBones': ['Turret_Down_Muzzle_02'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(233.33, 1)
  })

  it('Zeus (URA0103) - Neutron Cluster Bomb', () => {
    const weapon = {
      'Damage': 50,
      'DamageRadius': 3,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['Muzzle_L03', 'Muzzle_R03', 'Muzzle_L02', 'Muzzle_R02', 'Muzzle_L01', 'Muzzle_R01'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 6,
      'MuzzleSalvoDelay': 0.2
    }
    expect(calcDps(weapon)).toBeCloseTo(60, 1)
  })

  it('Shimmer (UAA0103) - Graviton Bomb', () => {
    const weapon = {
      'Damage': 200,
      'DamageRadius': 4,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['UAA0103'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(40, 1)
  })

  it('Sinnve (XSA0103) - Othe Tactical Bomb', () => {
    const weapon = {
      'Damage': 250,
      'DamageRadius': 4,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['Center_Projectile'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(50, 1)
  })

  it('Bouncer (DRLK001) - Nanodart Launcher', () => {
    const weapon = {
      'Damage': 100,
      'DamageRadius': 1.5,
      'RateOfFire': 1.6666666666666667,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle_01', 'Turret_Muzzle_04'] },
        { 'MuzzleBones': ['Turret_Muzzle_02', 'Turret_Muzzle_05'] },
        { 'MuzzleBones': ['Turret_Muzzle_03', 'Turret_Muzzle_06'] },
        { 'MuzzleBones': ['Turret_Muzzle_01', 'Turret_Muzzle_04'] },
        { 'MuzzleBones': ['Turret_Muzzle_02', 'Turret_Muzzle_05'] },
        { 'MuzzleBones': ['Turret_Muzzle_03', 'Turret_Muzzle_06'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 2,
      'MuzzleSalvoSize': 2,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(235.29, 1)
  })

  it('Uyanah (DSLK004) - Lightning Projector', () => {
    const weapon = {
      'Damage': 200,
      'DamageRadius': 1,
      'BeamLifetime': 0.6,
      'BeamCollisionDelay': 0,
      'RateOfFire': 1,
      'RackBones': [
        { 'MuzzleBones': ['muzzle01'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 5,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      'MuzzleChargeDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(274.51, 1)
  })

  it('Uosthu (XSB2205) - Heavy Cavitation Torpedo Cluster', () => {
    const weapon = {
      'Damage': 242,
      'RateOfFire': 0.25,
      'RackBones': [
        { 'MuzzleBones': ['Muzzle01', 'Muzzle02', 'Muzzle03'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 3,
      'MuzzleSalvoDelay': 0.3,
      '__splitCount': 3
    }
    expect(calcDps(weapon)).toBeCloseTo(181.5, 1)
  })

  it('Solace (XAA0306) - Torpedo Cluster', () => {
    const weapon = {
      'Damage': 1000,
      'RateOfFire': 0.1,
      'RackBones': [
        { 'MuzzleBones': ['Torpedo_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 2,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 5,
      'MuzzleSalvoDelay': 0.2,
      '__splitCount': 2
    }
    expect(calcDps(weapon)).toBeCloseTo(500, 1)
  })

  it('Serenity (UAL0304) - Sonance Artillery', () => {
    const weapon = {
      'Damage': 95,
      'DamageRadius': 3,
      'DoTTime': 4.2,
      'DoTPulses': 15,
      'RateOfFire': 0.05,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0
    }
    expect(calcDps(weapon)).toBeCloseTo(71.25, 1)
  })

  it('Janus (DEA0202) - Napalm Carpet Bomb', () => {
    const weapon = {
      'Damage': 6,
      'DamageRadius': 3,
      'InitialDamage': 20,
      'DoTTime': 5.4,
      'DoTPulses': 10,
      'RateOfFire': 0.1,
      'RackBones': [
        { 'MuzzleBones': ['Rear_Bomb', 'Left_Wing_Bomb', 'Right_Wing_Bomb'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 20,
      'MuzzleSalvoDelay': 0.1
    }
    expect(calcDps(weapon)).toBeCloseTo(160, 1)
  })

  it('Scorcher (UEA0103) - Napalm Carpet Bomb', () => {
    const weapon = {
      'Damage': 4.5,
      'DamageRadius': 3,
      'InitialDamage': 42.5,
      'DoTTime': 3.6,
      'DoTPulses': 10,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['Projectile'] }
      ],
      'RackFireTogether': false,
      'RackSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RackSalvoReloadTime': 0,
      'MuzzleSalvoSize': 4,
      'MuzzleSalvoDelay': 0.2
    }
    expect(calcDps(weapon)).toBeCloseTo(70, 1)
  })
})
