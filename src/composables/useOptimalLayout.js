import { computed } from 'vue'

export function useOptimalLayout(sections, containerWidth, itemWidth = 48, unitGap = 10, sectionGap = 6) {
  const getSectionWidth = (section) => {
    const factionTotals = { UEF: 0, Cybran: 0, Aeon: 0, Seraphim: 0, Nomads: 0 }

    for (const classGroup of section.classifications) {
      for (const faction of ['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads']) {
        factionTotals[faction] += classGroup.unitsByFaction[faction]?.length || 0
      }
    }

    const maxUnits = Math.max(...Object.values(factionTotals))
    return maxUnits * (itemWidth + unitGap) - unitGap
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
          if (totalWidth + w + (subset.length > 0 ? sectionGap : 0) > maxWidth) {
            totalWidth = Infinity
            break
          }
          totalWidth += w + (subset.length > 0 ? sectionGap : 0)
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
        const newWidth = row.width + widths[idx] + sectionGap
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
    if (!sections.value?.length) return []

    const widths = sections.value.map(getSectionWidth)
    const n = sections.value.length
    const allIndices = Array.from({ length: n }, (_, i) => i)
    const maxWidth = containerWidth.value
    let bestSolution = null
    let bestScore = { rows: Infinity, waste: Infinity }

    const row1Subsets = enumerateSubsets(allIndices, widths, maxWidth)

    for (const row1 of row1Subsets) {
      const remaining1 = allIndices.filter(i => !row1.items.includes(i))
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

    const landIdx = sections.value.findIndex(s => s.baseClass === 'Land')
    const rowW = r => r.reduce((s, i) => s + widths[i] + sectionGap, -sectionGap)
    const wastes = sortedRows.map(rowW).map(w => maxWidth - w)
    const landRowIdx = sortedRows.findIndex(r => r.includes(landIdx))

    if (landRowIdx > 0 && wastes[landRowIdx] !== Math.max(...wastes)) {
      const [landRow] = sortedRows.splice(landRowIdx, 1)
      sortedRows.unshift(landRow)
    }

    return sortedRows.flat().map(i => sections.value[i])
  })

  return { optimalOrder }
}
