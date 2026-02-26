import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Weapons to extract from unit data
const weaponsToExtract = [
  { unitId: 'URL0107', weaponName: 'Light Pulse Laser' },
  { unitId: 'UAS0201', weaponName: 'Oblivion Cannon' },
  { unitId: 'XSS0201', weaponName: 'Front Ultrachromatic Beam Generator' },
  { unitId: 'XSS0201', weaponName: 'Rear Ultrachromatic Beam Generator' },
  { unitId: 'UES0201', weaponName: 'Gauss Cannon' },
  { unitId: 'XES0102', weaponName: 'Angler Torpedo' },
  { unitId: 'XAS0204', weaponName: 'Chrono Torpedo' },
  { unitId: 'UEL0103', weaponName: 'Fragmentation Artillery' },
  { unitId: 'XSL0103', weaponName: 'Thuntho Artillery Cannon' },
  { unitId: 'XRA0305', weaponName: 'Disintegrator Pulse Laser' },
  { unitId: 'URA0103', weaponName: 'Neutron Cluster Bomb' },
  { unitId: 'UAA0103', weaponName: 'Graviton Bomb' },
  { unitId: 'XSA0103', weaponName: 'Othe Tactical Bomb' },
  { unitId: 'DRLK001', weaponName: 'Nanodart Launcher' },
  { unitId: 'DSLK004', weaponName: 'Lightning Projector' },
  { unitId: 'XSB2205', weaponName: 'Heavy Cavitation Torpedo Cluster' },
  { unitId: 'XAA0306', weaponName: 'Torpedo Cluster' },
  { unitId: 'UAL0304', weaponName: 'Sonance Artillery' },
  { unitId: 'DEA0202', weaponName: 'Napalm Carpet Bomb' },
  { unitId: 'UEA0103', weaponName: 'Napalm Carpet Bomb' },
]

const dataPath = resolve('./src/public/data/index.json')
const outputPath = resolve('./tools/weaponOutput.json')

const data = JSON.parse(readFileSync(dataPath, 'utf-8'))

const extracted = weaponsToExtract.map(({ unitId, weaponName }) => {
  const unit = data.units.find(u => u.Id === unitId)
  if (!unit) {
    console.warn(`Unit ${unitId} not found`)
    return { unitId, weaponName, error: 'Unit not found' }
  }

  const weapon = unit.Weapon?.find(w => w.DisplayName === weaponName)
  if (!weapon) {
    console.warn(`Weapon "${weaponName}" not found in unit ${unitId}`)
    return { unitId, weaponName, error: 'Weapon not found' }
  }

  return {
    unitId,
    weaponName,
    weapon
  }
})

writeFileSync(outputPath, JSON.stringify(extracted, null, 2))
console.log(`Extracted ${extracted.length} weapons to ${outputPath}`)
