import { computed } from 'vue'

export function useOptimalLayout(tierTree, containerWidth, options = {}) {
  const {
    itemWidth = 48, unitGap = 6, sectionGap = 10,
    tierGap = 14, sectionPadding = 16, sectionSortScores = {}
  } = options

  const getSectionPriority = (name) => sectionSortScores[name] || 0
  const getRowPriority = (row, names) => row.reduce((sum, idx) => sum + getSectionPriority(names[idx]), 0)

  const calcSectionWidth = (tierData) => {
    let total = 0
    for (const tier in tierData) {
      const maxUnits = Math.max(...Object.values(tierData[tier]).map(u => u.length), 0)
      total += maxUnits * (itemWidth + unitGap) - unitGap + tierGap
    }
    return total - tierGap + sectionPadding
  }

  const findAllSectionCombinationsForRow = (indexes, widths, maxWidth, mustContain = null) => {
    const combos = []
    const n = indexes.length
    const mustPos = mustContain !== null ? indexes.indexOf(mustContain) : -1
    const mustBit = mustPos >= 0 ? (1 << mustPos) : 0

    for (let mask = mustPos >= 0 ? mustBit : 1; mask < (1 << n); mask = mustPos >= 0 ? (mask + 1) | mustBit : mask + 1) {
      let width = 0
      const items = []

      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          const w = widths[indexes[i]]
          if (width + w > maxWidth) { width = Infinity; break }
          width += w
          items.push(indexes[i])
        }
      }

      if (width !== Infinity) combos.push({ items, width })
    }
    return combos
  }

  const findBestArrangement = (allIndexes, widths, maxWidth, highPriorityIndexes, sectionNames) => {
    const rows = []
    let remaining = [...allIndexes].sort((a, b) => getSectionPriority(sectionNames[b]) - getSectionPriority(sectionNames[a]))
    let priorityQueue = [...highPriorityIndexes]

    while (remaining.length) {
      const mustPlace = priorityQueue.shift() ?? null
      const combos = findAllSectionCombinationsForRow(remaining, widths, maxWidth, mustPlace)
      const best = combos.reduce((b, c) => c.width > b.width ? c : b)
      rows.push(best.items)
      remaining = remaining.filter(i => !best.items.includes(i))
      priorityQueue = priorityQueue.filter(idx => !best.items.includes(idx))
    }

    rows.sort((a, b) => getRowPriority(b, sectionNames) - getRowPriority(a, sectionNames))
    return rows
  }

  const optimalOrder = computed(() => {
    const sections = tierTree.value
    if (!sections) return []

    const sectionNames = Object.keys(sections)

    const maxWidth = containerWidth.value + sectionGap
    const widths = sectionNames.map(s => Math.min(calcSectionWidth(sections[s]) + sectionGap, maxWidth))
    const allIndexes = Array.from({ length: sectionNames.length }, (_, i) => i)

    const highPriorityIndexes = sectionNames
      .map((name, idx) => ({ idx, priority: getSectionPriority(name) }))
      .filter(item => item.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.idx)

    const bestRows = findBestArrangement(allIndexes, widths, maxWidth, highPriorityIndexes, sectionNames)

    bestRows.forEach(row => row.sort((a, b) =>
      getSectionPriority(sectionNames[b]) - getSectionPriority(sectionNames[a]) || widths[b] - widths[a]
    ))

    return bestRows.flat().map(i => ({ name: sectionNames[i], tiers: sections[sectionNames[i]] }))
  })

  return { optimalOrder }
}
