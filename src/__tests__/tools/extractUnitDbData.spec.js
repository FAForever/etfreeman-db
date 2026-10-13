import { describe, it, expect } from 'vitest'
import { extractUnitDbData } from '../../../tools/generator/parser.js'

const makeScript = (locals, annotation) => `localimports = import('/lua/effectentities.lua')
${locals}
-- UnitDatabaseData: ${annotation}
Projectile = ClassProjectile(BaseProjectile) { OnImpact = function(self) end }
`

const CONTROLLER = `local PlumeCount = 7\n`
const EFFECT = `local PlumeDamage = 300\nlocal PlumeDamageRadius = 3\n`
const files = {
  'sboohwallibombeffectcontroller01': CONTROLLER,
  'sboohwallibombeffect01': EFFECT,
}
const getFileContent = id => files[id]

const ahwassaAnnotation = `{"files": ["effects/Entities/SBOOhwalliBombEffectController01/SBOOhwalliBombEffectController01_script.lua", "effects/Entities/SBOOhwalliBombEffect01/SBOOhwalliBombEffect01_script.lua"], "tooltip": "The explosion spawns \${PlumeCount} fireball plumes that land randomly nearby, each dealing \${PlumeDamage} damage in a \${PlumeDamageRadius} radius."}`

describe('extractUnitDbData', () => {
  it('resolves tooltip placeholders across files listed in "files"', () => {
    const script = makeScript('', ahwassaAnnotation)
    expect(extractUnitDbData(script, getFileContent)).toEqual({
      tooltip: 'The explosion spawns 7 fireball plumes that land randomly nearby, each dealing 300 damage in a 3 radius.',
    })
  })

  it('merges bp keys and converts *Ticks after placeholder resolution', () => {
    const script = makeScript('local HoldTicks = 38', '{"DoTPulses": 2, "DoTTimeTicks": "${HoldTicks}"}')
    const result = extractUnitDbData(script, getFileContent)
    expect(result).toEqual({ DoTPulses: 2, DoTTime: 3.8 })
    expect(typeof result.DoTTime).toBe('number')
  })

  it('whole-value placeholder keeps the resolved type', () => {
    const script = makeScript('local Dmg = 120', '{"Damage": "${Dmg}"}')
    expect(extractUnitDbData(script, getFileContent).Damage).toBe(120)
  })

  it('ignores computed locals (only literal initializers resolve)', () => {
    const script = makeScript('local X = GetSomething()', '{"Damage": "${X}"}')
    expect(() => extractUnitDbData(script, getFileContent)).toThrow(/no top-level literal "X"/)
  })

  it('returns null without annotation', () => {
    expect(extractUnitDbData('local A = 1', getFileContent)).toBeNull()
  })

  it('rejects a second annotation line', () => {
    const script = `-- UnitDatabaseData: {"Damage": 1}\n-- UnitDatabaseData: {"Damage": 2}\n`
    expect(() => extractUnitDbData(script, getFileContent)).toThrow(/more than one/)
  })

  it('rejects invalid JSON', () => {
    const script = makeScript('', '{"Damage": 1,}')
    expect(() => extractUnitDbData(script, getFileContent)).toThrow(/invalid JSON/)
  })

  it('rejects unknown keys, including unknown *Ticks bases', () => {
    expect(() => extractUnitDbData(makeScript('', '{"Foo": 1}'), getFileContent)).toThrow(/unknown key "Foo"/)
    expect(() => extractUnitDbData(makeScript('', '{"FooTicks": 10}'), getFileContent)).toThrow(/unknown key "FooTicks"/)
  })

  it('rejects unresolvable placeholders', () => {
    expect(() => extractUnitDbData(makeScript('', '{"Damage": "${Nope}"}'), getFileContent)).toThrow(/no top-level literal "Nope"/)
  })

  it('rejects a name defined in two in-scope files', () => {
    const dup = Object.assign({}, files, { 'sboohwallibombeffect01': 'local PlumeCount = 9\n' })
    expect(() => extractUnitDbData(makeScript('', ahwassaAnnotation), id => dup[id])).toThrow(/"PlumeCount" defined in 2/)
  })

  it('rejects a missing file from "files"', () => {
    expect(() => extractUnitDbData(makeScript('', ahwassaAnnotation), () => null)).toThrow(/file not fetched/)
  })

  it('rejects non-word placeholder leftovers', () => {
    const script = makeScript('', '{"tooltip": "deals ${Plume Damage} here"}')
    expect(() => extractUnitDbData(script, getFileContent)).toThrow(/unresolved placeholder/)
  })
})
