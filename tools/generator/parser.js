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
          return parseString(initValue.raw);
        }
        if (initValue.type === 'NumericLiteral') {
          return String(initValue.value);
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

  return {
    overspill: parseFloat(overspillMatch[1]),
    rechargeTime: parseFloat(rechargeMatch[1])
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

export function parseWreckageConstants(unitContent) {
  const tech1Match = unitContent.match(/tech_category == 'TECH1'[\s\S]*?mass_tech_mult = ([\d.]+)/);
  const tech2Match = unitContent.match(/tech_category == 'TECH2'[\s\S]*?mass_tech_mult = ([\d.]+)/);
  const tech3Match = unitContent.match(/tech_category == 'TECH3'[\s\S]*?mass_tech_mult = ([\d.]+)/);
  const expMatch = unitContent.match(/tech_category == 'EXPERIMENTAL'[\s\S]*?mass_tech_mult = ([\d.]+)/);
  const waterMatch = unitContent.match(/layer == 'Water'[\s\S]*?mass = mass \* ([\d.]+)/);

  if (!tech1Match) throw new Error("Failed to parse TECH1 mass_tech_mult from unit.lua")
  if (!tech2Match) throw new Error("Failed to parse TECH2 mass_tech_mult from unit.lua")
  if (!tech3Match) throw new Error("Failed to parse TECH3 mass_tech_mult from unit.lua")
  if (!expMatch) throw new Error("Failed to parse EXPERIMENTAL mass_tech_mult from unit.lua")
  if (!waterMatch) throw new Error("Failed to parse Water mass multiplier from unit.lua")

  return {
    techMassMults: {
      TECH1: parseFloat(tech1Match[1]),
      TECH2: parseFloat(tech2Match[1]),
      TECH3: parseFloat(tech3Match[1]),
      EXPERIMENTAL: parseFloat(expMatch[1]),
    },
    waterMult: parseFloat(waterMatch[1]),
  };
}
