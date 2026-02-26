// Unit Data Store Tests - Tests state management
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitDataStore } from '@/stores/unitData.js'
import { useFilterStore } from '@/stores/filterStore.js'

describe('Unit Data Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initialization', () => {
    it('initializes with default state', () => {
      const store = useUnitDataStore()

      expect(store.units).toEqual([])
      expect(store.version).toBeNull()
      expect(store.contenders.size).toBe(0)
    })

    it('provides units computed property', () => {
      const store = useUnitDataStore()
      expect(store.units).toEqual([])
    })

    it('provides visibleUnits computed property', () => {
      const store = useUnitDataStore()
      expect(store.visibleUnits).toEqual([])
    })
  })

  describe('setData', () => {
    it('sets unit data and decorates units', () => {
      const store = useUnitDataStore()
      const mockData = {
        version: '1.0.0',
        units: [
          {
            Id: 'UEL0201',
            Description: 'Medium Tank',
            General: { FactionName: 'UEF' },
            Categories: ['TECH1', 'MOBILE', 'LAND']
          }
        ]
      }

      store.setData(mockData)

      expect(store.version).toBe('1.0.0')
      expect(store.units).toHaveLength(1)
      expect(store.units[0].id).toBe('UEL0201')
      expect(store.units[0].faction).toBe('uef')
      expect(store.units[0].kind).toBe('Land')
    })

    it('handles data without version', () => {
      const store = useUnitDataStore()
      const mockData = {
        units: [
          { Id: 'TEST001', Categories: [] }
        ]
      }

      store.setData(mockData)

      expect(store.version).toBeNull()
      expect(store.units).toHaveLength(1)
    })
  })

  describe('visibleUnits integrates with filterStore', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setData({
        units: [
          { Id: 'UEL0201', General: { FactionName: 'UEF' }, Categories: ['TECH1', 'MOBILE', 'LAND'] },
          { Id: 'URL0107', General: { FactionName: 'Cybran' }, Categories: ['TECH1', 'MOBILE', 'LAND'] }
        ]
      })
    })

    it('shows all units when filters are default', () => {
      const store = useUnitDataStore()
      expect(store.visibleUnits).toHaveLength(2)
    })

    it('filters units based on filterStore state', () => {
      const store = useUnitDataStore()
      const filterStore = useFilterStore()
      filterStore.toggleFaction('uef')

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].id).toBe('URL0107')
    })
  })

  describe('Unit Selection', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setData({
        units: [
          { Id: 'UEL0201', Categories: [] },
          { Id: 'URL0107', Categories: [] }
        ]
      })
    })

    it('toggleUnitSelection selects a unit', () => {
      const store = useUnitDataStore()
      const unit = store.units.find(u => u.id === 'UEL0201')
      store.toggleUnitSelection(unit)

      expect(unit.selected).toBe(true)
      expect(store.contenders.has('UEL0201')).toBe(true)
    })

    it('toggleUnitSelection deselects a unit', () => {
      const store = useUnitDataStore()
      const unit1 = store.units.find(u => u.id === 'UEL0201')
      const unit2 = store.units.find(u => u.id === 'UEL0201')
      store.toggleUnitSelection(unit1)
      store.toggleUnitSelection(unit2)

      expect(unit1.selected).toBe(false)
      expect(store.contenders.has('UEL0201')).toBe(false)
    })

    it('tracks multiple selected units', () => {
      const store = useUnitDataStore()
      const unit1 = store.units.find(u => u.id === 'UEL0201')
      const unit2 = store.units.find(u => u.id === 'URL0107')
      store.toggleUnitSelection(unit1)
      store.toggleUnitSelection(unit2)

      expect(store.contenders.size).toBe(2)
      expect(store.contenders.has('UEL0201')).toBe(true)
      expect(store.contenders.has('URL0107')).toBe(true)
    })

    it('clearSelection deselects all units', () => {
      const store = useUnitDataStore()
      const unit1 = store.units.find(u => u.id === 'UEL0201')
      const unit2 = store.units.find(u => u.id === 'URL0107')
      store.toggleUnitSelection(unit1)
      store.toggleUnitSelection(unit2)
      store.clearSelection()

      expect(store.contenders.size).toBe(0)
      store.units.forEach(unit => {
        expect(unit.selected).toBe(false)
      })
    })

    it('setUnitSelection sets selection state', () => {
      const store = useUnitDataStore()
      const unit = store.units.find(u => u.id === 'UEL0201')
      store.setUnitSelection(unit, true)

      expect(unit.selected).toBe(true)
      expect(store.contenders.has('UEL0201')).toBe(true)
    })
  })

  describe('loadData', () => {
    it('fetches data from correct URL', async () => {
      const store = useUnitDataStore()
      const mockData = {
        version: '1.0.0',
        units: [{ Id: 'TEST001', Categories: [] }]
      }

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockData)
        })
      )

      await store.loadData()

      expect(global.fetch).toHaveBeenCalledWith('/data/index.json')
      expect(store.version).toBe('1.0.0')
      expect(store.units).toHaveLength(1)
    })

    it('loads fat data when URL contains fat parameter', async () => {
      const store = useUnitDataStore()
      global.window.location.search = '?fat'

      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ units: [] })
        })
      )

      await store.loadData()

      expect(global.fetch).toHaveBeenCalledWith('/data/index.fat.json')
    })

    it('handles fetch errors', async () => {
      const store = useUnitDataStore()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

      await expect(store.loadData()).rejects.toThrow('Network error')

      consoleErrorSpy.mockRestore()
    })
  })
})
