import { describe, it, expect } from 'vitest'
import { useCustomStats } from '@/stores/compare/useCustomStats'

const setup = () => {
  const s = useCustomStats()
  s.addStat()
  const stat = s.customStats.stats[0]
  stat.label = 'power(M)'
  stat.vars = { M: { value: '100', color: '#fff' } }
  return { s, stat }
}

describe('var overrides', () => {
  it('falls back to editor default', () => {
    const { s, stat } = setup()
    expect(s.getVarValue(stat, 'UAL0301', 'M')).toBe('100')
  })

  it('global override applies to any unit', () => {
    const { s, stat } = setup()
    s.setVarOverrides(stat.id, { M: '200' })
    expect(s.getVarValue(stat, 'UAL0301', 'M')).toBe('200')
    expect(s.getVarValue(stat, 'XEL0305', 'M')).toBe('200')
  })

  it('unit override shadows global', () => {
    const { s, stat } = setup()
    s.setVarOverrides(stat.id, { M: '200' })
    s.setVarOverrides(stat.id, { M: '300' }, 'UAL0301')
    expect(s.getVarValue(stat, 'UAL0301', 'M')).toBe('300')
    expect(s.getVarValue(stat, 'XEL0305', 'M')).toBe('200')
  })

  it('save for all clears unit shadows', () => {
    const { s, stat } = setup()
    s.setVarOverrides(stat.id, { M: '300' }, 'UAL0301')
    s.setVarOverrides(stat.id, { M: '400' })
    expect(s.getVarValue(stat, 'UAL0301', 'M')).toBe('400')
  })

  it('keeps vars when label temporarily invalid, prunes on valid rename', () => {
    const { s, stat } = setup()
    s.setVar(stat.id, 'M', { value: '500', color: '#f00' })
    s.updateStat(stat.id, { label: 'power(M' })
    expect(stat.vars.M).toEqual({ value: '500', color: '#f00' })
    s.updateStat(stat.id, { label: 'power(N)' })
    expect(stat.vars.M).toBeUndefined()
  })

  it('empty string resets to default', () => {
    const { s, stat } = setup()
    s.setVarOverrides(stat.id, { M: '300' }, 'UAL0301')
    s.setVarOverrides(stat.id, { M: '' }, 'UAL0301')
    expect(s.getVarValue(stat, 'UAL0301', 'M')).toBe('100')
  })
})
