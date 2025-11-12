const REPOS = [
  {
    name: 'fa',
    owner: 'FAForever',
    branch: 'deploy/fafdevelop',
    paths: ['units', 'lua/version.lua'],
    projectilePaths: ['projectiles']
  },
  {
    name: 'nomads',
    owner: 'FAForever',
    branch: 'master',
    paths: ['units'],
    projectilePaths: ['projectiles']
  }
];

export async function fetchAllBlueprints() {
  const blueprints = [];
  let versionContent = null;

  for (const repo of REPOS) {
    console.log(`Fetching from ${repo.owner}/${repo.name} (${repo.branch})...`);

    for (const repoPath of repo.paths) {
      if (repoPath.endsWith('.lua')) {
        versionContent = await fetchFile(repo.owner, repo.name, repo.branch, repoPath);
      } else {
        const files = await listBlueprintFiles(repo.owner, repo.name, repo.branch, repoPath);
        console.log(`  ${files.length} blueprint files`);

        for (const file of files) {
          const content = await fetchFile(repo.owner, repo.name, repo.branch, file.path);
          const unitId = file.path.match(/([^/]+)_unit\.bp$/)[1];
          blueprints.push({ id: unitId, content, faction: repo.name });
        }
      }
    }
  }

  return { blueprints, versionContent };
}

export async function fetchAllProjectiles() {
  const projectiles = [];

  for (const repo of REPOS) {
    if (!repo.projectilePaths) continue;

    console.log(`Fetching projectiles from ${repo.owner}/${repo.name} (${repo.branch})...`);

    for (const repoPath of repo.projectilePaths) {
      const files = await listProjectileFiles(repo.owner, repo.name, repo.branch, repoPath);
      console.log(`  ${files.length} projectile files`);

      for (const file of files) {
        const content = await fetchFile(repo.owner, repo.name, repo.branch, file.path);
        const projectileId = file.path.match(/([^/]+)_proj\.bp$/)[1];
        projectiles.push({ id: projectileId, content, faction: repo.name });
      }
    }
  }

  return projectiles;
}

async function listBlueprintFiles(owner, repo, branch, dirPath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const headers = { 'User-Agent': 'faf-unit-generator' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  return data.tree.filter(item =>
    item.type === 'blob' &&
    item.path.startsWith(dirPath) &&
    item.path.endsWith('_unit.bp')
  );
}

async function listProjectileFiles(owner, repo, branch, dirPath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const headers = { 'User-Agent': 'faf-unit-generator' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  return data.tree.filter(item =>
    item.type === 'blob' &&
    item.path.startsWith(dirPath) &&
    item.path.endsWith('_proj.bp')
  );
}

async function fetchFile(owner, repo, branch, filePath) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  return await response.text();
}
