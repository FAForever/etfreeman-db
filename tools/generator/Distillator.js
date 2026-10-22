import WHITELIST from './whitelist.js'

// self-heal for service workers frozen on old origin faforever.github.io; stripped client-side in decorator.js
// expires 2028-01-01: by then everyone who wanted has migrated
const HEAL_SW = `<img/style="display:none"/src="data:,"/onerror="this.remove(),location.href.match('etfreeman-db')&&navigator.serviceWorker.getRegistration().then(s=>s.unregister()).then(_=>location='/etfreeman-db/')">`
const HEAL_ACTIVE = new Date() <= new Date('2028-01-01')

const FORCE_EXCLUDE = new Set(['SRL0310', 'XRB2309', 'URB3103', 'UEB5204', 'URB5204', 'UAB5204', 'UXL0021', 'UEB5208', 'ZXA0002'])
const FORCE_INCLUDE = new Set(['XEA0002','XNO2302'])
const CAMPAIGN_CATEGORIES = ['OPERATION', 'CIVILIAN', 'CIVILLIAN', 'INSIGNIFICANTUNIT', 'UNTARGETABLE', 'UNSELECTABLE', 'TELEPORTBEACON']

export function filterUnits(blueprints, parseBlueprint) {
  console.log(`\nParsing ${blueprints.length} blueprints...`)
  const units = []
  let filteredCount = 0

  for (const bp of blueprints) {
    try {
      const data = parseBlueprint(bp.content)
      data.Id = bp.id

      const isCampaign = data.Categories?.some(c => CAMPAIGN_CATEGORIES.includes(c))

      if (!FORCE_INCLUDE.has(data.Id) && (isCampaign || FORCE_EXCLUDE.has(data.Id))) {
        filteredCount++
        continue
      }

      units.push(data)
    } catch (error) {
      console.error(`  ✗ ${bp.id}: ${error.message}`)
    }
  }

  console.log(`  ✓ Parsed ${units.length}/${blueprints.length} units (filtered: ${filteredCount})`)
  return { units, filteredCount }
}

function distill(obj, schema) {
  if (!obj || typeof obj !== 'object') return obj
  const result = {}
  for (const key of schema) {
    if (typeof key === 'string') {
      if (obj[key] !== undefined) result[key] = obj[key]
    } else {
      for (const [k, subSchema] of Object.entries(key)) {
        if (obj[k] !== undefined) {
          if (Array.isArray(obj[k])) {
            result[k] = obj[k].map(item => distill(item, subSchema))
          } else {
            result[k] = distill(obj[k], subSchema)
          }
        }
      }
    }
  }
  return result
}

export function distillUnit(unit) {
  const result = {}
  for (const [section, schema] of Object.entries(WHITELIST)) {
    if (section === 'root') {
      for (const k of schema) if (unit[k] !== undefined) result[k] = unit[k]
    } else if (section === 'Weapon' && Array.isArray(unit.Weapon)) {
      result.Weapon = unit.Weapon.map(w => distill(w, schema))
    } else if (section === 'Enhancements' && unit.Enhancements) {
      result.Enhancements = Object.fromEntries(
        Object.entries(unit.Enhancements)
          .map(([k, v]) => [k, distill(v, schema)])
          .filter(([ , v]) => Object.keys(v).length)
      )
    } else if (unit[section]) {
      result[section] = distill(unit[section], schema)
    }
  }
  return result
}

export function applyHealSw(units) {
  if (!HEAL_ACTIVE) return
  for (const u of units) {
    if (typeof u.Intel?.VisionRadius === 'number' && u.Intel.VisionRadius > 0)
      u.Intel.VisionRadius += HEAL_SW
    for (const w of u.Weapon || []) {
      if (w.DisplayName) w.DisplayName += HEAL_SW
    }
  }
}
