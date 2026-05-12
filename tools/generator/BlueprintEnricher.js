const DEFAULT_NAVAL_WRECKAGE = { MassMult: 0.9, HealthMult: 0.9 }

function buildProjectileIndex(projectilesRaw, parseProjectile) {
  const projectiles = {}
  for (const proj of projectilesRaw) {
    try {
      const data = parseProjectile(proj.content)
      if (data) projectiles[proj.id.toLowerCase()] = data
    } catch (error) {
      console.error(error)
    }
  }
  return projectiles
}

function buildScriptIndex(scriptsRaw, parseProjectileScript) {
  const scripts = {}
  for (const script of scriptsRaw) {
    try {
      const data = parseProjectileScript(script.content)
      if (data) scripts[script.id.toLowerCase()] = data
    } catch (error) {
      console.error(error)
    }
  }
  return scripts
}

function getTotalFragmentMultiplier(fragmentId, projectiles) {
  let multiplier = 1
  let currentId = fragmentId

  while (currentId) {
    const fragment = projectiles[currentId.toLowerCase()]
    if (!fragment || !fragment.fragments) break

    multiplier *= fragment.fragments
    currentId = fragment.fragmentId
  }

  return multiplier
}

export async function createEnricher(fetchProjectiles, parseProjectile, fetchProjectileScripts, parseProjectileScript) {
  console.log('\nLoading projectiles...')
  const projectilesRaw = await fetchProjectiles()
  const projectiles = buildProjectileIndex(projectilesRaw, parseProjectile)
  console.log(`  ✓ Loaded ${Object.keys(projectiles).length} projectiles`)

  console.log('\nLoading projectile scripts...')
  const scriptsRaw = await fetchProjectileScripts()
  const scripts = buildScriptIndex(scriptsRaw, parseProjectileScript)
  console.log(`  ✓ Loaded ${Object.keys(scripts).length} scripts`)

  return {
    projectiles,
    scripts,
    count: Object.keys(projectiles).length,
    weaponsWithFragments: 0,
    weaponsWithCost: 0,
    weaponsWithChildCount: 0,
    weaponsWithAntiMissileFlare: 0,

    enrich(unit) {
      // this how it works in faforever/fa repo, have to do it here until they fix the code
      if (unit.Categories?.includes('NAVAL') && !unit.Wreckage) {
        unit.Wreckage = DEFAULT_NAVAL_WRECKAGE
      }

      if (!unit.Weapon || !Array.isArray(unit.Weapon)) return

      for (const weapon of unit.Weapon) {
        if (!weapon.ProjectileId) continue

        const match = weapon.ProjectileId.match(/([^/]+)_proj\.bp$/i)
        if (!match) continue

        const projId = match[1].toLowerCase()
        const proj = projectiles[projId]
        if (!proj) continue

        if (proj.fragments) {
          const nestedMultiplier = proj.fragmentId
            ? getTotalFragmentMultiplier(proj.fragmentId, projectiles)
            : 1
          weapon.__fragmentCount = proj.fragments * nestedMultiplier
          this.weaponsWithFragments++
        }

        const hasCost = proj.BuildCostMass > 0 || proj.BuildCostEnergy > 0 || proj.BuildTime > 0
        if (proj.Health > 0 || hasCost) {
          weapon.Projectile = {
            Description: proj.Description || weapon.DisplayName?.replace('Launcher', ''),
            Health: proj.Health,
            BuildCostEnergy: proj.BuildCostEnergy,
            BuildCostMass: proj.BuildCostMass,
            BuildTime: proj.BuildTime,
          }
          if (weapon.Projectile.Description) {
            weapon.Projectile.Description = weapon.Projectile.Description
              .replace('AEON', 'Aeon')
              .replace('CYBRAN', 'Cybran')
          }
          if (hasCost) this.weaponsWithCost++
        }

        const script = scripts[projId]
        if (script?.childCount) {
          weapon.childCount = script.childCount
          if (script.splitType) {
            weapon.childSplitType = script.splitType
          }
          this.weaponsWithChildCount++
        }

        if (script?.isAntiMissileFlare) {
          weapon.isAntiMissileFlare = { deflectLimit: 3, deflectRadius: 23  } // The values are hardcoded in if statement, in fa repo, requires PR to fix
          this.weaponsWithAntiMissileFlare++
        }

        if (weapon.WeaponCategory === 'Anti Navy') {
          const childProj = script?.childProjectileId ? projectiles[script.childProjectileId] : null
          const categories = childProj?.Categories || proj?.Categories || []
          weapon.isTorpedo = categories.includes('TORPEDO')
        }
      }
    }
  }
}
