export const SECTION_ORDER = [
  'Land', 'Air', 'Naval', 'Construction - Buildpower', 'Structures - Weapons',
  'Structures - Support', 'Structures - Intelligence', 'Structures - Economy',
  'Structures - Factories', 'Experimental', 'Unknown'
]

export const customOrderModifiers = {
  'T2 Mobile Bomb': 1e3,
  'T1 Light Assault Bot': 1e2,
  'T2 Bot': 1e3,
  'T3 Assault Bot': 2,
  'T3 Heavy Assault Bot/Tank': -10,
  'T3 Strategic Missile Defense': -1996,
  'T1 Light Gunship': 10,
  'T1 Anti-Air Boat': 500,
  'T2 Torpedo Boat': 100,
  'T3 Aircraft Carrier': 2,
  'T3 Quantum Gateway': 1e4,
  'T1 Engineering Drone': 1e3,
  'T2 Engineer': -1e3,
  'T2 Field Engineer': -1e3,
  'T3 Engineering Station': 1e3,
  'T3 Engineering Drone': 1e3,
  'T3 Omni Sensor Array': -1e5,
  'Direct Fire Experimental': -1e3,

  /* nomads issues: */
  'T3 Mobile Anti-Air': -1e3,
  'T2 Tactical Missile Launcher': -1e2,
  'T3 Heavy Artillery Installation': -1e3,
  'T3 Anti-Air SAM Launcher': -1e4,
}

export const customTypeOrderModifiers = {
  'T1 Light Gunship': 10,
  'T1 Engineering Drone': 1000,
  'T2 Engineering Station': 9000,
  'T3 Quantum Gateway': 9800,
  'Direct Fire Experimental': -100,
  'Other Experimental': 1000,
  'T1 Mass Extractor': -100,
  'T2 Mass Extractor': -100,
  'T3 Mass Extractor': -100,
  'T3 Strategic Missile Defense': -1996,
  'T2 Mobile Shield Generator': -10,
  'T1 Anti-Air Boat': 500,
  'T2 Torpedo Boat': 100,
  'T3 Battlecruiser': -2,
  'T1 Tank Destroyer': 1e2,
  'T3 Heavy Point Defense': 1e3,
  'T3 Torpedo Ambushing System': 1e3
}

const TIER_ORDER = { 'T1': 1, 'T2': 2, 'T3': 3, 'EXP': 4, '': 1 }
const FACTION_ORDER = { 'UEF': 1, 'Cybran': 2, 'Aeon': 3, 'Seraphim': 4, 'Nomads': 5 }

export const getUnitNumber = (id) => (id.slice(-4).match(/\d+$/)?.[0] || 0) - 0
export const getUnitSortOrder = (bp) => {
  const isEGG = bp.Categories.includes('CRABEGG')? 1e4 : 0
  const isMavor = bp.Id == 'UEB2401'? 1e4 : 0
  return getUnitNumber(bp.Id) + isEGG + isMavor + (customOrderModifiers[bp.type] || 0)
}
export const getTypeSortOrder = (type, units) => {
  const sum = units.reduce((acc, u) => acc + getUnitNumber(u.id) + TIER_ORDER[u.tech] * 1e4 + (u.Categories.includes('CRABEGG')? 1e3: 0), 0)
  return (sum / units.length) + (customTypeOrderModifiers[type] || 0)
}

export const sortTierKey = (a, b) => TIER_ORDER[a] - TIER_ORDER[b]
export const sortFaction = (a, b) => FACTION_ORDER[a] - FACTION_ORDER[b]
export const sortUnits = (a, b) => a.sortOrder - b.sortOrder
