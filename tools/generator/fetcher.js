const REPOS = [
  {
    name: 'fa',
    owner: 'FAForever',
    branch: 'deploy/faf',
    paths: ['units', 'lua/version.lua', 'lua/shield.lua', 'lua/system/blueprints-units.lua', 'lua/defaultcomponents.lua', 'lua/sim/Unit.lua'],
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
  ['blueprintsUnitsContent', 'blueprints-units.lua'],
  ['defaultComponentsContent', 'defaultcomponents.lua'],
  ['unitContent', 'unit.lua'],
]

export async function fetchDefaults() {
  const faRepo = REPOS.find(r => r.name === 'fa')

  const [versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent] = await Promise.all([
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/version.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/shield.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/system/blueprints-units.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/defaultcomponents.lua'),
    fetchFile(faRepo.owner, faRepo.name, faRepo.branch, 'lua/sim/Unit.lua'),
  ])

  return { versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent }
}

export async function fetchAllBlueprints() {
  const blueprints = []

  for (const repo of REPOS) {
    console.log(`Fetching from ${repo.owner}/${repo.name} (${repo.branch})...`)

    for (const repoPath of repo.paths) {
      if (repoPath.endsWith('.lua')) continue

      const files = await listFiles(repo.owner, repo.name, repo.branch, repoPath, '_unit.bp')
      console.log(`  ${files.length} blueprint files`)

      for (const file of files) {
        const content = await fetchFile(repo.owner, repo.name, repo.branch, file.path)
        const unitId = file.path.match(/([^/]+)_unit\.bp$/)[1]
        blueprints.push({ id: unitId, content, faction: repo.name })
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

async function listFiles(owner, repo, branch, dirPath, suffix) {
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

  return data.tree.filter(item =>
    item.type === 'blob' &&
    item.path.startsWith(dirPath) &&
    item.path.endsWith(suffix)
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
