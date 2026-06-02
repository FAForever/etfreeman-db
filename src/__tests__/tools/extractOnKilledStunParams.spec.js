import { describe, it, expect, vi } from 'vitest'
import { extractOnKilledStunParams } from '../../../tools/generator/parser.js'

const URL0303 = `
local CWalkingLandUnit = import("/lua/cybranunits.lua").CWalkingLandUnit
local GetTrueEnemyUnitsInSphere = import("/lua/utilities.lua").GetTrueEnemyUnitsInSphere

URL0303 = ClassUnit(CWalkingLandUnit) {
    Weapons = {
        HeavyBolter = ClassWeapon(CDFElectronBolterWeapon) {},
    },
    OnKilled = function(self, instigator, type, overkillRatio)
        CWalkingLandUnit.OnKilled(self, instigator, type, overkillRatio)
        CreateLightParticle(self, -1, self.Army, 24, 62, 'flare_lens_add_02', 'ramp_red_10')
        local radius = 10
        local targets = GetTrueEnemyUnitsInSphere(self, self:GetPosition(), radius,
            categories.MOBILE - (categories.EXPERIMENTAL + categories.COMMAND))
        if targets then
            for k = 1, table.getn(targets) do
                local target = targets[k]
                if target.Layer ~= 'Air' then
                    target:SetStunned(1.5)
                end
            end
        end
    end,
}
TypeClass = URL0303
`

describe('extractOnKilledStunParams', () => {
  it('happy path: parses URL0303 script', () => {
    expect(extractOnKilledStunParams(URL0303)).toEqual({
      duration: 1.5,
      allowed: ['MOBILE'],
      disallowed: ['EXPERIMENTAL', 'COMMAND'],
    })
  })

  it('returns null when OnKilled is absent', () => {
    const src = `X = ClassUnit(Base) { OnDamage = function(self) end }`
    expect(extractOnKilledStunParams(src)).toBeNull()
  })

  it('returns null when SetStunned is absent', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        GetTrueEnemyUnitsInSphere(self, self:GetPosition(), 5, categories.MOBILE)
      end
    }`
    expect(extractOnKilledStunParams(src)).toBeNull()
  })

  it('returns null when GetTrueEnemyUnitsInSphere is absent', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        self:SetStunned(2)
      end
    }`
    expect(extractOnKilledStunParams(src)).toBeNull()
  })

  it('returns null when categories arg has no categories.* leaves', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        GetTrueEnemyUnitsInSphere(self, self:GetPosition(), 5, someVar)
        self:SetStunned(1)
      end
    }`
    expect(extractOnKilledStunParams(src)).toBeNull()
  })

  it('returns null when SetStunned arg is not a numeric literal', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        GetTrueEnemyUnitsInSphere(self, self:GetPosition(), 5, categories.MOBILE)
        self:SetStunned(duration)
      end
    }`
    expect(extractOnKilledStunParams(src)).toBeNull()
  })

  it('handles obfuscated parenthesization via sign-flip walk', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        GetTrueEnemyUnitsInSphere(self, self:GetPosition(), 5,
          categories.A - (categories.B - (categories.C - categories.D)))
        self:SetStunned(0.5)
      end
    }`
    expect(extractOnKilledStunParams(src)).toEqual({
      duration: 0.5,
      allowed: ['A', 'C'],
      disallowed: ['B', 'D'],
    })
  })

  it('handles plain GetTrueEnemyUnitsInSphere (non-method) call', () => {
    const src = `X = ClassUnit(Base) {
      OnKilled = function(self)
        local t = GetTrueEnemyUnitsInSphere(self, self:GetPosition(), 5, categories.AIR + categories.NAVAL)
        for _, v in t do v:SetStunned(3) end
      end
    }`
    expect(extractOnKilledStunParams(src)).toEqual({
      duration: 3,
      allowed: ['AIR', 'NAVAL'],
      disallowed: [],
    })
  })

  it('returns null and warns on malformed lua', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(extractOnKilledStunParams('this is not lua at all !!!')).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
