import {
  techLookup,
  detailedClassificationById,
  categoryDefinitions
} from './lookups.js'

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

export const getSortOrder = (bp) => {
  const [, outerOrder, innerOrder] = getCategoryWithOrder(bp)
  return outerOrder * 100 + innerOrder
}
