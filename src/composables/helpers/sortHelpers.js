import { getUnitNumber } from './unitIdParser'

export const sortWithUnknownLast = (arr, key) => {
  const unknownIdx = arr.findIndex(item => item[key] === 'Unknown')
  if (unknownIdx > -1) {
    arr.push(arr.splice(unknownIdx, 1)[0])
  }
  return arr
}

export const sortByUnitNumber = (units, order = 'asc') => {
  const multiplier = order === 'desc' ? -1 : 1
  return units
    .map(unit => ({ unit, num: getUnitNumber(unit.id) }))
    .sort((a, b) => multiplier * a.num.localeCompare(b.num))
    .map(item => item.unit)
}
