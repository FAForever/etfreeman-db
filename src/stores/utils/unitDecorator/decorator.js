import { getTech, deriveKind } from '../categorizer.js'
import { calculateDps, calculateProjectileDamage, calculateFiringCycle } from './dps/index.js'
import { categorize } from '../categorizer.js'

export const decorateUnit = (blueprint) => {
  const self = {
    id: blueprint.Id,
    name: blueprint.General?.UnitName || '',
    description: blueprint.Description || '',
    faction: blueprint.General?.FactionName?.toLowerCase() || '',
    kind: deriveKind(blueprint.Categories),
    tech: getTech(blueprint, 'T1'),
    rawTech: getTech(blueprint, ''),
    strategicIcon: blueprint.StrategicIconName || '',
    icon: blueprint.General?.Icon || '',
    selected: false
  }

  categorize(blueprint)
  self.fullName = (self.name ? self.name + ': ' : '') + (self.tech === 'EXP' ? '' : self.tech + ' ') + self.description

  if (blueprint.Weapon) {
    for (const weapon of blueprint.Weapon) {
      weapon.__unitID = self.id
      if (weapon.WeaponCategory === 'Death' && !weapon.FireOnDeath) weapon.FireOnDeath = true
      if (weapon.childCount && (weapon.childSplitType == 'onWater')) {
        weapon.__splitCount = weapon.childCount
      }
      if (self.id == 'XRL0302' && weapon.WeaponCategory == 'Kamikaze' && weapon.Damage == 1) // fire beetle moment
        weapon.Damage = 0
      weapon.firingCycle = calculateFiringCycle(weapon)
      weapon.dps = calculateDps(weapon, false)
      weapon.fullDamage = calculateProjectileDamage(weapon, false)
      if (blueprint.SplitDamage && (weapon.childSplitType == 'onDeath')) weapon.SplitDamage = blueprint.SplitDamage
      if (weapon.DamageToShields) weapon.dpsShields = calculateDps(weapon, true)
    }
  }

  if (blueprint?.Categories.includes('SNIPEMODE') && !blueprint?.Display?.Abilities?.includes('Snipemode')) {
    if (!blueprint.Display) blueprint.Display = {}
    if (!blueprint.Display.Abilities) blueprint.Display.Abilities = []
    blueprint.Display.Abilities.unshift('Snipemode')
  }

  return Object.assign({}, self, blueprint)
}

export const decorateUnits = (units) => units.map(decorateUnit)
