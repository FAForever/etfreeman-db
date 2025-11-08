import { sortWithUnknownLast, sortByUnitNumber } from './helpers/sortHelpers'

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
          sortOrder: unit.sortOrder || 0,
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
          classGroup.unitsByFaction[faction] = sortByUnitNumber(classGroup.unitsByFaction[faction])
        })
        return classGroup
      })
    }))
  }

  return {
    groupByHierarchy
  }
}
