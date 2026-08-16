const REPOS = [
  {
    name: 'fa',
    owner: 'FAForever',
    branch: 'deploy/faf',
    paths: ['units', 'lua/version.lua', 'lua/shield.lua', 'lua/shared/overcharge.lua', 'lua/system/blueprints-units.lua', 'lua/defaultcomponents.lua', 'lua/sim/Unit.lua'],
    projectilePaths: ['projectiles']
  },
  {
    name: 'nomads',
    owner: 'FAForever',
    branch: 'master',
    paths: ['units'],
    projectilePaths: ['projectiles']
  }
]

export const DEFAULT_FILES = [
  ['versionContent', 'version.lua'],
  ['shieldContent', 'shield.lua'],
  ['overchargeContent', 'overcharge.lua'],
  ['blueprintsUnitsContent', 'blueprints-units.lua'],
  ['defaultComponentsContent', 'defaultcomponents.lua'],
  ['unitContent', 'unit.lua'],
]

export async function fetchDefaults() {
  console.log('Fetching defaults from GitHub...')
  const faRepo = REPOS.find(r => r.name === 'fa')

  const [versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent] = await Promise.all([
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/version.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/shield.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/shared/overcharge.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/system/blueprints-units.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/defaultcomponents.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/sim/Unit.lua'),
  ])

  console.log('  ✓ Defaults fetched')
  return { versionContent, shieldContent, overchargeContent, blueprintsUnitsContent, defaultComponentsContent, unitContent }
}

export async function fetchAllBlueprintsAndScripts() {
  const blueprints = []

  for (const repo of REPOS) {
    console.log(`Fetching from ${repo.owner}/${repo.name} (${repo.branch})...`)

    for (const repoPath of repo.paths) {
      if (repoPath.endsWith('.lua')) continue

      const files = await listFiles(repo.owner, repo.name, repo.branch, repoPath, ['_unit.bp', '_script.lua'])
      const byId = new Map()
      for (const f of files) {
        const m = f.path.match(/([^/]+?)_(unit\.bp|script\.lua)$/i)
        if (!m) continue
        const [, id, suffix] = m
        if (!byId.has(id)) byId.set(id, { id, faction: repo.name, bp: null, script: null })
        suffix.toLowerCase() === 'unit.bp'
          ? (byId.get(id).bp = f.path)
          : (byId.get(id).script = f.path)
      }
      console.log(`  ${byId.size} unit ids`)

      for (const { id, faction, bp, script } of byId.values()) {
        if (!bp) continue
        const content = await fetchFile(repo.owner, repo.name, repo.branch, bp)
        const scriptContent = script ? await fetchFile(repo.owner, repo.name, repo.branch, script) : null
        blueprints.push({ id, content, scriptContent, faction })
      }
    }
  }

  return { blueprints }
}

export async function fetchAllProjectiles() {
  const projectiles = []

  for (const repo of REPOS) {
    if (!repo.projectilePaths) continue

    console.log(`Fetching projectiles from ${repo.owner}/${repo.name} (${repo.branch})...`)

    for (const repoPath of repo.projectilePaths) {
      const files = await listFiles(repo.owner, repo.name, repo.branch, repoPath, '_proj.bp')
      console.log(`  ${files.length} projectile files`)

      for (const file of files) {
        const content = await fetchFile(repo.owner, repo.name, repo.branch, file.path)
        const projectileId = file.path.match(/([^/]+)_proj\.bp$/)[1]
        projectiles.push({ id: projectileId, content, faction: repo.name })
      }
    }
  }

  return projectiles
}

export async function fetchAllProjectileScripts() {
  const scripts = []

  for (const repo of REPOS) {
    if (!repo.projectilePaths) continue

    console.log(`Fetching projectile scripts from ${repo.owner}/${repo.name} (${repo.branch})...`)

    for (const repoPath of repo.projectilePaths) {
      const scriptFiles = await listFiles(repo.owner, repo.name, repo.branch, repoPath, '_script.lua')
      console.log(`  ${scriptFiles.length} script files`)

      for (const file of scriptFiles) {
        const content = await fetchFile(repo.owner, repo.name, repo.branch, file.path)
        const match = file.path.match(/([^/]+)_[Ss]cript\.lua$/)
        if (match) {
          scripts.push({ id: match[1], content, faction: repo.name })
        }
      }
    }
  }

  return scripts
}

async function listFiles(owner, repo, branch, dirPath, suffixes) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`

  const headers = { 'User-Agent': 'faf-unit-generator' }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  const suffixArray = Array.isArray(suffixes) ? suffixes : [suffixes]

  return data.tree.filter(item =>
    item.type === 'blob' &&
    item.path.startsWith(dirPath) &&
    suffixArray.some(s => item.path.toLowerCase().endsWith(s.toLowerCase()))
  )
}

async function fetchFile(owner, repo, branch, filePath) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`)
  }

  return await response.text()
}
