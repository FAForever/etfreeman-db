import fs from 'fs'
import path from 'path'
import { fetchDefaults, fetchAllBlueprints, fetchAllProjectiles, fetchAllProjectileScripts, DEFAULT_FILES } from './fetcher.js'
import { CACHE_DIR } from './CacheManager.js'

async function download() {
  console.log('=== Blueprint Downloader ===\n')
  fs.mkdirSync(CACHE_DIR, { recursive: true })

  console.log('Downloading defaults...\n')
  const defaults = await fetchDefaults()

  for (const [key, file] of DEFAULT_FILES) {
    if (!defaults[key]) throw new Error(`Failed to fetch ${file}`)
    fs.writeFileSync(path.join(CACHE_DIR, file), defaults[key])
  }

  console.log(`\n✓ Downloaded defaults: ${DEFAULT_FILES.map(([, f]) => f).join(', ')}`)

  console.log('\nDownloading blueprints...\n')
  const { blueprints } = await fetchAllBlueprints()

  console.log(`\nSaving ${blueprints.length} blueprints to ${CACHE_DIR}...`)
  for (const bp of blueprints) {
    fs.writeFileSync(path.join(CACHE_DIR, `${bp.id}_unit.bp`), bp.content)
  }

  console.log(`\n✓ Downloaded ${blueprints.length} blueprints`)

  console.log('\nDownloading projectiles...\n')
  const projectiles = await fetchAllProjectiles()

  console.log(`\nSaving ${projectiles.length} projectiles to ${CACHE_DIR}...`)
  for (const proj of projectiles) {
    fs.writeFileSync(path.join(CACHE_DIR, `${proj.id}_proj.bp`), proj.content)
  }

  console.log(`\n✓ Downloaded ${projectiles.length} projectiles`)

  console.log('\nDownloading projectile scripts...\n')
  const scripts = await fetchAllProjectileScripts()

  console.log(`\nSaving ${scripts.length} scripts to ${CACHE_DIR}...`)
  for (const script of scripts) {
    fs.writeFileSync(path.join(CACHE_DIR, `${script.id}_script.lua`), script.content)
  }

  console.log(`\n✓ Downloaded ${scripts.length} scripts`)
}

download().catch(error => {
  console.error('✗ Error:', error?.message || error)
  process.exit(1)
})
