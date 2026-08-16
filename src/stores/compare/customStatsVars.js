export const AVAILABLE_VARS = [
  "Air.CombatTurnSpeed",
  "Air.MaxAirspeed",
  "Air.MinAirspeed",
  "Air.StartTurnDistance",
  "Air.TurnSpeed",
  "Defense.Health",
  "Defense.RegenRate",
  "Defense.Shield.PersonalBubble",
  "Defense.Shield.PersonalShield",
  "Defense.Shield.ShieldMaxHealth",
  "Defense.Shield.ShieldRechargeTime",
  "Defense.Shield.ShieldRegenRate",
  "Defense.Shield.ShieldRegenStartTime",
  "Defense.Shield.ShieldSize",
  "Defense.Shield.ShieldSpillOverDamageMod",
  "Economy.BuildCostEnergy",
  "Economy.BuildCostMass",
  "Economy.BuildRate",
  "Economy.BuildTime",
  "Economy.MaintenanceConsumptionPerSecondEnergy",
  "Economy.ProductionPerSecondEnergy",
  "Economy.ProductionPerSecondMass",
  "Economy.StorageEnergy",
  "Economy.StorageMass",
  "ID",
  "Intel.MaxVisionRadius",
  "Intel.MinVisionRadius",
  "Intel.OmniRadius",
  "Intel.RadarRadius",
  "Intel.RadarStealthFieldRadius",
  "Intel.ReactivateTime",
  "Intel.SonarRadius",
  "Intel.SonarStealthFieldRadius",
  "Intel.VisionRadius",
  "Intel.WaterVisionRadius",
  "Physics.BackUpDistance",
  "Physics.Elevation",
  "Physics.FuelRechargeRate",
  "Physics.FuelUseTime",
  "Physics.LandSpeedMultiplier",
  "Physics.MaxSpeed",
  "Physics.SniperModeSpeedMultiplier",
  "Physics.SubSpeedMultiplier",
  "Physics.TurnRate",
  "Physics.WaterSpeedMultiplier",
  "Transport.Class1Capacity",
  "Transport.Class2AttachSize",
  "Transport.Class3AttachSize",
  "Transport.SlotsLarge",
  "Transport.SlotsMedium",
  "Transport.SlotsSmall",
  "VeteranMassMult",
  "Weapons['ALL'].DPS",
  "Weapons['ALL'].FullCycleDamage",
  "Weapons['ALL'].MaxDamageRadius",
  "Weapons['ALL'].MaxMaxRadius",
  "Weapons['ALL'].MinDamageRadius",
  "Weapons['ALL'].MinMaxRadius",
  "Wreckage.HealthMult",
  "Wreckage.MassMult",
]

const GROUP = /^([^()]*)(?:\(([^()]*)\)([^()]*))?$/
const IDENT = /^[A-Za-z_$][\w$]*$/

export const parseStatLabel = (label) => {
  const bad = (error) => ({ pre: label, post: '', vars: [], error })
  const m = String(label || '').match(GROUP)
  if (!m) return bad('Unbalanced parentheses')
  if (m[2] === undefined) return { pre: label, post: '', vars: [], error: null }
  const seen = new Set()
  for (const v of m[2].split(',').map(s => s.trim())) {
    if (!v || !IDENT.test(v)) return bad(`"${v}" is not a valid variable name`)
    if (v === 'unit' || AVAILABLE_VARS.includes(v)) return bad(`"${v}" is reserved`)
    try { new Function(v, 'return 0') } catch { return bad(`"${v}" is reserved`) }
    if (seen.has(v)) return bad(`duplicate "${v}"`)
    seen.add(v)
  }
  return { pre: m[1] + '(', post: ')' + m[3], vars: [...seen], error: null }
}

const WEAPON_REF = /^Weapons\['[^']+'\]\.\w+$/

const refPath = (raw) => {
  if (typeof raw !== 'string' || !raw.startsWith('unit.')) return null
  const path = raw.slice(5)
  return AVAILABLE_VARS.includes(path) || WEAPON_REF.test(path) ? path : null
}

export const resolveRef = (raw, unit) => {
  const path = refPath(raw)
  if (!path) return raw
  try { return new Function('unit', `return unit.${path}`)(unit) } catch { return undefined }
}
