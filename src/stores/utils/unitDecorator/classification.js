import {
  techLookup,
  classificationLookup,
  detailedClassificationById,
  categoryDefinitions
} from './lookups.js'
import { getUnitNumber } from '../../../composables/helpers/unitIdParser.js'

export const getTech = (bp) => {
  if (!bp.Categories) return ''

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

export const getDisplayClassification = (bp) => {
  const category = getCategory(bp)

  if (category === 'Construction - Buildpower' || category === 'Structures - Factories') {
    return 'Build'
  }
  if (category === 'Structures - Weapons' || category === 'Structures - Intelligence') {
    return 'Defenses'
  }
  if (category === 'Structures - Support' || category === 'Structures - Economy') {
    return 'Support'
  }
  if (category === 'Land') return 'Land'
  if (category === 'Air') return 'Air'
  if (category === 'Naval') return 'Naval'
  if (category === 'Experimental') return 'Experimental'

  return classificationLookup[bp.General?.Classification] || 'Unknown'
}

export const getSortOrder = (bp) => {
  const tech = getTech(bp)
  const techNumber = getTechNumber(tech)
  const classification = classificationLookup[bp.General?.Classification] || 'Unknown'
  const classOrder = getClassificationOrder(classification)
  const unitNum = getUnitNumber(bp.Id) || 0
  const isStructure = getCategory(bp).startsWith('Structures')? 1 : 0
  return techNumber * 100000 + classOrder * 10000 + unitNum + isStructure * 1e6
}
