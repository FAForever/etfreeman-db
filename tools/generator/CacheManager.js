import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const CACHE_DIR = path.join(__dirname, 'cached_blueprints')

export function loadFromCache() {
  console.log('\nLoading from cache...')
  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Cache not found at ${CACHE_DIR}. Run downloader.js first.`)
  }

  const files = fs.readdirSync(CACHE_DIR)
  const blueprintFiles = files.filter(f => f.endsWith('_unit.bp'))

  const blueprints = blueprintFiles.map(file => {
    const id = file.replace('_unit.bp', '')
    const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8')
    const scriptPath = path.join(CACHE_DIR, `${id}_script.lua`)
    const scriptContent = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : null
    return { id, content, scriptContent }
  })

  const versionContent = fs.readFileSync(path.join(CACHE_DIR, 'version.lua'), 'utf8')
  const shieldContent = fs.readFileSync(path.join(CACHE_DIR, 'shield.lua'), 'utf8')
  const overchargeContent = fs.readFileSync(path.join(CACHE_DIR, 'overcharge.lua'), 'utf8')
  const blueprintsUnitsContent = fs.readFileSync(path.join(CACHE_DIR, 'blueprints-units.lua'), 'utf8')
  const defaultComponentsContent = fs.readFileSync(path.join(CACHE_DIR, 'defaultcomponents.lua'), 'utf8')
  const unitContent = fs.readFileSync(path.join(CACHE_DIR, 'unit.lua'), 'utf8')

  const withScripts = blueprints.filter(b => b.scriptContent).length
  console.log(`  ✓ Loaded ${blueprints.length} blueprints from cache (${withScripts} with scripts)`)

  return { blueprints, versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent }
}

export function loadProjectilesFromCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Cache not found at ${CACHE_DIR}. Run downloader.js first.`)
  }

  const files = fs.readdirSync(CACHE_DIR)
  const projectileFiles = files.filter(f => f.endsWith('_proj.bp'))

  const projectiles = projectileFiles.map(file => {
    const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8')
    const id = file.replace('_proj.bp', '')
    return { id, content }
  })

  return projectiles
}

export function loadProjectileScriptsFromCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    throw new Error(`Cache not found at ${CACHE_DIR}. Run downloader.js first.`)
  }

  const files = fs.readdirSync(CACHE_DIR)
  const scriptFiles = files.filter(f => f.endsWith('_script.lua') || f.endsWith('_Script.lua'))

  const scripts = scriptFiles.map(file => {
    const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf8')
    const match = file.match(/([^/]+)_[Ss]cript\.lua$/)
    const id = match ? match[1] : file.replace(/_[Ss]cript\.lua$/, '')
    return { id, content }
  })

  return scripts
}
