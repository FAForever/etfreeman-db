import { sortWithUnknownLast, sortByUnitNumber } from './helpers/sortHelpers'

const categoryOrder = {
  'Land': 1,
  'Air': 2,
  'Naval': 3,
  'Construction - Buildpower': 4,
  'Structures - Weapons': 5,
  'Structures - Support': 6,
  'Structures - Intelligence': 7,
  'Structures - Economy': 8,
  'Structures - Factories': 9,
  'Experimental': 10,
  'Unknown': 99
}

export function useUnitGrouping() {
  const groupByHierarchy = (units) => {
    const baseGroups = {}

    units.forEach(unit => {
      const baseClass = unit.category || 'Unknown'
      const classification = unit.detailedClassification || 'Unknown'
      const faction = unit.faction || 'Unknown'

      if (!baseGroups[baseClass]) {
        baseGroups[baseClass] = {
          baseClass,
          sortOrder: categoryOrder[baseClass] || 99,
          classifications: {}
        }
      }

      if (!baseGroups[baseClass].classifications[classification]) {
        baseGroups[baseClass].classifications[classification] = {
          classification,
          sortOrder: unit.sortOrder || 0,
          unitsByFaction: { UEF: [], Cybran: [], Aeon: [], Seraphim: [], Nomads: [] }
        }
      }

      if (baseGroups[baseClass].classifications[classification].unitsByFaction[faction]) {
        baseGroups[baseClass].classifications[classification].unitsByFaction[faction].push(unit)
      }
    })

    let result = Object.values(baseGroups).sort((a, b) => a.sortOrder - b.sortOrder)
    result = sortWithUnknownLast(result, 'baseClass')

    return result.map(baseGroup => ({
      baseClass: baseGroup.baseClass,
      classifications: sortWithUnknownLast(
        Object.values(baseGroup.classifications).sort((a, b) => a.sortOrder - b.sortOrder),
        'classification'
      ).map(classGroup => {
        Object.keys(classGroup.unitsByFaction).forEach(faction => {
          classGroup.unitsByFaction[faction].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          if (faction === 'UEF' || faction === 'Seraphim') {
            const hasXEB = classGroup.unitsByFaction[faction].find(u => u.id === 'XEB0204')
            const hasUEL = classGroup.unitsByFaction[faction].find(u => u.id === 'UEL0301')
            if (hasXEB || hasUEL) {
              console.log('After sort:', faction, classGroup.classification, classGroup.unitsByFaction[faction].map(u => u.id + ':' + u.sortOrder))
            }
          }
        })
        return classGroup
      })
    }))
  }

  return {
    groupByHierarchy
  }
}
