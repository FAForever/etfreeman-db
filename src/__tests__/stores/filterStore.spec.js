import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFilterStore } from '../../stores/filterStore'

describe('Filter Store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('initializes with default factions', () => {
    const store = useFilterStore()
    expect(store.factions).toEqual(['UEF', 'Cybran', 'Aeon', 'Seraphim'])
  })

  it('initializes with empty kinds and tech', () => {
    const store = useFilterStore()
    expect(store.kinds).toEqual([])
    expect(store.tech).toEqual([])
  })

  it('matches unit when all filters are default', () => {
    const store = useFilterStore()
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('filters out unmatched faction', () => {
    const store = useFilterStore()
    store.toggleFaction('UEF')
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(false)
  })

  it('matches when faction is selected', () => {
    const store = useFilterStore()
    store.toggleFaction('Cybran')
    store.toggleFaction('Aeon')
    store.toggleFaction('Seraphim')
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('filters by kind', () => {
    const store = useFilterStore()
    store.kinds = ['Land']
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Test' }
    const airUnit = { id: 'UEA0101', faction: 'UEF', kind: 'Air', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(airUnit)).toBe(false)
  })

  it('filters by tech level', () => {
    const store = useFilterStore()
    store.tech = ['T1']
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Test' }
    const t3Unit = { id: 'UEL0303', faction: 'UEF', kind: 'Land', tech: 'T3', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(t3Unit)).toBe(false)
  })

  it('filters by text search', () => {
    const store = useFilterStore()
    store.search = 'striker'
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Striker' }
    const other = { id: 'UEL0202', faction: 'UEF', kind: 'Land', tech: 'T2', name: 'Pillar' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(other)).toBe(false)
  })

  it('text search is case insensitive', () => {
    const store = useFilterStore()
    store.search = 'STRIKER'
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Striker' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('text search searches across multiple fields', () => {
    const store = useFilterStore()
    store.search = 'uel'
    const unit = { id: 'UEL0201', faction: 'UEF', kind: 'Land', tech: 'T1', name: 'Striker' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('toggleFaction removes faction when present', () => {
    const store = useFilterStore()
    store.toggleFaction('UEF')
    expect(store.factions).not.toContain('UEF')
    expect(store.factions).toEqual(['Cybran', 'Aeon', 'Seraphim'])
  })

  it('toggleFaction adds faction back when called again', () => {
    const store = useFilterStore()
    store.toggleFaction('UEF')
    store.toggleFaction('UEF')
    expect(store.factions).toContain('UEF')
  })

  it('toggleKind works correctly', () => {
    const store = useFilterStore()
    store.toggleKind('Land')
    expect(store.kinds).toContain('Land')
    store.toggleKind('Land')
    expect(store.kinds).not.toContain('Land')
  })

  it('toggleTech works correctly', () => {
    const store = useFilterStore()
    store.toggleTech('T1')
    expect(store.tech).toContain('T1')
    store.toggleTech('T1')
    expect(store.tech).not.toContain('T1')
  })

  describe('effectiveVisibleFactions', () => {
    it('returns all factions including Nomads when filter is empty', () => {
      const store = useFilterStore()
      store.toggleFaction('UEF')
      store.toggleFaction('Cybran')
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')
      expect(store.effectiveVisibleFactions).toEqual(['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'])
    })

    it('returns selected factions when filter is not empty', () => {
      const store = useFilterStore()
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')
      expect(store.effectiveVisibleFactions).toEqual(['UEF', 'Cybran'])
    })

    it('returns all factions when using default state', () => {
      const store = useFilterStore()
      expect(store.effectiveVisibleFactions).toEqual(['UEF', 'Cybran', 'Aeon', 'Seraphim'])
    })
  })
})
