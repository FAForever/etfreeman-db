import { describe, it, expect } from 'vitest'
import { parseStatLabel, resolveRef } from '@/stores/compare/customStatsVars'

describe('parseStatLabel', () => {
  it('parses multiple vars', () => {
    const r = parseStatLabel('power(X,Y)')
    expect(r.error).toBe(null)
    expect(r.vars).toEqual(['X', 'Y'])
    expect(r.pre).toBe('power(')
    expect(r.post).toBe(')')
  })

  it('trims whitespace', () => {
    const r = parseStatLabel('power( X , Y )')
    expect(r.error).toBe(null)
    expect(r.vars).toEqual(['X', 'Y'])
  })

  it('plain label has no vars', () => {
    const r = parseStatLabel('HP/Mass')
    expect(r).toEqual({ pre: 'HP/Mass', post: '', vars: [], error: null })
  })

  it('supports text after the group', () => {
    const r = parseStatLabel('power(X) kg')
    expect(r.error).toBe(null)
    expect(r.pre).toBe('power(')
    expect(r.post).toBe(') kg')
  })

  it.each([
    ['power(X', 'Unbalanced parentheses'],
    ['a(x)y(z)', 'Unbalanced parentheses'],
    ['a((x))', 'Unbalanced parentheses'],
  ])('rejects broken parens %s', (label, error) => {
    expect(parseStatLabel(label).error).toBe(error)
  })

  it('rejects empty group', () => {
    expect(parseStatLabel('power()').error).toMatch(/valid variable name/)
  })

  it('rejects bad identifiers', () => {
    expect(parseStatLabel('a(1x)').error).toMatch(/valid variable name/)
    expect(parseStatLabel('a(x y)').error).toMatch(/valid variable name/)
  })

  it('rejects duplicates', () => {
    expect(parseStatLabel('dup(x,x)').error).toMatch(/duplicate/)
  })

  it('rejects reserved names', () => {
    expect(parseStatLabel('a(unit)').error).toMatch(/reserved/)
    expect(parseStatLabel('a(ID)').error).toMatch(/reserved/)
    expect(parseStatLabel('a(if)').error).toMatch(/reserved/)
  })
})

describe('resolveRef', () => {
  const unit = { Defense: { Health: 7200 }, Weapons: { Direct: { DPS: 300 } } }

  it('resolves unit-prefixed paths', () => {
    expect(resolveRef('unit.Defense.Health', unit)).toBe(7200)
    expect(resolveRef("unit.Weapons['Direct'].DPS", unit)).toBe(300)
  })

  it('passes non-refs through unchanged', () => {
    expect(resolveRef('1280', unit)).toBe('1280')
    expect(resolveRef('Defense.Health', unit)).toBe('Defense.Health')
    expect(resolveRef('unit.Defense.Healthx', unit)).toBe('unit.Defense.Healthx')
    expect(resolveRef(0, unit)).toBe(0)
  })

  it('returns undefined for missing props', () => {
    expect(resolveRef('unit.Intel.RadarRadius', unit)).toBeUndefined()
  })
})
