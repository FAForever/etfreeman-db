import { computed, toValue } from 'vue'

const isValidEnhancement = (e, slotFilter) =>
  !e.RemoveEnhancements &&
  e.Name &&
  (!slotFilter || e.Slot === slotFilter)

const buildDependentsMap = (enhancements) => {
  const dependents = {}
  for (const [key, e] of Object.entries(enhancements)) {
    if (e.Prerequisite && enhancements[e.Prerequisite]) {
      (dependents[e.Prerequisite] ??= []).push(key)
    }
  }
  return dependents
}

const topologicalSort = (enhancements, dependents) => {
  const roots = Object.keys(enhancements).filter(
    key => !enhancements[key].Prerequisite || !enhancements[enhancements[key].Prerequisite]
  )
  const sorted = []
  const visited = new Set()

  const visit = (key) => {
    if (visited.has(key)) return
    visited.add(key)

    const e = enhancements[key]
    if (e.Prerequisite && enhancements[e.Prerequisite]) {
      visit(e.Prerequisite)
    }

    sorted.push({ enhancement: e, key })

    for (const child of dependents[key] || []) visit(child)
  }

  for (const root of roots) visit(root)
  return sorted
}

export const useEnhancementSort = (enhancements = {}, slots, activeSlot = null) => {
  const sortedEnhancements = computed(() => {
    const slot = toValue(activeSlot)

    const filtered = Object.fromEntries(
      Object.entries(enhancements).filter(([, e]) => isValidEnhancement(e, slot))
    )

    const dependents = buildDependentsMap(filtered)
    const sorted = topologicalSort(filtered, dependents)

    return sorted.map(({ enhancement, key }) => ({
      enhancement, hasDependents: (dependents[key]?.length ?? 0) > 0
    }))
  })

  const groupedBySlot = computed(() => {
    const groups = Object.fromEntries(slots.map(s => [s.key, []]))

    for (const item of sortedEnhancements.value) {
      const slot = item.enhancement.Slot
      if (groups[slot]) {
        groups[slot].push(item)
      }
    }

    return groups
  })

  return { sortedEnhancements, groupedBySlot }
}
