import { SECTION_ORDER, getUnitSortOrder, getTypeSortOrder, sortFaction, sortUnits, sortTierKey } from "./categorizerData/categorizeOrders"
import { kindMap, TypeById, TypeToSection } from "./categorizerData/categorizeTables"

const techMap = { 'TECH1': 'T1', 'TECH2': 'T2', 'TECH3': 'T3','EXPERIMENTAL': 'EXP' }
const getTech = (bp, fallback = 'T1') => techMap[bp?.Categories?.find(c => techMap[c])] || fallback
const stripType = (type) => type.replace(/^(T[1234]|EXP) /, '').replace(/\(.*\)/, '').replace(/\sHQ$/, '').trim()

export const categorize = (bp) => {
  const tech = getTech(bp)
  bp.type = TypeById[bp.Id] || (tech === 'EXP' ? 'T4 ' : (tech ? tech + ' ' : '')) + (bp.Description || 'Unknown')
  bp.section = TypeToSection[bp.type] || TypeToSection[stripType(bp.type)] || 'Unknown'
  bp.sortOrder = getUnitSortOrder(bp)
}

const buildSortedTree = (units, groupKey, keySortOrOrder) => {
  const raw = {}

  for (const unit of units) {
    const section = unit.section || 'Unknown'
    const key = unit[groupKey] || 'Unknown'
    const faction = unit.faction || 'Unknown'

    if (!raw[section]) raw[section] = {}
    if (!raw[section][key]) raw[section][key] = {}
    if (!raw[section][key][faction]) raw[section][key][faction] = []

    raw[section][key][faction].push(unit)
  }

  const sorted = {}
  const keySort = typeof keySortOrOrder === 'function'
    ? keySortOrOrder
    : (a, b) => keySortOrOrder?.[a] - keySortOrOrder?.[b]

  for (const section of SECTION_ORDER) {
    if (!raw[section]) continue
    sorted[section] = {}
    for (const key of Object.keys(raw[section]).sort(keySort)) {
      sorted[section][key] = {}
      for (const faction of Object.keys(raw[section][key]).sort(sortFaction)) {
        sorted[section][key][faction] = [...raw[section][key][faction]].sort(sortUnits)
      }
    }
  }

  return sorted
}

const calculateTypeOrders = (units) => {
  const typeUnits = {}
  for (const unit of units) {
    const type = unit.type || 'Unknown'
    if (!typeUnits[type]) typeUnits[type] = []
    typeUnits[type].push(unit)
  }

  const typeOrders = {}
  for (const [type, units] of Object.entries(typeUnits)) {
    typeOrders[type] = getTypeSortOrder(type, units)
  }
  return typeOrders
}

export const generateTierTree = (units) => buildSortedTree(units, 'tech', sortTierKey)
export const generateTypeTree = (units) => buildSortedTree(units, 'type', calculateTypeOrders(units))
export { getTech, kindMap }
