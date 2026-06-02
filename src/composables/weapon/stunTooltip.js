const COMPATIBLE = {
  TECH1: ['AIR', 'LAND', 'NAVAL', 'STRUCTURE', 'MOBILE', 'WALL'],
  TECH2: ['AIR', 'LAND', 'NAVAL', 'STRUCTURE', 'MOBILE', 'SHIELD'],
  TECH3: ['AIR', 'LAND', 'NAVAL', 'STRUCTURE', 'MOBILE', 'SHIELD'],
  EXPERIMENTAL: ['AIR', 'LAND', 'NAVAL', 'STRUCTURE', 'MOBILE'],
  COMMAND: ['LAND', 'MOBILE', 'SHIELD'],
  SUBCOMMANDER: ['LAND', 'MOBILE', 'SHIELD'],
  WALL: ['TECH1', 'STRUCTURE', 'LAND'],
  SHIELD: ['TECH2', 'TECH3', 'COMMAND', 'SUBCOMMANDER'],
  STRUCTURE: ['TECH1', 'TECH2', 'TECH3', 'EXPERIMENTAL', 'LAND', 'WALL'],
  NAVAL: ['TECH1', 'TECH2', 'TECH3', 'EXPERIMENTAL', 'MOBILE'],
  AIR: ['TECH1', 'TECH2', 'TECH3', 'EXPERIMENTAL', 'MOBILE'],
  LAND: ['TECH1', 'TECH2', 'TECH3', 'EXPERIMENTAL', 'COMMAND', 'SUBCOMMANDER', 'MOBILE', 'WALL', 'STRUCTURE', 'SHIELD'],
  MOBILE: ['TECH1', 'TECH2', 'TECH3', 'EXPERIMENTAL', 'COMMAND', 'SUBCOMMANDER', 'AIR', 'LAND', 'NAVAL', 'SHIELD'],
}

const isCompatible = (a, b) => {
  if (a === b) return true
  if (a === 'ALLUNITS' || b === 'ALLUNITS') return true
  return COMPATIBLE[a]?.includes(b) || COMPATIBLE[b]?.includes(a) || false
}

const isOrSemantics = (allowTags) => {
  for (let i = 0; i < allowTags.length; i++) {
    for (let j = i + 1; j < allowTags.length; j++) {
      if (!isCompatible(allowTags[i], allowTags[j])) return true
    }
  }
  return false
}

const parseTags = (str) => {
  if (!str) return []
  return String(str).split(',').map(s => s.trim()).filter(Boolean)
}

const ALWAYS_REDUNDANT = new Set(['UNSTUNABLE', 'WALL'])

const cleanDisallow = (allowTags, disallowTags) => {
  if (!allowTags.length || allowTags.includes('ALLUNITS')) {
    return disallowTags.filter(t => !ALWAYS_REDUNDANT.has(t))
  }
  const orMode = isOrSemantics(allowTags)
  return disallowTags.filter(d => {
    if (ALWAYS_REDUNDANT.has(d)) return false
    return orMode
      ? allowTags.some(a => isCompatible(a, d))
      : allowTags.every(a => isCompatible(a, d))
  })
}

const UAL0001_SUFFIX = '\nThe further the target, the shorter the stun'

const formatBuffsLine = (weapon, buff) => {
  const allow = parseTags(buff.TargetAllow)
  const disallow = cleanDisallow(allow, parseTags(buff.TargetDisallow))
  let line = allow.join(', ')
  if (disallow.length) line += ` (except ${disallow.join(', ')})`
  if (weapon.__unitID === 'UAL0001') {
    line += ` in\u00A0main\u00A0gun\u00A0radius`
    line += ` for\u00A0up\u00A0to\u00A0${buff.Duration}s`
  } else {
    if (typeof buff.Radius === 'number' && buff.Radius > 0) line += ` in\u00A0radius\u00A0${buff.Radius}`
    line += ` for\u00A0${buff.Duration}s`
  }
  return line
}

const formatDeathLine = (params) => {
  const allow = params.allowed
  const disallow = cleanDisallow(allow, params.disallowed)
  let line = allow.join(', ')
  if (disallow.length) line += ` (except ${disallow.join(', ')})`
  line += ` for\u00A0${params.duration}s`
  return line
}

const ENHANCEMENT_PREFIX = {
  URL0301: 'EMP Burst',
  XNL0301: 'EMP Gun',
}

export const getStunTooltip = (weapon) => {
  const stunBuffs = (weapon.Buffs || []).filter(b => b.BuffType === 'STUN')
  if (stunBuffs.length) {
    const trigger = stunBuffs[0].Add?.OnFire ? 'fire' : 'impact'
    let body = `Stuns targets on ${trigger}:\n${stunBuffs.map(b => formatBuffsLine(weapon, b)).join('\n')}`
    if (weapon.__unitID === 'UAL0001') body += UAL0001_SUFFIX
    const enhancement = ENHANCEMENT_PREFIX[weapon.__unitID]
    return enhancement ? `After enhancement "${enhancement}" installed:\n${body}` : body
  }
  if (weapon.deathStunParams) {
    return 'Stuns targets on death:\n' + formatDeathLine(weapon.deathStunParams)
  }
  return null
}
