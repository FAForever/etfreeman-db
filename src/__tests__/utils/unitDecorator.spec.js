// Unit Decorator Tests - Tests data transformation and decoration
import { describe, it, expect } from 'vitest'
import { decorateUnit, decorateUnits } from '../../stores/utils/unitDecorator/index.js'

describe('Unit Decorator', () => {
  describe('decorateUnit', () => {
    it('extracts basic unit properties', () => {
      const blueprint = {
        Id: 'UEL0201',
        Description: 'Medium Tank',
        General: {
          UnitName: 'Striker',
          FactionName: 'UEF',
          Classification: 'RULEUC_MilitaryVehicle'
        },
        Categories: ['TECH1'],
        StrategicIconName: 'icon_land1_directfire',
        BuildIconSortPriority: 10
      }

      const unit = decorateUnit(blueprint)

      expect(unit.id).toBe('UEL0201')
      expect(unit.name).toBe('Striker')
      expect(unit.description).toBe('Medium Tank')
      expect(unit.faction).toBe('UEF')
      expect(unit.factionId).toBe(0)
      expect(unit.classification).toBe('Land')
      expect(unit.tech).toBe('T1')
      expect(unit.strategicIcon).toBe('icon_land1_directfire')
      expect(unit.order).toBe(10)
      expect(unit.selected).toBe(false)
    })

    it('handles missing optional properties', () => {
      const blueprint = {
        Id: 'TEST001',
        Description: 'Test Unit',
        Categories: []
      }

      const unit = decorateUnit(blueprint)

      expect(unit.id).toBe('TEST001')
      expect(unit.name).toBe('')
      expect(unit.faction).toBe('')
      expect(unit.tech).toBe('')
    })

    it('correctly maps faction names to IDs', () => {
      const factions = [
        { name: 'UEF', expectedId: 0 },
        { name: 'Cybran', expectedId: 1 },
        { name: 'Aeon', expectedId: 2 },
        { name: 'Seraphim', expectedId: 3 },
        { name: 'Nomads', expectedId: 4 }
      ]

      factions.forEach(({ name, expectedId }) => {
        const unit = decorateUnit({
          Id: 'TEST',
          General: { FactionName: name },
          Categories: []
        })
        expect(unit.factionId).toBe(expectedId)
      })
    })

    it('correctly maps tech levels', () => {
      const techLevels = [
        { category: 'TECH1', expected: 'T1' },
        { category: 'TECH2', expected: 'T2' },
        { category: 'TECH3', expected: 'T3' },
        { category: 'EXPERIMENTAL', expected: 'EXP' }
      ]

      techLevels.forEach(({ category, expected }) => {
        const unit = decorateUnit({
          Id: 'TEST',
          Categories: [category]
        })
        expect(unit.tech).toBe(expected)
      })
    })

    it('correctly maps classification categories', () => {
      const classifications = [
        { category: 'RULEUC_MilitaryVehicle', expected: 'Land' },
        { category: 'RULEUC_MilitaryAircraft', expected: 'Air' },
        { category: 'RULEUC_MilitaryShip', expected: 'Naval' },
        { category: 'RULEUC_MilitarySub', expected: 'Naval' },
        { category: 'RULEUMT_Amphibious', expected: 'Land' },
        { category: 'RULEUC_Engineer', expected: 'Build' },
        { category: 'RULEUC_Commander', expected: 'Build' },
        { category: 'RULEUC_Factory', expected: 'Base' }
      ]

      classifications.forEach(({ category, expected }) => {
        const unit = decorateUnit({
          Id: 'TEST',
          General: { Classification: category },
          Categories: []
        })
        expect(unit.classification).toBe(expected)
      })
    })

    it('generates fullName correctly', () => {
      const unit = decorateUnit({
        Id: 'UEL0201',
        Description: 'Medium Tank',
        General: { UnitName: 'Striker' },
        Categories: ['TECH1']
      })

      expect(unit.fullName).toBe('Striker: T1 Medium Tank')
    })

    it('generates fullName without name', () => {
      const unit = decorateUnit({
        Id: 'UEL0201',
        Description: 'Medium Tank',
        Categories: ['TECH1']
      })

      expect(unit.fullName).toBe('T1 Medium Tank')
    })

    it('generates fullName for experimental without tech prefix', () => {
      const unit = decorateUnit({
        Id: 'UEL0401',
        Description: 'Experimental Mobile Factory',
        General: { UnitName: 'Fatboy' },
        Categories: ['EXPERIMENTAL']
      })

      expect(unit.fullName).toBe('Fatboy: Experimental Mobile Factory')
    })

    it('decorates weapon DPS for units with weapons', () => {
      const blueprint = {
        Id: 'URL0107',
        Description: 'Light Assault Bot',
        Categories: ['TECH1'],
        Weapon: [
          {
            Damage: 8,
            RateOfFire: 3,
            MuzzleSalvoSize: 1,
            RackSalvoChargeTime: 0
          }
        ]
      }

      const unit = decorateUnit(blueprint)

      expect(unit.Weapon).toBeDefined()
      expect(unit.Weapon[0].dps).toBeDefined()
      expect(unit.Weapon[0].dps).toBeGreaterThan(0)
    })

    it('handles GDI classification lookup for special units', () => {
      const unit = decorateUnit({
        Id: 'XEB0204',
        Description: 'Engineering Station',
        Categories: ['TECH2']
      })

      expect(unit.detailedClassification).toBe('T2 Engineering Station')
    })

    it('calculates sortOrder for sorting', () => {
      const unit1 = decorateUnit({
        Id: 'UEL0201',
        Description: 'Medium Tank',
        General: { Classification: 'RULEUC_MilitaryVehicle' },
        Categories: ['TECH1']
      })

      const unit2 = decorateUnit({
        Id: 'UEA0101',
        Description: 'Interceptor',
        General: { Classification: 'RULEUC_MilitaryAircraft' },
        Categories: ['TECH1']
      })

      expect(unit1.sortOrder).toBeDefined()
      expect(unit2.sortOrder).toBeDefined()
      expect(typeof unit1.sortOrder).toBe('number')
    })
  })

  describe('decorateUnits', () => {
    it('decorates an array of units', () => {
      const blueprints = [
        {
          Id: 'UEL0201',
          Description: 'Tank',
          Categories: ['TECH1']
        },
        {
          Id: 'UEL0202',
          Description: 'Heavy Tank',
          Categories: ['TECH2']
        }
      ]

      const units = decorateUnits(blueprints)

      expect(units).toHaveLength(2)
      expect(units[0].id).toBe('UEL0201')
      expect(units[0].tech).toBe('T1')
      expect(units[1].id).toBe('UEL0202')
      expect(units[1].tech).toBe('T2')
    })

    it('handles empty array', () => {
      const units = decorateUnits([])
      expect(units).toHaveLength(0)
    })
  })
})
