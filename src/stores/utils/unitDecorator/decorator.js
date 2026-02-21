import { getTech, kindMap } from '../categorizer.js'
import { calculateDps, calculateProjectileDamage, simulateFiringCycle, fireCycle, beamCycle, isTML, formatDotText } from './dps2.js'
import { categorize } from '../categorizer.js'

export const decorateUnit = (blueprint) => {
  const self = {
    id: blueprint.Id,
    name: blueprint.General?.UnitName || '',
    description: blueprint.Description || '',
    faction: blueprint.General?.FactionName?.toLowerCase() || '',
    kind: kindMap[blueprint.General?.Classification] || 'Unknown',
    tech: getTech(blueprint, 'T1'),
    rawTech: getTech(blueprint, ''),
    strategicIcon: blueprint.StrategicIconName || '',
    icon: blueprint.General?.Icon || '',
    fireCycle,
    beamCycle,
    selected: false
  }

  categorize(blueprint)
  self.fullName = (self.name ? self.name + ': ' : '') + (self.tech === 'EXP' ? '' : self.tech + ' ') + self.description

  if (blueprint.Weapon) {
    for (const weapon of blueprint.Weapon) {
      weapon.__unitID = self.id
      if (weapon.WeaponCategory === 'Death' && !weapon.FireOnDeath) weapon.FireOnDeath = true
      if (weapon.WeaponCategory === 'Anti Navy') weapon.WeaponCategory = 'Anti-Navy'
      weapon.dps = calculateDps(weapon, false)
      weapon.fullDamage = calculateProjectileDamage(weapon, false)
      weapon.fullSalvoDamage = weapon.fullDamage * simulateFiringCycle(weapon).cycleProjs
      weapon.projectileDotText = formatDotText(weapon)
      if (weapon.DamageToShields) weapon.dpsShields = calculateDps(weapon, true)
      weapon.isTML = isTML(weapon)
    }
  }

  return Object.assign({}, self, blueprint)
}

export const decorateUnits = (units) => units.map(decorateUnit)
