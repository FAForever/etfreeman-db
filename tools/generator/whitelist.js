const WHITELIST = {
  root: ['Id', 'Description', 'Categories', 'StrategicIconName', 'VeteranMassMult', 'VeteranMass'],

  General: ['FactionName', 'Icon', 'UnitName', 'Classification'],

  Defense: ['Health', 'MaxHealth', 'RegenRate', {
    Shield: ['ShieldMaxHealth', 'ShieldRegenRate', 'ShieldRegenStartTime',
             'ShieldRechargeTime', 'ShieldSize', 'ShieldSpillOverDamageMod',
             'PersonalShield', 'PersonalBubble']
  }],

  Economy: ['BuildCostMass', 'BuildCostEnergy', 'BuildTime', 'BuildRate',
            'ProductionPerSecondMass', 'ProductionPerSecondEnergy',
            'MaintenanceConsumptionPerSecondEnergy', 'StorageMass', 'StorageEnergy'],

  Intel: ['VisionRadius', 'WaterVisionRadius', 'RadarRadius', 'SonarRadius',
          'RadarStealthFieldRadius', 'SonarStealthFieldRadius', 'ReactivateTime',
          'MaxVisionRadius', 'MinVisionRadius'],

  Physics: ['MaxSpeed', 'TurnRate', 'BackUpDistance', 'Elevation',
            'FuelUseTime', 'FuelRechargeRate', 'SniperModeSpeedMultiplier','WaterSpeedMultiplier','LandSpeedMultiplier','SubSpeedMultiplier'],

  Air: ['MaxAirspeed', 'MinAirspeed', 'TurnSpeed', 'CombatTurnSpeed'],

  Display: ['Abilities'],

  Transport: ['AirClass', 'TransportClass', 'SlotsSmall', 'SlotsMedium',
              'SlotsLarge', 'Class1Capacity', 'Class2AttachSize', 'Class3AttachSize'],

  Wreckage: ['MassMult', 'HealthMult'],

  Enhancements: ['Name', 'Slot', 'RemoveEnhancements', 'Prerequisite',
                 'BuildCostMass', 'BuildCostEnergy', 'BuildTime',
                 'NewMaxRadius', 'NewRateOfFire', 'MaintenanceConsumptionPerSecondEnergy',
                 'ProductionPerSecondMass', 'ProductionPerSecondEnergy',
                 'NewHealth', 'NewRegenRate', 'NewOmniRadius', 'AdditionalDamage',
                 'NewDamageRadius', 'NewBuildRate', 'ShieldMaxHealth', 'ShieldRegenRate',
                 'ShieldSize', 'ShieldRechargeTime', 'ShieldRegenStartTime'],

  Weapon: ['DisplayName', 'Label', 'WeaponCategory', 'DamageType', 'DummyWeapon',
           'TargetRestrictOnlyAllow', 'TargetRestrictDisallow', 'IgnoreIfDisabled',
           'FireOnDeath', 'ForceSingleFire', 'ManualFire', 'WeaponUnpackAnimation',
           'MaxRadius', 'MinRadius', 'Damage', 'DamageRadius', 'DamageToShields',
           'InitialDamage', 'NukeInnerRingRadius', 'NukeOuterRingRadius',
           'NukeInnerRingDamage', 'NukeOuterRingDamage', 'DoTTime', 'DoTPulses',
           'MuzzleVelocity', 'BeamLifetime', 'BeamCollisionDelay',
           'FiringRandomness', 'FiringRandomnessWhileMoving', 'FiringTolerance',
           'TurretYawRange', 'TurretPitchRange', 'MuzzleSalvoSize', 'MuzzleSalvoDelay',
           'MuzzleChargeDelay', 'RackFireTogether', 'RackSalvoSize', 'RackSalvoChargeTime',
           'RackSalvoReloadTime', 'RateOfFire', 'TractorDamage', 'TractorDamageInterval',
           'ProjectileId',
           { RackBones: ['MuzzleBones'] }]
}

export default WHITELIST
