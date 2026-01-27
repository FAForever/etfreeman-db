import { computed } from 'vue'

export function useOptimalLayout(tierTree, containerWidth, itemWidth = 48, unitGap = 6, sectionGap = 10, tierGap = 14, sectionPadding = 16) {
  const sectionScores = {
    'Land': 1e6,
    'Air': 1e4,
    'Naval': 1e3,
    'Structures - Intelligence': -10,
    'Structures - Support': -1
  }

  const getSectionScore = (sectionName) => sectionScores[sectionName] || 0

  const getSectionWidth = (sectionName, tierData) => {
    let totalWidth = 0

    for (const tier in tierData) {
      const tierUnits = tierData[tier]
      const factionCounts = Object.values(tierUnits).map(units => units.length)
      const maxUnits = Math.max(...factionCounts, 0)
      totalWidth += maxUnits * (itemWidth + unitGap) - unitGap + tierGap
    }

    return totalWidth - tierGap + sectionPadding
  }

  const enumerateSubsets = (indices, widths, maxWidth) => {
    const subsets = []
    const n = indices.length

    for (let mask = 1; mask < (1 << n); mask++) {
      let totalWidth = 0
      const subset = []

      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          const w = widths[indices[i]]
          if (totalWidth + w > maxWidth) {
            totalWidth = Infinity
            break
          }
          totalWidth += w
          subset.push(indices[i])
        }
      }

      if (totalWidth !== Infinity) {
        subsets.push({ items: subset, width: totalWidth })
      }
    }

    return subsets
  }

  const ffdRemaining = (remainingIndices, widths, maxWidth) => {
    const rows = []
    const sorted = [...remainingIndices].sort((a, b) => widths[b] - widths[a])

    for (const idx of sorted) {
      let placed = false
      for (const row of rows) {
        const newWidth = row.width + widths[idx]
        if (newWidth <= maxWidth) {
          row.items.push(idx)
          row.width = newWidth
          placed = true
          break
        }
      }
      if (!placed) {
        rows.push({ items: [idx], width: widths[idx] })
      }
    }

    return rows
  }

  const optimalOrder = computed(() => {
    const sections = tierTree.value
    if (!sections) return []

    const sectionNames = Object.keys(sections)
    if (!sectionNames.length) return []

    const maxWidth = containerWidth.value + sectionGap
    const widths = sectionNames.map(s => Math.min(getSectionWidth(s, sections[s]) + sectionGap, maxWidth))
    const n = sectionNames.length
    const allIndices = Array.from({ length: n }, (_, i) => i)
    let bestSolution = null
    let bestScore = { rows: Infinity, waste: Infinity }

    const landIdx = sectionNames.indexOf('Land')

    const row1Subsets = enumerateSubsets(allIndices, widths, maxWidth)
      .filter(subset => landIdx === -1 || subset.items.includes(landIdx))

    for (const row1 of row1Subsets) {
      const remaining1 = allIndices.filter(i => !row1.items.includes(i))

      if (remaining1.length === 0) {
        bestSolution = [row1.items]
        break
      }

      const row2Subsets = enumerateSubsets(remaining1, widths, maxWidth)

      for (const row2 of row2Subsets) {
        const remaining2 = remaining1.filter(i => !row2.items.includes(i))
        const remainingRows = ffdRemaining(remaining2, widths, maxWidth)

        const totalRows = 2 + remainingRows.length
        const waste1 = maxWidth - row1.width
        const waste2 = maxWidth - row2.width
        const totalWaste = waste1 + waste2

        const score = { rows: totalRows, waste: totalWaste }

        if (score.rows < bestScore.rows ||
            (score.rows === bestScore.rows && score.waste < bestScore.waste)) {
          bestScore = score
          bestSolution = [row1.items, row2.items, ...remainingRows.map(r => r.items)]
        }
      }
    }

    const sortedRows = bestSolution.map(row =>
      [...row].sort((a, b) => widths[b] - widths[a])
    )

    sortedRows.sort((rowA, rowB) => {
      const scoreA = rowA.reduce((sum, idx) => sum + getSectionScore(sectionNames[idx]), 0)
      const scoreB = rowB.reduce((sum, idx) => sum + getSectionScore(sectionNames[idx]), 0)
      return scoreB - scoreA
    })

    sortedRows.forEach(row => {
      row.sort((a, b) => {
        const scoreA = getSectionScore(sectionNames[a])
        const scoreB = getSectionScore(sectionNames[b])
        return scoreB - scoreA
      })
    })

    return sortedRows.flat().map(i => ({ name: sectionNames[i], tiers: sections[sectionNames[i]] }))
  })

  return { optimalOrder }
}
