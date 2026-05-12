import luaparse from 'luaparse';

export function parseBlueprint(content) {
  const ast = luaparse.parse(content, { comments: false, scope: true });

  const callStatement = ast.body[0];
  if (callStatement.type !== 'CallStatement') {
    throw new Error('Expected CallStatement');
  }

  const callExpr = callStatement.expression;
  if (callExpr.type !== 'TableCallExpression') {
    throw new Error('Expected TableCallExpression');
  }

  return astToObject(callExpr.arguments);
}

export function parseVersion(content) {
  const ast = luaparse.parse(content, { comments: false });

  for (const node of ast.body) {
    if (node.type === 'LocalStatement') {
      const versionVar = node.variables.find(v => v.name === 'Version');
      if (versionVar) {
        const idx = node.variables.indexOf(versionVar);
        const initValue = node.init[idx];
        if (initValue.type === 'StringLiteral') {
          return { version: parseString(initValue.raw) };
        }
        if (initValue.type === 'NumericLiteral') {
          return { version: String(initValue.value) };
        }
      }
    }
  }

  throw new Error('Could not parse version');
}

export function parseProjectile(content) {
  try {
    const ast = luaparse.parse(content, { comments: false, scope: true });

    if (!ast || !ast.body || ast.body.length === 0) {
      return null;
    }

    const callStatement = ast.body[0];
    if (callStatement.type !== 'CallStatement') {
      return null;
    }

    const callExpr = callStatement.expression;
    if (callExpr.type !== 'TableCallExpression') {
      return null;
    }

    const projectile = astToObject(callExpr.arguments);
    if (!projectile) return null;

    const projectileData = {}

    // Extract Fragments and FragmentId from Physics
    if (projectile.Physics) {
      if (projectile.Physics.Fragments !== undefined) {
        projectileData.fragments = projectile.Physics.Fragments
      }
      if (projectile.Physics.FragmentId !== undefined) {
        const match = projectile.Physics.FragmentId.match(/([^/]+)_proj\.bp$/i)
        if (match) {
          projectileData.fragmentId = match[1].toLowerCase()
        }
      }
    }

    // Extract Health if present
    const health = projectile.Defense?.Health
    if (health > 0) {
      projectileData.Health = health
    }

    if (projectile.Categories?.length) {
      projectileData.Categories = projectile.Categories
    }

    // Extract cost data if any cost exists
    const eco = projectile.Economy || {}
    if (eco.BuildCostMass > 0 || eco.BuildCostEnergy > 0 || eco.BuildTime > 0) {
      projectileData.Description = projectile.Description
      projectileData.BuildCostEnergy = eco.BuildCostEnergy
      projectileData.BuildCostMass = eco.BuildCostMass
      projectileData.BuildTime = eco.BuildTime
    }

    return Object.keys(projectileData).length > 0 ? projectileData : null
  } catch (error) {
    console.error(error)
    return null
  }
}

export function parseProjectileScript(content) {
  const childCountMatch = content.match(/ChildCount\s*=\s*(\d+)/)
  const splitType = /OnEnterWater[\s\S]*?OnSplit/.test(content) ? 'onWater'
    : /CLOATacticalMissileProjectile/.test(content) ? 'onDeath'
    : null

  const isAntiMissileFlare = /ClassProjectile\s*\(\s*AIMFlareProjectile\s*\)/.test(content)

  const childProjMatch = content.match(/ChildProjectileBlueprint\s*=\s*['"]([^'"]*?)['"]/)
  const childProjectileId = childProjMatch?.[1].match(/([^/]+)_proj\.bp$/i)?.[1].toLowerCase() || null

  if (!childCountMatch && !splitType && !isAntiMissileFlare && !childProjectileId) return null

  return {
    childCount: childCountMatch ? parseInt(childCountMatch[1]) : null,
    splitType, isAntiMissileFlare, childProjectileId
  }
}

function astToObject(node) {
  if (!node) return null;

  switch (node.type) {
    case 'TableConstructorExpression':
      return parseTable(node);

    case 'NumericLiteral':
      return node.value;

    case 'StringLiteral':
      return parseString(node.raw);

    case 'BooleanLiteral':
      return node.value;

    case 'NilLiteral':
      return null;

    case 'BinaryExpression':
      return evaluateBinary(node);

    case 'UnaryExpression':
      const arg = astToObject(node.argument);
      return node.operator === '-' ? -arg : arg;

    case 'TableCallExpression':
    case 'CallExpression':
      if (node.arguments?.type === 'TableConstructorExpression') {
        const obj = parseTable(node.arguments);
        obj._type = node.base.name;
        return obj;
      }
      return null;

    default:
      return null;
  }
}

function parseTable(tableNode) {
  const fields = tableNode.fields;

  const isArray = fields.every(f => f.type === 'TableValue');

  if (isArray) {
    return fields.map(f => astToObject(f.value));
  } else {
    const obj = {};
    for (const field of fields) {
      if (field.type === 'TableKeyString') {
        obj[field.key.name] = astToObject(field.value);
      } else if (field.type === 'TableKey') {
        const key = astToObject(field.key);
        obj[key] = astToObject(field.value);
      }
    }
    return obj;
  }
}

