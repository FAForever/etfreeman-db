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

    // Parse the projectile blueprint table
    const projectile = astToObject(callExpr.arguments);
    if (!projectile) return null;

    const physics = projectile.Physics;
    if (!physics) return null;

    // Extract only the minimal data needed for DPS calculations
    const projectileData = {};

    // Only extract Fragments and FragmentId
    if (physics.Fragments !== undefined) {
      projectileData.fragments = physics.Fragments;
    }

    if (physics.FragmentId !== undefined) {
      // Extract just the projectile ID from the path
      // e.g., "/projectiles/foo/foo_proj.bp" -> "foo"
      const match = physics.FragmentId.match(/([^/]+)_proj\.bp$/i);
      if (match) {
        projectileData.fragmentId = match[1].toLowerCase();
      }
    }

    // Return null if no useful data
    return Object.keys(projectileData).length > 0 ? projectileData : null;
  } catch (error) {
    console.error(error)
    // Skip projectiles that can't be parsed
    return null;
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
