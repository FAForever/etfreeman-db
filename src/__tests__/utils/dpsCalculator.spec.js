// DPS Calculator Tests - FA-Accurate DPS Calculation
// Tests critical weapon DPS calculations for accuracy
import { describe, it, expect } from 'vitest'
import { calculateDps2 } from '../../stores/utils/unitDecorator/index.js'

describe('DPS Calculator', () => {
  it('mantis (URL0107)', () => {
    const weapon = {
      'Damage': 8,
      'DamageRadius': 0,
      'DamageType': 'Normal',
      'DisplayName': 'Light Pulse Laser',
      'MaxRadius': 18,
      'MuzzleSalvoSize': 1,
      'ProjectileId': '/projectiles/CDFLaserHeavy01/CDFLaserHeavy01_proj.bp',
      'ProjectilesPerOnFire': 1,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle_01'] },
        { 'MuzzleBones': ['Turret_Muzzle_02'] }
      ],
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'RateOfFire': 10 / 3,
      'TurretPitch': 0,
      'TurretPitchRange': 45,
      'TurretPitchSpeed': 100,
      'TurretYaw': 0,
      'TurretYawRange': 180,
      'TurretYawSpeed': 100,
      'WeaponCategory': 'Direct Fire'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(26.67, 1)
  })

  it('Exodus Class (UAS0201) - Oblivion Cannon', () => {
    const weapon = {
      'Damage': 1060,
      'DamageRadius': 1,
      'DamageType': 'Normal',
      'DisplayName': 'Oblivion Cannon',
      'MaxRadius': 80,
      'MuzzleSalvoSize': 1,
      'ProjectileId': '/projectiles/ADFOblivionCannon01/ADFOblivionCannon01_proj.bp',
      'RackSalvoChargeTime': 0,
      'RateOfFire': 0.2,
      'TurretPitch': 10,
      'TurretPitchRange': 40,
      'TurretPitchSpeed': 30,
      'TurretYaw': 0,
      'TurretYawRange': 160,
      'TurretYawSpeed': 100,
      'WeaponCategory': 'Direct Fire Naval'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(212, 1)
  })

  it('Uashavoh (XSS0201) - Ultrachromatic Beam Generator 1', () => {
    const weapon = {
      'BeamCollisionDelay': 0,
      'BeamLifetime': 1,
      'Damage': 50,
      'DamageRadius': 1,
      'DamageType': 'Normal',
      'DisplayName': 'Ultrachromatic Beam Generator',
      'MaxRadius': 60,
      'MuzzleSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RateOfFire': 0.25,
      'TurretPitch': 10,
      'TurretPitchRange': 20,
      'TurretPitchSpeed': 30,
      'TurretYaw': 0,
      'TurretYawRange': 120,
      'TurretYawSpeed': 60,
      'WeaponCategory': 'Direct Fire Naval'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(137.5, 1)
  })

  it('Uashavoh (XSS0201) - Ultrachromatic Beam Generator 2', () => {
    const weapon = {
      'BeamCollisionDelay': 0,
      'BeamLifetime': 1,
      'Damage': 26,
      'DamageRadius': 1,
      'DamageType': 'Normal',
      'DisplayName': 'Ultrachromatic Beam Generator',
      'MaxRadius': 60,
      'MuzzleSalvoSize': 1,
      'RackSalvoChargeTime': 0,
      'RateOfFire': 0.25,
      'TurretPitch': 10,
      'TurretPitchRange': 20,
      'TurretPitchSpeed': 30,
      'TurretYaw': 0,
      'TurretYawRange': 140,
      'TurretYawSpeed': 60,
      'WeaponCategory': 'Direct Fire Naval'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(71.5, 1)
  })

  it('Valiant Class (UES0201) - Gauss Cannon', () => {
    const weapon = {
      'DamageRadius': 1,
      'FiringRandomness': 0.35,
      'RateOfFire': 0.25,
      'ProjectilesPerOnFire': 1,
      'TurretYaw': 0,
      'RackBones': [
        { 'MuzzleBones': ['Front_Turret01_Muzzle01'] },
        { 'MuzzleBones': ['Front_Turret01_Muzzle02'] }
      ],
      'Damage': 275,
      'DamageType': 'Normal',
      'TurretPitch': 10,
      'TurretPitchRange': 20,
      'DisplayName': 'Gauss Cannon',
      'TurretPitchSpeed': 30,
      'MaxRadius': 60,
      'ProjectileId': '/projectiles/TDFGauss01/TDFGauss01_proj.bp',
      'MuzzleVelocity': 30,
      'RackFireTogether': true,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 1,
      'TurretYawSpeed': 90,
      'MuzzleSalvoDelay': 0,
      'FiringTolerance': 2,
      'RackSalvoReloadTime': 0,
      'TurretYawRange': 140,
      'WeaponCategory': 'Direct Fire Naval',
      'WeaponNumber': 2
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(137.5, 1)
  })

  it('Cooper (XES0102) - Angler Torpedo', () => {
    const weapon = {
      'RateOfFire': 0.3,
      'TurretYaw': 0,
      'RackBones': [
        { 'MuzzleBones': ['Projectile01'] }
      ],
      'Damage': 80,
      'ProjectileLifetime': 7,
      'DamageType': 'Normal',
      'TurretPitch': 0,
      'TurretPitchRange': 0,
      'DisplayName': 'Angler Torpedo',
      'TurretPitchSpeed': 0,
      'MaxRadius': 50,
      'ProjectileId': '/projectiles/TANAnglerTorpedo02/TANAnglerTorpedo02_proj.bp',
      'MuzzleVelocity': 5,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoDelay': 0.4,
      'RackSalvoReloadTime': 0,
      'TurretYawSpeed': 0,
      'TurretYawRange': 0,
      'FiringTolerance': 2,
      'WeaponCategory': 'Anti Navy',
      'MuzzleSalvoSize': 4
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(96.1, 1)
  })

  it('Vesper (XAS0204) - Chrono Torpedo', () => {
    const weapon = {
      'RateOfFire': 0.25,
      'TurretYaw': 0,
      'RackBones': [
        { 'MuzzleBones': ['Projectile_Front_Right', 'Projectile_Front_Left'] }
      ],
      'Damage': 90,
      'ProjectileLifetime': 7,
      'DamageType': 'Normal',
      'TurretPitch': 0,
      'TurretPitchRange': 0,
      'DisplayName': 'Chrono Torpedo',
      'TurretPitchSpeed': 0,
      'MaxRadius': 45,
      'ProjectileId': '/projectiles/AANTorpedo01/AANTorpedo01_proj.bp',
      'MuzzleVelocity': 5,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 4,
      'MuzzleSalvoDelay': 0.4,
      'RackSalvoReloadTime': 0,
      'TurretYawRange': 0,
      'FiringTolerance': 2,
      'TurretYawSpeed': 0,
      'WeaponCategory': 'Anti Navy'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(90, 1)
  })

  it('Lobo (UEL0103) - Fragmentation Artillery', () => {
    const weapon = {
      'DamageRadius': 1,
      'FiringRandomness': 0.5,
      'TurretYaw': 0,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle'] }
      ],
      'Damage': 100,
      'DamageType': 'Normal',
      'TurretPitch': 45,
      'TurretPitchRange': 90,
      'DisplayName': 'Fragmentation Artillery',
      'TurretPitchSpeed': 70,
      'MinRadius': 5,
      'MaxRadius': 30,
      'ProjectileId': '/projectiles/TIFFragmentationSensorShell01/TIFFragmentationSensorShell01_proj.bp',
      'ProjectileFragments': 5,
      'ProjectileFragmentId': 'tiffragmentationsensorshell02',
      'MuzzleVelocity': 14,
      'RackSalvoReloadTime': 0,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      'TurretYawSpeed': 70,
      'TurretYawRange': 180,
      'FiringTolerance': 2,
      'RateOfFire': 0.12,
      'WeaponCategory': 'Artillery'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(60.02, 1)
  })

  it('Zthuee (XSL0103) - Thuntho Artillery Cannon', () => {
    const weapon = {
      'DamageRadius': 1.5,
      'FiringRandomness': 1,
      'RateOfFire': 0.35,
      'TurretYaw': 0,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Muzzle'] }
      ],
      'Damage': 45,
      'DamageType': 'Normal',
      'TurretPitch': 45,
      'TurretPitchRange': 90,
      'DisplayName': 'Thuntho Artillery Cannon',
      'TurretPitchSpeed': 70,
      'MinRadius': 8,
      'MaxRadius': 30,
      'ProjectileId': '/projectiles/SIFThunthoArtilleryShell01/SIFThunthoArtilleryShell01_proj.bp',
      'ProjectileFragments': 5,
      'ProjectileFragmentId': 'sifthunthoartilleryshell02',
      'MuzzleVelocity': 14,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 1,
      'TurretYawSpeed': 70,
      'MuzzleSalvoDelay': 0,
      'TurretYawRange': 45,
      'FiringTolerance': 1,
      'RackSalvoReloadTime': 0,
      'WeaponCategory': 'Artillery'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(78.67, 1)
  })

  it('Wailer (XRA0305) - Disintegrator Pulse Laser', () => {
    const weapon = {
      'Damage': 140,
      'DamageType': 'Normal',
      'DisplayName': 'Disintegrator Pulse Laser',
      'MaxRadius': 25,
      'MinRadius': 2,
      'MuzzleSalvoSize': 1,
      'ProjectileId': '/projectiles/CDFLaserDisintegrator04/CDFLaserDisintegrator04_proj.bp',
      'ProjectilesPerOnFire': 1,
      'RackBones': [
        { 'MuzzleBones': ['Turret_Down_Muzzle_01'] },
        { 'MuzzleBones': ['Turret_Down_Muzzle_02'] }
      ],
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'RateOfFire': 1.6,
      'TurretPitch': -20,
      'TurretPitchRange': 80,
      'TurretPitchSpeed': 180,
      'TurretYaw': 0,
      'TurretYawRange': 180,
      'TurretYawSpeed': 180,
      'WeaponCategory': 'Direct Fire'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(222.22, 1)
  })

  it('Zeus (URA0103) - Neutron Cluster Bomb', () => {
    const weapon = {
      'DamageRadius': 3,
      'RateOfFire': 0.2,
      'RackBones': [
        { 'MuzzleBones': ['Muzzle_L03', 'Muzzle_R03', 'Muzzle_L02', 'Muzzle_R02', 'Muzzle_L01', 'Muzzle_R01'] }
      ],
      'Damage': 50,
      'DamageType': 'Normal',
      'TurretPitch': 0,
      'DisplayName': 'Neutron Cluster Bomb',
      'TurretPitchSpeed': 0,
      'MaxRadius': 40,
      'ProjectileId': '/projectiles/CIFNeutronClusterBomb01/CIFNeutronClusterBomb01_proj.bp',
      'MuzzleVelocity': 0,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 6,
      'MuzzleSalvoDelay': 0.2,
      'TurretYawRange': 0,
      'TurretPitchRange': 0,
      'RackSalvoReloadTime': 0,
      'FiringTolerance': 6,
      'TurretYaw': 0,
      'TurretYawSpeed': 0,
      'WeaponCategory': 'Bomb'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(60, 1)
  })

  it('Shimmer (UAA0103) - Graviton Bomb', () => {
    const weapon = {
      'DamageRadius': 4,
      'FiringRandomness': 0,
      'RateOfFire': 0.2,
      'ProjectilesPerOnFire': 1,
      'RackBones': [
        { 'MuzzleBones': ['UAA0103'] }
      ],
      'Damage': 200,
      'DamageType': 'Normal',
      'DisplayName': 'Graviton Bomb',
      'MaxRadius': 40,
      'ProjectileId': '/projectiles/AIFBombGraviton01/AIFBombGraviton01_proj.bp',
      'MuzzleVelocity': 0,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      'RackSalvoReloadTime': 0,
      'FiringTolerance': 6,
      'Buffs': [{}],
      'WeaponCategory': 'Bomb'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(40, 1)
  })

  it('Sinnve (XSA0103) - Othe Tactical Bomb', () => {
    const weapon = {
      'DamageRadius': 4,
      'RateOfFire': 0.2,
      'ProjectilesPerOnFire': 1,
      'RackBones': [
        { 'MuzzleBones': ['Center_Projectile'] }
      ],
      'Damage': 250,
      'DamageType': 'Normal',
      'DisplayName': 'Othe Tactical Bomb',
      'MaxRadius': 40,
      'ProjectileId': '/projectiles/SBOOtheTacticalBomb01/SBOOtheTacticalBomb01_proj.bp',
      'MuzzleVelocity': 0,
      'RackFireTogether': false,
      'RackSalvoChargeTime': 0,
      'MuzzleSalvoSize': 1,
      'MuzzleSalvoDelay': 0,
      'RackSalvoReloadTime': 0,
      'FiringTolerance': 6,
      'FiringRandomness': 0,
      'WeaponCategory': 'Bomb'
    }
    const dps = calculateDps2(weapon, false)
    expect(dps).toBeCloseTo(50, 1)
  })
})
