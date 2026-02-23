import { computed } from 'vue'
import { DEFAULT_ORDER } from '../stores/compare/sectionOrder.js'

export const EXPAND_SCORE_THRESHOLD = 1.9
const ORDER_INDEX = Object.fromEntries(DEFAULT_ORDER.map((k, i) => [k, i]))

export function useRowAlignment(unitRefs, units) {
  const isReady = computed(() => {
    if (unitRefs.value.length !== units.value.length) return false
    return unitRefs.value.every(r => r?.sections)
  })

  const shownSectionsPerUnit = computed(() => {
    if (!isReady.value) return []
    const result = unitRefs.value.map(unitRef => {
      return unitRef.sections.filter(s => s.show).map(s => s.name)
    })
    return result
  })

  const occurrenceCount = computed(() => {
    const count = {}
    for (const sections of shownSectionsPerUnit.value) {
      for (const section of sections) {
        count[section] = (count[section] || 0) + 1
      }
    }
    return count
  })

  const sectionOrder = computed(() => {
    if (!isReady.value) return DEFAULT_ORDER

    return Object.keys(occurrenceCount.value).sort((a, b) => {
      const countDiff = occurrenceCount.value[b] - occurrenceCount.value[a]
      if (countDiff !== 0) return countDiff
      return (ORDER_INDEX[a] ?? 99) - (ORDER_INDEX[b] ?? 99)
    })
  })

  const compactOverrides = computed(() => {
    if (units.value.length <= 1) return {}
    if (!isReady.value) return {}

    const multiUnitSections = Object.keys(occurrenceCount.value).filter(k => occurrenceCount.value[k] >= 2)

    const overrides = {}
    for (const section of multiUnitSections) {
      const sectionData = unitRefs.value.map(r => r.sections.find(s => s.name === section)).filter(Boolean)
      if (sectionData.length < 2) continue

      const compactnesses = sectionData.map(s => s.compact)
      const allSame = compactnesses.every(c => c === compactnesses[0])
      if (allSame) continue

      const maxScore = Math.max(...sectionData.map(s => s.expandScore || 0))
      overrides[section] = maxScore < EXPAND_SCORE_THRESHOLD
    }

    return overrides
  })

  return { isReady, sectionOrder, compactOverrides }
}
