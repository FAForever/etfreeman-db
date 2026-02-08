import { getTech, kindMap } from '../categorizer.js'
import { calculateDps, calculateProjectileDamage, simulateFiringCycle, fireCycle, beamCycle, isTML, formatDotText } from './dps2.js'
import { categorize } from '../categorizer.js'

const loggedUnits = new Set()

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
    fireCycle: fireCycle,
    beamCycle: beamCycle,
    selected: false
  }

  categorize(blueprint)
  self.fullName = (self.name ? self.name + ': ' : '') + (self.tech === 'EXP' ? '' : self.tech + ' ') + self.description

  if (blueprint.Weapon) {
    for (let i = 0; i < blueprint.Weapon.length; i++) {
      const weapon = blueprint.Weapon[i]
      weapon.__unitID = self.id

      if (weapon.WeaponCategory == 'Death' && !weapon.FireOnDeath)
        weapon.FireOnDeath = true
      weapon.dps = calculateDps(weapon, false)
      weapon.fullDamage = calculateProjectileDamage(weapon, false)
      weapon.fullSalvoDamage = weapon.fullDamage * simulateFiringCycle(weapon).cycleProjs
      weapon.projectileDotText = formatDotText(weapon)
      if (weapon.DamageToShields) {
        weapon.dpsShields = calculateDps(weapon, true)
      }
      weapon.isTML = isTML(weapon)
      if (weapon.WeaponCategory == 'Anti Navy')
        weapon.WeaponCategory = 'Anti-Navy'
    }
  }

  if (blueprint.Weapon) {
    for (const weapon of blueprint.Weapon) {
      const rackCount = weapon.RackBones?.length || 0
      const rackSalvoSize = weapon.RackSalvoSize
      // Bug only affects weapons with: RackFireTogether=false AND MuzzleSalvoDelay > 0 AND RackSalvoSize < rackCount
      const shouldLimitRacks = !weapon.RackFireTogether && (weapon.MuzzleSalvoDelay || 0) > 0
      if (shouldLimitRacks && rackCount > 1 && rackSalvoSize !== undefined && rackSalvoSize < rackCount) {
        loggedUnits.add(self.id)
      }
    }
  }

  return Object.assign({}, self, blueprint)
}

export const decorateUnits = (units) => {
  const result = units.map(decorateUnit)
  if (loggedUnits.size === 62) {
    console.log('All affected units:', Array.from(loggedUnits).join(','))
  }
  return result
}
