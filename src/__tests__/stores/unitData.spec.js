// Unit Data Store Tests - Tests state management and filtering
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUnitDataStore } from '../../stores/unitData.js'

describe('Unit Data Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initialization', () => {
    it('initializes with default state', () => {
      const store = useUnitDataStore()

      expect(store.unitIndex).toEqual([])
      expect(store.units).toEqual([])
      expect(store.version).toBeNull()
      expect(store.contenders).toEqual([])
      expect(store.selectedFilterFactions).toEqual(['UEF', 'Cybran', 'Aeon', 'Seraphim'])
      expect(store.selectedFilterKinds).toEqual([])
      expect(store.selectedFilterTech).toEqual([])
      expect(store.textFilter).toBe('')
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

  describe('setIndex', () => {
    it('sets unit data and decorates units', () => {
      const store = useUnitDataStore()
      const mockData = {
        version: '1.0.0',
        units: [
          {
            Id: 'UEL0201',
            Description: 'Medium Tank',
            General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryVehicle' },
            Categories: ['TECH1']
          }
        ]
      }

      store.setIndex(mockData)

      expect(store.version).toBe('1.0.0')
      expect(store.unitIndex).toHaveLength(1)
      expect(store.units).toHaveLength(1)
      expect(store.units[0].id).toBe('UEL0201')
      expect(store.units[0].faction).toBe('UEF')
      expect(store.units[0].classification).toBe('Land')
    })

    it('handles data without version', () => {
      const store = useUnitDataStore()
      const mockData = {
        units: [
          { Id: 'TEST001', Categories: [] }
        ]
      }

      store.setIndex(mockData)

      expect(store.version).toBeNull()
      expect(store.unitIndex).toHaveLength(1)
    })
  })

  describe('Faction Filtering', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] },
          { Id: 'URL0107', General: { FactionName: 'Cybran', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] },
          { Id: 'UAL0201', General: { FactionName: 'Aeon', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] }
        ]
      })
    })

    it('shows all units with default faction filters', () => {
      const store = useUnitDataStore()
      expect(store.visibleUnits).toHaveLength(3)
    })

    it('toggleFaction removes faction from filter', () => {
      const store = useUnitDataStore()
      store.toggleFaction('UEF')

      expect(store.selectedFilterFactions).not.toContain('UEF')
      expect(store.visibleUnits).toHaveLength(2)
      expect(store.visibleUnits.map(u => u.faction)).not.toContain('UEF')
    })

    it('toggleFaction adds faction back when called twice', () => {
      const store = useUnitDataStore()
      store.toggleFaction('UEF')
      store.toggleFaction('UEF')

      expect(store.selectedFilterFactions).toContain('UEF')
      expect(store.visibleUnits).toHaveLength(3)
    })

    it('filters to specific factions', () => {
      const store = useUnitDataStore()
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')

      expect(store.visibleUnits).toHaveLength(2)
      const factions = store.visibleUnits.map(u => u.faction)
      expect(factions).toContain('UEF')
      expect(factions).toContain('Cybran')
      expect(factions).not.toContain('Aeon')
    })
  })

  describe('Kind (Classification) Filtering', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] },
          { Id: 'UEA0101', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryAircraft' }, Categories: ['TECH1'] },
          { Id: 'UES0201', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryShip' }, Categories: ['TECH2'] }
        ]
      })
    })

    it('toggleKind filters by classification', () => {
      const store = useUnitDataStore()
      store.toggleKind('Land')

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].classification).toBe('Land')
    })

    it('filters multiple kinds', () => {
      const store = useUnitDataStore()
      store.toggleKind('Land')
      store.toggleKind('Air')

      expect(store.visibleUnits).toHaveLength(2)
      const classifications = store.visibleUnits.map(u => u.classification)
      expect(classifications).toContain('Land')
      expect(classifications).toContain('Air')
    })
  })

  describe('Tech Level Filtering', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', General: { FactionName: 'UEF' }, Categories: ['TECH1'] },
          { Id: 'UEL0202', General: { FactionName: 'UEF' }, Categories: ['TECH2'] },
          { Id: 'UEL0303', General: { FactionName: 'UEF' }, Categories: ['TECH3'] },
          { Id: 'UEL0401', General: { FactionName: 'UEF' }, Categories: ['EXPERIMENTAL'] }
        ]
      })
    })

    it('toggleTech filters by tech level', () => {
      const store = useUnitDataStore()
      store.toggleTech('T1')

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].tech).toBe('T1')
    })

    it('filters multiple tech levels', () => {
      const store = useUnitDataStore()
      store.toggleTech('T2')
      store.toggleTech('T3')

      expect(store.visibleUnits).toHaveLength(2)
      const techs = store.visibleUnits.map(u => u.tech)
      expect(techs).toContain('T2')
      expect(techs).toContain('T3')
    })
  })

  describe('Text Filtering', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', Description: 'Medium Tank', General: { FactionName: 'UEF', UnitName: 'Striker' }, Categories: [] },
          { Id: 'UEL0202', Description: 'Heavy Tank', General: { FactionName: 'UEF', UnitName: 'Pillar' }, Categories: [] },
          { Id: 'UEA0101', Description: 'Interceptor', General: { FactionName: 'UEF', UnitName: 'Cyclone' }, Categories: [] }
        ]
      })
    })

    it('filters by unit ID', () => {
      const store = useUnitDataStore()
      store.textFilter = 'UEL0201'

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].id).toBe('UEL0201')
    })

    it('filters by unit name', () => {
      const store = useUnitDataStore()
      store.textFilter = 'striker'

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].name).toBe('Striker')
    })

    it('filters by description', () => {
      const store = useUnitDataStore()
      store.textFilter = 'tank'

      expect(store.visibleUnits).toHaveLength(2)
    })

    it('is case insensitive', () => {
      const store = useUnitDataStore()
      store.textFilter = 'STRIKER'

      expect(store.visibleUnits).toHaveLength(1)
    })

    it('handles empty text filter', () => {
      const store = useUnitDataStore()
      store.textFilter = ''

      expect(store.visibleUnits).toHaveLength(3)
    })
  })

  describe('Combined Filtering', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', Description: 'Medium Tank', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] },
          { Id: 'URL0107', Description: 'Light Assault Bot', General: { FactionName: 'Cybran', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH1'] },
          { Id: 'UEL0202', Description: 'Heavy Tank', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryVehicle' }, Categories: ['TECH2'] },
          { Id: 'UEA0101', Description: 'Interceptor', General: { FactionName: 'UEF', Classification: 'RULEUC_MilitaryAircraft' }, Categories: ['TECH1'] }
        ]
      })
    })

    it('combines faction and tech filters', () => {
      const store = useUnitDataStore()
      store.toggleFaction('Cybran')
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')
      store.toggleTech('T1')

      expect(store.visibleUnits).toHaveLength(2)
      store.visibleUnits.forEach(unit => {
        expect(unit.faction).toBe('UEF')
        expect(unit.tech).toBe('T1')
      })
    })

    it('combines all filter types', () => {
      const store = useUnitDataStore()
      store.toggleFaction('Cybran')
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')
      store.toggleKind('Land')
      store.toggleTech('T2')

      expect(store.visibleUnits).toHaveLength(1)
      expect(store.visibleUnits[0].id).toBe('UEL0202')
    })

    it('combines filters with text search', () => {
      const store = useUnitDataStore()
      store.toggleFaction('Cybran')
      store.toggleFaction('Aeon')
      store.toggleFaction('Seraphim')
      store.textFilter = 'tank'

      expect(store.visibleUnits).toHaveLength(2)
      expect(store.visibleUnits[0].id).toBe('UEL0201')
      expect(store.visibleUnits[1].id).toBe('UEL0202')
    })
  })

  describe('Unit Selection', () => {
    beforeEach(() => {
      const store = useUnitDataStore()
      store.setIndex({
        units: [
          { Id: 'UEL0201', Categories: [] },
          { Id: 'URL0107', Categories: [] }
        ]
      })
    })

    it('toggleUnitSelection selects a unit', () => {
      const store = useUnitDataStore()
      store.toggleUnitSelection('UEL0201')

      const unit = store.units.find(u => u.id === 'UEL0201')
      expect(unit.selected).toBe(true)
      expect(store.contenders).toContain('UEL0201')
    })

    it('toggleUnitSelection deselects a unit', () => {
      const store = useUnitDataStore()
      store.toggleUnitSelection('UEL0201')
      store.toggleUnitSelection('UEL0201')

      const unit = store.units.find(u => u.id === 'UEL0201')
      expect(unit.selected).toBe(false)
      expect(store.contenders).not.toContain('UEL0201')
    })

    it('tracks multiple selected units', () => {
      const store = useUnitDataStore()
      store.toggleUnitSelection('UEL0201')
      store.toggleUnitSelection('URL0107')

      expect(store.contenders).toHaveLength(2)
      expect(store.contenders).toContain('UEL0201')
      expect(store.contenders).toContain('URL0107')
    })

    it('clearSelection deselects all units', () => {
      const store = useUnitDataStore()
      store.toggleUnitSelection('UEL0201')
      store.toggleUnitSelection('URL0107')
      store.clearSelection()

      expect(store.contenders).toHaveLength(0)
      store.units.forEach(unit => {
        expect(unit.selected).toBe(false)
      })
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
      expect(store.unitIndex).toHaveLength(1)
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
