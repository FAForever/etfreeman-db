import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchDefaults, fetchAllBlueprintsAndScripts, fetchAllProjectiles, fetchAllProjectileScripts } from './fetcher.js'
import { parseBlueprint, createConfig, parseProjectile, parseProjectileScript, extractOnKilledStunParams } from './parser.js'
import { filterUnits, distillUnit } from './Distillator.js'
import { createEnricher } from './BlueprintEnricher.js'
import { loadFromCache, loadProjectilesFromCache, loadProjectileScriptsFromCache } from './CacheManager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../../src/public/data')

const useCached = process.argv.includes('--cached')
const withFat = process.argv.includes('--withfat')

async function generate() {
  console.log('=== FAF Unit Data Generator ===\n')
  console.log(`Mode: ${useCached ? 'CACHED' : 'FETCH ON-THE-FLY'}`)

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  let blueprints, versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent

  if (useCached) {
    const cached = loadFromCache();
    ({ blueprints, versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent } = cached)
  } else {
    const defaults = await fetchDefaults();
    ({ versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent } = defaults);
    ({ blueprints } = await fetchAllBlueprintsAndScripts())
  }

  const { units } = filterUnits(blueprints, parseBlueprint)

  const config = createConfig({ versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent })
  console.log(`  ✓ Version: ${config.version}`)

  const fetchProjectiles = useCached ? loadProjectilesFromCache : fetchAllProjectiles
  const fetchProjectileScripts = useCached ? loadProjectileScriptsFromCache : fetchAllProjectileScripts
  const unitScriptByUnitId = new Map()
  for (const bp of blueprints) {
    if (bp.scriptContent) unitScriptByUnitId.set(bp.id, bp.scriptContent)
  }
  const enricher = await createEnricher(fetchProjectiles, parseProjectile, fetchProjectileScripts, parseProjectileScript, unitScriptByUnitId, extractOnKilledStunParams)

  console.log('\nDistilling units...')
  const slimUnits = units.map(distillUnit)

  console.log('\nEnriching units...')
  slimUnits.forEach(u => enricher.enrich(u))
  console.log(`${enricher.weaponsWithFragments} fragment weapons,\n${enricher.weaponsWithCost} cost weapons,\n${enricher.weaponsWithChildCount} child projectile weapons\n${enricher.weaponsWithAntiMissileFlare} anti-missile flare weapons\n${enricher.weaponsWithDeathStun} death-stun weapons`)

  console.log('\nGenerating output files...')
  if (withFat) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.fat.json'), JSON.stringify({ ...config, units }, null, 2))
    console.log('  ✓ index.fat.json')
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify({ ...config, units: slimUnits }))
  fs.writeFileSync(path.join(OUTPUT_DIR, 'version.json'), JSON.stringify(config, null, 2))
  console.log('  ✓ index.json')
  console.log('  ✓ version.json')

  console.log(`\n✓ Generated ${slimUnits.length} units`)
}

generate().catch(error => {
  console.error('\n✗ Error:', error?.message || error)
  process.exit(1)
})
