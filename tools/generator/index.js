import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchDefaults, fetchAllBlueprints, fetchAllProjectiles, DEFAULT_FILES } from './fetcher.js';
import { parseBlueprint, parseVersion, parseProjectile, parseShield, parseVeterancyConstants, parseWreckageConstants } from './parser.js';
import WHITELIST from './whitelist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../../src/public/data');
const CACHE_DIR = path.join(__dirname, 'cached_blueprints');

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

function distillUnit(unit) {
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
          .filter(([_, v]) => Object.keys(v).length)
      )
    } else if (unit[section]) {
      result[section] = distill(unit[section], schema)
    }
  }
  return result
}

const useCached = process.argv.includes('--cached');
const withFat = process.argv.includes('--withfat');

async function generate() {
  console.log('=== FAF Unit Data Generator ===\n');
  console.log(`Mode: ${useCached ? 'CACHED' : 'FETCH ON-THE-FLY'}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let blueprints, versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent;

  if (useCached) {
    console.log('Loading from cache...');
    const loaded = loadFromCache();
    ({ blueprints, versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent } = loaded);
  } else {
    console.log('Fetching from GitHub...\n');
    const defaults = await fetchDefaults();
    ({ versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent } = defaults);
    ({ blueprints } = await fetchAllBlueprints());
  }

  for (const [key, file] of DEFAULT_FILES) {
    if (!eval(key)) throw new Error(`Failed to fetch ${file}`)
  }

  console.log(`\nParsing ${blueprints.length} blueprints...`);
  const units = [];
  const exceptions = new Set(['SRL0310', 'XRB2309', 'URB3103', 'UEB5204', 'URB5204', 'UAB5204','UXL0021','UEB5208'])
  const force_include = new Set(['XEA0002'])
  let filteredCount = 0;

  for (const bp of blueprints) {
    try {
      const data = parseBlueprint(bp.content);
      data.Id = bp.id;

      const isCampaign = data.Categories?.some(c =>
        ['OPERATION', 'CIVILIAN', 'CIVILLIAN', 'INSIGNIFICANTUNIT', 'UNTARGETABLE', 'UNSELECTABLE','TELEPORTBEACON'].includes(c)
      );


      if (!force_include.has(data.Id) && (isCampaign || exceptions.has(data.Id))) {
        filteredCount++;
        continue;
      }

      // This is a crutch from faforever/fa repo, should be fixed at some point and removed from here
      if (data.Categories && data.Categories.includes('NAVAL') && !data.Wreckage) {
        data.Wreckage = {
          Blueprint: '/props/DefaultWreckage/DefaultWreckage_prop.bp',
          EnergyMult: 0,
          HealthMult: 0.9,
          MassMult: 0.9,
          ReclaimTimeMultiplier: 1,
          WreckageLayers: {
            Air: false,
            Land: false,
            Seabed: true,
            Sub: true,
            Water: true,
          },
        };
      }

      units.push(data);

    } catch (error) {
      console.error(`  ✗ ${bp.id}: ${error.message}`);
    }
  }

  console.log(`  ✓ Parsed ${units.length}/${blueprints.length} units (filtered: ${filteredCount})`);

  console.log('\nExtracting version...');
  const version = parseVersion(versionContent);
  console.log(`  ✓ Version: ${version}`);

  console.log('\nExtracting shield defaults...');
  const shieldDefaults = parseShield(shieldContent);
  console.log(`  ✓ Shield default overspill: ${shieldDefaults.overspill}`);
  console.log(`  ✓ Shield default recharge time: ${shieldDefaults.rechargeTime}`);

  console.log('\nExtracting veterancy constants...');
  const vetConstants = parseVeterancyConstants(blueprintsUnitsContent, defaultComponentsContent);
  console.log(`  ✓ TechToVetMultipliers: ${JSON.stringify(vetConstants.techToVetMultipliers)}`);
  console.log(`  ✓ VeterancyRegenBuffs: ${JSON.stringify(vetConstants.veterancyRegenBuffs)}`);

  console.log('\nExtracting wreckage constants...');
  const wreckageConstants = parseWreckageConstants(unitContent);
  console.log(`  ✓ WreckageTechMassMults: ${JSON.stringify(wreckageConstants.techMassMults)}`);
  console.log(`  ✓ WreckageWaterMult: ${wreckageConstants.waterMult}`);

  const config = {
    version,
    shieldDefaultOverspill: shieldDefaults.overspill,
    shieldDefaultRechargeTime: shieldDefaults.rechargeTime,
    techToVetMultipliers: vetConstants.techToVetMultipliers,
    veterancyRegenBuffs: vetConstants.veterancyRegenBuffs,
    wreckageTechMassMults: wreckageConstants.techMassMults,
    wreckageWaterMult: wreckageConstants.waterMult,
  };

  // Process projectiles
  console.log('\nProcessing projectiles...');
  let projectilesRaw;

  if (useCached) {
    projectilesRaw = loadProjectilesFromCache();
  } else {
    projectilesRaw = await fetchAllProjectiles();
  }

  console.log(`Parsing ${projectilesRaw.length} projectiles...`);
  const projectiles = {};
  let parsedCount = 0;

  for (const proj of projectilesRaw) {
    try {
      const data = parseProjectile(proj.content);
      if (data) {
        projectiles[proj.id.toLowerCase()] = data;
        parsedCount++;
      }
    } catch (error) {
      console.error(error)
    }
  }

  console.log(`  ✓ Parsed ${parsedCount}/${projectilesRaw.length} projectiles with fragment data`);

  // Distill units to only whitelisted properties
  console.log('\nDistilling units to whitelisted properties...')
  const slimUnits = units.map(distillUnit)
  console.log(`  ✓ Distilled ${slimUnits.length} units`)

  // Calculate total fragment multiplier including nested fragments
  function getTotalFragmentMultiplier(fragmentId) {
    let multiplier = 1;
    let currentId = fragmentId;

    while (currentId) {
      const fragment = projectiles[currentId.toLowerCase()];
      if (!fragment || !fragment.fragments) break;

      multiplier *= fragment.fragments;
      currentId = fragment.fragmentId;
    }

    return multiplier;
  }

  // Embed projectile data into distilled weapon objects
  console.log('\nEmbedding projectile data into weapons...')
  let weaponsWithFragments = 0
  let weaponsWithCost = 0

  for (const unit of slimUnits) {
    if (!unit.Weapon || !Array.isArray(unit.Weapon)) continue

    for (const weapon of unit.Weapon) {
      if (!weapon.ProjectileId) continue

      const match = weapon.ProjectileId.match(/([^/]+)_proj\.bp$/i)
      if (!match) continue

      const projId = match[1].toLowerCase()
      const proj = projectiles[projId]
      if (!proj) continue

      // Fragment multiplier (for DPS calculations)
      if (proj.fragments) {
        const nestedMultiplier = proj.fragmentId
          ? getTotalFragmentMultiplier(proj.fragmentId)
          : 1
        weapon.ProjectileFragmentMultiplier = proj.fragments * nestedMultiplier
        weaponsWithFragments++
      }

      // Projectile data (if has Health or cost)
      const hasCost = proj.BuildCostMass > 0 || proj.BuildCostEnergy > 0 || proj.BuildTime > 0
      if (proj.Health > 0 || hasCost) {
        weapon.Projectile = {
          Description: proj.Description || weapon.DisplayName.replace('Launcher', ''),
          Health: proj.Health,
          BuildCostEnergy: proj.BuildCostEnergy,
          BuildCostMass: proj.BuildCostMass,
          BuildTime: proj.BuildTime
        }
        weapon.Projectile.Description = weapon.Projectile.Description.replace('AEON','Aeon').replace('CYBRAN','Cybran')
        if (hasCost) weaponsWithCost++
      }
    }
  }

  console.log(`  ✓ ${weaponsWithFragments} weapons with fragment multiplier`)
  console.log(`  ✓ ${weaponsWithCost} weapons with projectile cost data`)

  console.log('\nGenerating output files...');

  if (withFat) {
    const fatData = { ...config, units };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'index.fat.json'),
      JSON.stringify(fatData, null, 2)
    );
    console.log(`  ✓ index.fat.json`);
  }

  const slimData = { ...config, units: slimUnits };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(slimData)
  );
  console.log(`  ✓ index.json (minified)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'version.json'),
    JSON.stringify(config, null, 2)
  );
  console.log(`  ✓ version.json`);

  console.log(`\n✓ Generated ${slimUnits.length} units (${weaponsWithFragments} fragment weapons, ${weaponsWithCost} cost weapons)`)
}

function loadFromCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Cache not found at ${CACHE_DIR}. Run downloader.js first.`);
  }

  const files = fs.readdirSync(CACHE_DIR);
  const blueprintFiles = files.filter(f => f.endsWith('_unit.bp'));

  const blueprints = blueprintFiles.map(file => {
    const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8');
    const id = file.replace('_unit.bp', '');
    return { id, content };
  });

  const versionContent = fs.readFileSync(path.join(CACHE_DIR, 'version.lua'), 'utf8');
  const shieldContent = fs.readFileSync(path.join(CACHE_DIR, 'shield.lua'), 'utf8');
  const blueprintsUnitsContent = fs.readFileSync(path.join(CACHE_DIR, 'blueprints-units.lua'), 'utf8');
  const defaultComponentsContent = fs.readFileSync(path.join(CACHE_DIR, 'defaultcomponents.lua'), 'utf8');
  const unitContent = fs.readFileSync(path.join(CACHE_DIR, 'unit.lua'), 'utf8');

  console.log(`  ✓ Loaded ${blueprints.length} blueprints from cache`);

  return { blueprints, versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent };
}

function loadProjectilesFromCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Cache not found at ${CACHE_DIR}. Run downloader.js first.`);
  }

  const files = fs.readdirSync(CACHE_DIR);
  const projectileFiles = files.filter(f => f.endsWith('_proj.bp'));

  const projectiles = projectileFiles.map(file => {
    const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8');
    const id = file.replace('_proj.bp', '');
    return { id, content };
  });

  console.log(`  ✓ Loaded ${projectiles.length} projectiles from cache`);

  return projectiles;
}

generate().catch(error => {
  console.error('\n✗ Error:', error?.message || error);
  process.exit(1);
});
