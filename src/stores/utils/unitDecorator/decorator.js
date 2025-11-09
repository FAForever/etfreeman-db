import { classificationLookup, factionIdLookup } from './lookups.js'
import { specialDpsUnits } from './exceptions.js'
import {
  getTech,
  fullName,
  getDetailedClassification,
  getCategory,
  getDisplayClassification,
  getSortOrder
} from './classification.js'
import { fireCycle, beamCycle, getDps, isTML } from './dps.js'

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
      blueprint.Weapon[i].dps = getDps(blueprint.Weapon[i], specialDpsUnits.indexOf(self.id) > -1)
      blueprint.Weapon[i].isTML = isTML(blueprint.Weapon[i])
    }
  }

  return Object.assign({}, self, blueprint)
}

export const decorateUnits = (units) => units.map(decorateUnit)
