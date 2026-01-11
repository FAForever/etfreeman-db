import { classificationLookup, factionIdLookup } from './lookups.js'
import {
  getTech,
  fullName,
  getDetailedClassification,
  getCategory,
  getDisplayClassification,
  getSortOrder
} from './classification.js'
import { calculateDps2, calculateProjectileDamage, simulateFiringCycle, fireCycle, beamCycle, isTML, formatDotText } from './dps2.js'

export const decorateUnit = (blueprint) => {
  const self = {
    id: blueprint.Id,
    name: blueprint.General?.UnitName || '',
    description: blueprint.Description || '',
    faction: blueprint.General?.FactionName || '',
    factionId: factionIdLookup[blueprint.General?.FactionName] || 0,
    classification: classificationLookup[blueprint.General?.Classification] || 'Unknown',
    displayClassification: getDisplayClassification(blueprint),
    detailedClassification: getDetailedClassification(blueprint),
    category: getCategory(blueprint),
    sortOrder: getSortOrder(blueprint),
    tech: getTech(blueprint),
    strategicIcon: blueprint.StrategicIconName || '',
    icon: blueprint.General?.Icon || '',
    order: blueprint.BuildIconSortPriority || 1000,
    fireCycle: fireCycle,
    beamCycle: beamCycle,
    selected: false
  }

  self.fullName = fullName(self)

  if (blueprint.Weapon) {
    for (let i = 0; i < blueprint.Weapon.length; i++) {
      const weapon = blueprint.Weapon[i]
      weapon.dps = calculateDps2(weapon, false)
      weapon.fullDamage = calculateProjectileDamage(weapon, false)
      weapon.fullSalvoDamage = weapon.fullDamage * simulateFiringCycle(weapon).cycleProjs
      weapon.projectileDotText = formatDotText(weapon)
      if (weapon.DamageToShields) {
        weapon.dpsShields = calculateDps2(weapon, true)
      }
      weapon.isTML = isTML(weapon)
    }
  }

  return Object.assign({}, self, blueprint)
}

export const decorateUnits = (units) => units.map(decorateUnit)
