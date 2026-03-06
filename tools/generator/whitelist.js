export default {
  root: ['Id', 'Description', 'Categories', 'StrategicIconName', 'VeteranMassMult', 'VeteranMass', 'SplitDamage'],

  General: ['FactionName', 'Icon', 'UnitName'],

  Defense: ['Health', 'RegenRate', {
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

  Air: ['MaxAirspeed', 'MinAirspeed', 'TurnSpeed', 'CombatTurnSpeed', 'StartTurnDistance'],

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
                 'ShieldSize', 'ShieldRechargeTime', 'ShieldRegenStartTime','Radius','RegenCeilingSCU','RegenCeilingT1','RegenCeilingT2','RegenCeilingT3','RegenCeilingT4','RegenFloor','RegenPerSecond',],
            
  Weapon: ['DisplayName', 'Label', 'WeaponCategory', 'DamageType', 'DummyWeapon',
           'TargetRestrictOnlyAllow', 'TargetRestrictDisallow', 'IgnoreIfDisabled',
           'FireOnDeath', 'ForceSingleFire', 'ManualFire', 'WeaponUnpackAnimation',
           'MaxRadius', 'MinRadius', 'Damage', 'DamageRadius', 'DamageToShields',
           'InitialDamage', 'NukeInnerRingRadius', 'NukeOuterRingRadius',
           'NukeInnerRingDamage', 'NukeOuterRingDamage', 'DoTTime', 'DoTPulses',
           'MuzzleVelocity', 'BeamLifetime', 'BeamCollisionDelay',
           'FiringRandomness', 'FiringRandomnessWhileMoving', 'FiringTolerance',
           'TurretYawRange', 'MuzzleSalvoSize', 'MuzzleSalvoDelay',
           'MuzzleChargeDelay', 'RackFireTogether', 'RackSalvoSize', 'RackSalvoChargeTime',
           'RackSalvoReloadTime', 'RateOfFire', 'TractorDamage', 'TractorDamageInterval',
           'ProjectileId', 'DepthCharge',
           { RackBones: ['MuzzleBones'] }]
}