function evaluateBinary(node) {
  const left = astToObject(node.left);
  const right = astToObject(node.right);

  switch (node.operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '^': return Math.pow(left, right);
    default: return null;
  }
}

function parseString(raw) {
  if (!raw) return '';
  let str = raw.slice(1, -1).replace(/<LOC[^>]*>/, '');
  str = str.replace(/\\"/g, '"')
           .replace(/\\'/g, "'")
           .replace(/\\\\/g, '\\')
           .replace(/\\n/g, '\n')
           .replace(/\\r/g, '\r')
           .replace(/\\t/g, '\t');
  return str;
}

export function parseShield(content) {
  const overspillMatch = content.match(/SpillOverDmgMod\s*=\s*spec\.ShieldSpillOverDamageMod\s+or\s+([\d.]+)/);
  const rechargeMatch = content.match(/ShieldRechargeTime\s*=\s*spec\.ShieldRechargeTime\s+or\s+([\d.]+)/);

  if (!overspillMatch) throw new Error('Failed to parse ShieldSpillOverDamageMod from shield.lua')
  if (!rechargeMatch) throw new Error('Failed to parse ShieldRechargeTime from shield.lua')

  const overspill = parseFloat(overspillMatch[1])
  const rechargeTime = parseFloat(rechargeMatch[1])

  if (Number.isNaN(overspill)) throw new Error('ShieldSpillOverDamageMod is not a valid number')
  if (Number.isNaN(rechargeTime)) throw new Error('ShieldRechargeTime is not a valid number')

  return {
    shieldDefaultOverspill: overspill,
    shieldDefaultRechargeTime: rechargeTime
  };
}

export function parseVeterancyConstants(blueprintsUnitsContent, defaultComponentsContent) {
  const bpAst = luaparse.parse(blueprintsUnitsContent, { comments: false })

  const bpNode = bpAst.body.find(n =>
    n.type === 'LocalStatement' && n.variables.some(v => v.name === 'TechToVetMultipliers')
  )
  if (!bpNode) throw new Error('Failed to find TechToVetMultipliers in blueprints-units.lua')

  const techToVetMultipliers = astToObject(bpNode.init[0])
  if (!techToVetMultipliers) throw new Error('Failed to parse TechToVetMultipliers table')

  const defAst = luaparse.parse(defaultComponentsContent, { comments: false })

  const defNode = defAst.body.find(n =>
    n.type === 'LocalStatement' && n.variables.some(v => v.name === 'VeterancyRegenBuffs')
  )
  if (!defNode) throw new Error('Failed to find VeterancyRegenBuffs in defaultcomponents.lua')

  const veterancyRegenBuffs = astToObject(defNode.init[0])
  if (!veterancyRegenBuffs) throw new Error('Failed to parse VeterancyRegenBuffs table')

  return { techToVetMultipliers, veterancyRegenBuffs }
}

export function createConfig({ versionContent, shieldContent, blueprintsUnitsContent, defaultComponentsContent, unitContent }) {
  console.log('\nExtracting constants...')
  return {
    ...parseVersion(versionContent),
    ...parseShield(shieldContent),
    ...parseVeterancyConstants(blueprintsUnitsContent, defaultComponentsContent),
    ...parseWreckageConstants(unitContent),
  }
}

export function parseWreckageConstants(unitContent) {
  const patterns = {
    TECH1: /tech_category == 'TECH1'[\s\S]*?mass_tech_mult = ([\d.]+)/,
    TECH2: /tech_category == 'TECH2'[\s\S]*?mass_tech_mult = ([\d.]+)/,
    TECH3: /tech_category == 'TECH3'[\s\S]*?mass_tech_mult = ([\d.]+)/,
    EXPERIMENTAL: /tech_category == 'EXPERIMENTAL'[\s\S]*?mass_tech_mult = ([\d.]+)/,
    water: /if layer == 'Water' or layer == 'Sub'[\s\S]*?mass = mass \* ([\d.]+)/,
  }

  const wreckageTechMassMults = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    if (key === 'water') continue

    const match = unitContent.match(pattern)
    if (!match) throw new Error(`Failed to parse ${key} mass_tech_mult from unit.lua`)

    const value = parseFloat(match[1])
    if (Number.isNaN(value)) throw new Error(`${key} mass_tech_mult is not a valid number`)
    wreckageTechMassMults[key] = value
  }

  const waterMatch = unitContent.match(patterns.water)
  if (!waterMatch) throw new Error("Failed to parse Water mass multiplier from unit.lua")

  const wreckageWaterMult = parseFloat(waterMatch[1])
  if (Number.isNaN(wreckageWaterMult)) throw new Error('Water mass multiplier is not a valid number')

  return { wreckageTechMassMults, wreckageWaterMult }
}
