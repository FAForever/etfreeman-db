import {
  techLookup,
  classificationLookup,
  detailedClassificationById,
  categoryDefinitions
} from './lookups.js'
import { getUnitNumber } from '../../../composables/helpers/unitIdParser.js'

export const getTech = (bp) => {
  if (!bp.Categories) return ''

  if (bp.Id === 'XEB0204') {
    console.log('XEB0204 categories:', bp.Categories)
  }

  for (const category of bp.Categories) {
    if (category && techLookup[category]) {
      return techLookup[category]
    }
  }
  return ''
}

export const fullName = (u) =>
  (u.name ? u.name + ': ' : '') + (u.tech === 'EXP' ? '' : u.tech + ' ') + u.description

export const getDetailedClassification = (bp) => {
  const hardcodedClassification = detailedClassificationById[bp.Id]
  if (hardcodedClassification) return hardcodedClassification
  const tech = getTech(bp)
  return (tech === 'EXP' ? 'T4 ' : (tech === '' ? '' : tech + ' ')) + bp.Description
}

export const getCategoryWithOrder = (bp) => {
  const detailedClassification = getDetailedClassification(bp)
  let outerOrder = 0
  for (const category in categoryDefinitions) {
    outerOrder++
    const detailedClassifications = categoryDefinitions[category]
    const indexInCategory = detailedClassifications.indexOf(detailedClassification)
    if (indexInCategory > -1) {
      return [category, outerOrder, indexInCategory]
    }
  }
  return ['Unknown', 0, 0]
}

export const getCategory = (bp) => getCategoryWithOrder(bp)[0]

const getTechNumber = (techString) => {
  const techMap = { 'T1': 1, 'T2': 2, 'T3': 3, 'EXP': 4 }
  return techMap[techString] || 0
}

const getClassificationOrder = (classification) => {
  const classMap = { 'Build': 1, 'Base': 2, 'Land': 3, 'Air': 4, 'Naval': 5 }
  return classMap[classification] || 99
}

const customOrders = {
  'UAS0102': 2e3,
  'UEL0106': 2e3,
  'URL0106': 2e3,
  'UAL0106': 2e3,
  'DEL0204': 1e3,
  'DRL0204': 1e3,
  'XRL0302': 1e3,
  'UEL0303': 2,
  'URL0303': 2,
  'XRB3301': 1e5,
  'XAB3301': 1e5,
  'XRA0105': 2,
  'XES0102': 1e2,
  'URS0304': -2,
  'UAS0304': -2,
  'XSS0304': -2,
  'UEA0001': 1e3,
  'XEB0204': 1e21,
  'UEA0003': 1e3,
  'UEL0401': -1e4,
  'XRL0403': -1e4,
  'URL0402': -1e4,
  'UAL0401': -1e4,
  'XSL0401': -1e4,
  'XAB1401': 1e5,
  'XAB2307': 1e5,
  'XSB2401': 1e5,
  'UEB2401': 1e5,
  'URL0401': 1e5,
  'XRB2308': 1e4,
  'XEB2306': 1e4,
  'UES0401': 1e20,
  'UEB2401': 1e22,
  'XEB2402': 1e21
}

export const getSortOrder = (bp) => {
  const tech = getTech(bp)
  const techNumber = getTechNumber(tech)
  const classification = classificationLookup[bp.General?.Classification] || 'Unknown'
  const classOrder = getClassificationOrder(classification)
  const unitNum = getUnitNumber(bp.Id) || 0
  const isStructure = getCategory(bp).startsWith('Structures')? 1 : 0
  const isExp = techNumber == 4
  const isCrabEgg = bp.Categories.includes("CRABEGG")
  const sortOrder = techNumber * 100000 + classOrder * 10000 + unitNum + isStructure * 1e6 + isExp * 1e8 + isCrabEgg * 15000 + (customOrders[bp.Id] || 0)

  if (bp.Id === 'XEB0204' || bp.Id === 'UEL0301') {
    console.log(bp.Id, 'sortOrder:', sortOrder)
  }

  return sortOrder
}
