import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllBlueprints, fetchAllProjectiles } from './fetcher.js';
import { parseBlueprint, parseVersion, parseProjectile } from './parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../../src/public/data');
const GENERATOR_DATA_DIR = path.join(__dirname, 'data');
const CACHE_DIR = path.join(__dirname, 'cached_blueprints');

const ESSENTIAL_PROPS = [
  'Description', 'Categories', 'General', 'Economy', 'Defense', 'Intel',
  'Weapon', 'Wreckage', 'Veteran', 'Display', 'StrategicIconName',
  'Physics', 'Air', 'Enhancements'
];

function deriveClassification(categories) {
  if (!categories) return null;

  if (categories.includes('MOBILE')) {
    if (categories.includes('ENGINEER')) return 'RULEUC_Engineer';
    if (categories.includes('COMMAND')) return 'RULEUC_Commander';
    if (categories.includes('LAND')) return 'RULEUC_MilitaryVehicle';
    if (categories.includes('NAVAL')) return 'RULEUC_MilitaryShip';
    if (categories.includes('SUB')) return 'RULEUC_MilitarySub';
    if (categories.includes('AIR')) return 'RULEUC_MilitaryAircraft';
    if (categories.includes('COUNTERINTELLIGENCE')) return 'RULEUC_CounterMeasure';
  }

  if (categories.includes('STRUCTURE')) {
    if (categories.includes('ENGINEER')) return 'RULEUC_Engineer';
    if (categories.includes('FACTORY')) return 'RULEUC_Factory';
    if (categories.includes('DIRECTFIRE')) return 'RULEUC_MilitaryStructure';
    if (categories.includes('ANTIAIR')) return 'RULEUC_MilitaryStructure';
    if (categories.includes('INDIRECTFIRE')) return 'RULEUC_MilitaryStructure';
    if (categories.includes('ANTIMISSILE')) return 'RULEUC_MilitaryStructure';
    if (categories.includes('COUNTERINTELLIGENCE')) return 'RULEUC_CounterMeasure';
    if (categories.includes('SHIELD')) return 'RULEUC_MiscSupport';
    if (categories.includes('RADAR')) return 'RULEUC_Sensor';
    if (categories.includes('OMNI')) return 'RULEUC_Sensor';
    if (categories.includes('SONAR')) return 'RULEUC_Sensor';
    return 'RULEUC_Resource';
  }

  return null;
}

const useCached = process.argv.includes('--cached');
const withFat = process.argv.includes('--withfat');

async function generate() {
  console.log('=== FAF Unit Data Generator ===\n');
  console.log(`Mode: ${useCached ? 'CACHED' : 'FETCH ON-THE-FLY'}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let blueprints, versionContent;

  if (useCached) {
    console.log('Loading blueprints from cache...');
    ({ blueprints, versionContent } = loadFromCache());
  } else {
    console.log('Fetching blueprints from GitHub...\n');
    ({ blueprints, versionContent } = await fetchAllBlueprints());
  }

  console.log(`\nParsing ${blueprints.length} blueprints...`);
  const units = [];
  const exceptions = new Set(['SRL0310', 'XRB2309', 'URB3103', 'UEB5204', 'URB5204', 'UAB5204','UXL0021','UEB5208'])
  const force_include = new Set(['XEA0002'])
  
  for (const bp of blueprints) {
    try {
      const data = parseBlueprint(bp.content);
      data.Id = bp.id;

      const isCampaign = data.Categories?.some(c =>
        ['OPERATION', 'CIVILIAN', 'CIVILLIAN', 'INSIGNIFICANTUNIT', 'UNTARGETABLE', 'UNSELECTABLE','TELEPORTBEACON'].includes(c)
      );


      if (!force_include.has(data.Id) && (isCampaign || exceptions.has(data.Id))) {
        continue;
      }

      if (!data.General) data.General = {};
      if (!data.General.Classification) {
        data.General.Classification = deriveClassification(data.Categories);
      }
      units.push(data);

    } catch (error) {
      console.error(`  ✗ ${bp.id}: ${error.message}`);
    }
  }

  console.log(`  ✓ Parsed ${units.length}/${blueprints.length} units`);

  console.log('\nExtracting version...');
  const version = parseVersion(versionContent);
  console.log(`  ✓ Version: ${version}`);

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

  // Embed projectile fragment data into weapon objects
  console.log('\nEmbedding projectile data into weapons...');
  let weaponsEnhanced = 0;

  for (const unit of units) {
    if (!unit.Weapon || !Array.isArray(unit.Weapon)) continue;

    for (const weapon of unit.Weapon) {
      if (!weapon.ProjectileId) continue;

      // Extract projectile ID from path: "/projectiles/Foo/Foo_proj.bp" -> "foo"
      const match = weapon.ProjectileId.match(/([^/]+)_proj\.bp$/i);
      if (!match) continue;

      const projId = match[1].toLowerCase();
      if (projectiles[projId]) {
        weapon.ProjectileFragments = projectiles[projId].fragments;
        weapon.ProjectileFragmentId = projectiles[projId].fragmentId;
        weaponsEnhanced++;
      }
    }
  }

  console.log(`  ✓ Enhanced ${weaponsEnhanced} weapons with projectile fragment data`);

  console.log('\nGenerating output files...');

  if (withFat) {
    const fatData = { version, units };
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'index.fat.json'),
      JSON.stringify(fatData, null, 2)
    );
    console.log(`  ✓ index.fat.json`);
  }

  const slimUnits = units.map(u => filterProps(u, ESSENTIAL_PROPS));
  const slimData = { version, units: slimUnits };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'index.json'),
    JSON.stringify(slimData)
  );
  console.log(`  ✓ index.json (minified)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'version.json'),
    JSON.stringify({ version }, null, 2)
  );
  console.log(`  ✓ version.json`);

  // Write projectiles.json to generator data directory for import by dps2.js
  fs.mkdirSync(GENERATOR_DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(GENERATOR_DATA_DIR, 'projectiles.json'),
    JSON.stringify(projectiles)
  );
  console.log(`  ✓ projectiles.json (for DPS calculations)`);

  console.log(`\n✓ Generated ${units.length} units with ${weaponsEnhanced} weapons enhanced by ${parsedCount} projectile fragments`);
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

  console.log(`  ✓ Loaded ${blueprints.length} blueprints from cache`);

  return { blueprints, versionContent };
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

function filterProps(obj, props) {
  const filtered = {};
  for (const prop of props) {
    if (obj.hasOwnProperty(prop)) {
      if (prop === 'Weapon' && Array.isArray(obj[prop])) {
        filtered[prop] = obj[prop].map(cleanWeapon);
      } else {
        filtered[prop] = obj[prop];
      }
    }
  }
  if (obj.Id) filtered.Id = obj.Id;
  return filtered;
}

function cleanWeapon(weapon) {
  const { Audio, Effects, WeaponUnpackAnimation, WeaponUnpacks, WeaponRepackTimeout, ...rest } = weapon;
  return rest;
}

generate().catch(error => {
  console.error('\n✗ Error:', error.message);
  process.exit(1);
});
