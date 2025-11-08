import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllBlueprints } from './fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, 'cached_blueprints');

async function download() {
  console.log('=== Blueprint Downloader ===\n');
  console.log('Downloading blueprints to cache...\n');

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const { blueprints, versionContent } = await fetchAllBlueprints();

  console.log(`\nSaving ${blueprints.length} blueprints to ${CACHE_DIR}...`);

  for (const bp of blueprints) {
    const filePath = path.join(CACHE_DIR, `${bp.id}_unit.bp`);
    fs.writeFileSync(filePath, bp.content);
  }

  fs.writeFileSync(path.join(CACHE_DIR, 'version.lua'), versionContent);

  console.log(`\n✓ Downloaded ${blueprints.length} blueprints + version.lua`);
}

download().catch(error => {
  console.error('✗ Error:', error.message);
  process.exit(1);
});
