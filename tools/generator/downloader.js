import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchDefaults, fetchAllBlueprints, fetchAllProjectiles } from './fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, 'cached_blueprints');

const DEFAULT_FILES = [
  ['versionContent', 'version.lua'],
  ['shieldContent', 'shield.lua'],
  ['blueprintsUnitsContent', 'blueprints-units.lua'],
  ['defaultComponentsContent', 'defaultcomponents.lua'],
  ['unitContent', 'unit.lua'],
]

async function download() {
  console.log('=== Blueprint Downloader ===\n');
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  // Download defaults first
  console.log('Downloading defaults...\n');
  const defaults = await fetchDefaults();

  for (const [key, file] of DEFAULT_FILES) {
    if (!defaults[key]) throw new Error(`Failed to fetch ${file}`)
    fs.writeFileSync(path.join(CACHE_DIR, file), defaults[key]);
  }

  console.log(`\n✓ Downloaded defaults: ${DEFAULT_FILES.map(([, f]) => f).join(', ')}`);

  // Download blueprints
  console.log('\nDownloading blueprints...\n');
  const { blueprints } = await fetchAllBlueprints();

  console.log(`\nSaving ${blueprints.length} blueprints to ${CACHE_DIR}...`);
  for (const bp of blueprints) {
    const filePath = path.join(CACHE_DIR, `${bp.id}_unit.bp`);
    fs.writeFileSync(filePath, bp.content);
  }

  console.log(`\n✓ Downloaded ${blueprints.length} blueprints`);

  // Download projectiles
  console.log('\nDownloading projectiles...\n');
  const projectiles = await fetchAllProjectiles();

  console.log(`\nSaving ${projectiles.length} projectiles to ${CACHE_DIR}...`);
  for (const proj of projectiles) {
    const filePath = path.join(CACHE_DIR, `${proj.id}_proj.bp`);
    fs.writeFileSync(filePath, proj.content);
  }

  console.log(`\n✓ Downloaded ${projectiles.length} projectiles`);
}

download().catch(error => {
  console.error('✗ Error:', error.message);
  process.exit(1);
});
