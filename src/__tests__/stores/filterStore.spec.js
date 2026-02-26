import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'

describe('Filter Store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('initializes with default factions', () => {
    const store = useFilterStore()
    expect([...store.factions]).toEqual(['uef', 'cybran', 'aeon', 'seraphim'])
  })

  it('initializes with empty kinds and tech', () => {
    const store = useFilterStore()
    expect(store.kinds).toEqual(new Set())
    expect(store.tech).toEqual(new Set())
  })

  it('matches unit when all filters are default', () => {
    const store = useFilterStore()
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('filters out unmatched faction', () => {
    const store = useFilterStore()
    store.toggleFaction('uef')
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(false)
  })

  it('matches when faction is selected', () => {
    const store = useFilterStore()
    store.toggleFaction('cybran')
    store.toggleFaction('aeon')
    store.toggleFaction('seraphim')
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('filters by kind', () => {
    const store = useFilterStore()
    store.toggleKind('Land')
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Test' }
    const airUnit = { id: 'UEA0101', faction: 'uef', kind: 'Air', tech: 'T1', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(airUnit)).toBe(false)
  })

  it('filters by tech level', () => {
    const store = useFilterStore()
    store.toggleTech('T1')
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Test' }
    const t3Unit = { id: 'UEL0303', faction: 'uef', kind: 'Land', tech: 'T3', name: 'Test' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(t3Unit)).toBe(false)
  })

  it('filters by text search', () => {
    const store = useFilterStore()
    store.search = 'striker'
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Striker' }
    const other = { id: 'UEL0202', faction: 'uef', kind: 'Land', tech: 'T2', name: 'Pillar' }
    expect(store.passesFilters(unit)).toBe(true)
    expect(store.passesFilters(other)).toBe(false)
  })

  it('text search is case insensitive', () => {
    const store = useFilterStore()
    store.search = 'STRIKER'
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Striker' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('text search searches across multiple fields', () => {
    const store = useFilterStore()
    store.search = 'uel'
    const unit = { id: 'UEL0201', faction: 'uef', kind: 'Land', tech: 'T1', name: 'Striker' }
    expect(store.passesFilters(unit)).toBe(true)
  })

  it('toggleFaction removes faction when present', () => {
    const store = useFilterStore()
    store.toggleFaction('uef')
    expect(store.factions.has('uef')).toBe(false)
    expect([...store.factions]).toEqual(['cybran', 'aeon', 'seraphim'])
  })

  it('toggleFaction adds faction back when called again', () => {
    const store = useFilterStore()
    store.toggleFaction('uef')
    store.toggleFaction('uef')
    expect(store.factions.has('uef')).toBe(true)
  })

  it('toggleKind works correctly', () => {
    const store = useFilterStore()
    store.toggleKind('Land')
    expect(store.kinds.has('Land')).toBe(true)
    store.toggleKind('Land')
    expect(store.kinds.has('Land')).toBe(false)
  })

  it('toggleTech works correctly', () => {
    const store = useFilterStore()
    store.toggleTech('T1')
    expect(store.tech.has('T1')).toBe(true)
    store.toggleTech('T1')
    expect(store.tech.has('T1')).toBe(false)
  })

  describe('effectiveVisibleFactions', () => {
    it('returns all factions including Nomads when filter is empty', () => {
      const store = useFilterStore()
      store.toggleFaction('uef')
      store.toggleFaction('cybran')
      store.toggleFaction('aeon')
      store.toggleFaction('seraphim')
      expect(store.effectiveVisibleFactions).toEqual(['uef', 'cybran', 'aeon', 'seraphim', 'nomads'])
    })

    it('returns selected factions when filter is not empty', () => {
      const store = useFilterStore()
      store.toggleFaction('aeon')
      store.toggleFaction('seraphim')
      expect(store.effectiveVisibleFactions).toEqual(['uef', 'cybran'])
    })

    it('returns all factions when using default state', () => {
      const store = useFilterStore()
      expect(store.effectiveVisibleFactions).toEqual(['uef', 'cybran', 'aeon', 'seraphim'])
    })
  })
})
