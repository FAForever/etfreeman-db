import { toValue } from 'vue'

const rgb = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 })
const FACTION_COLORS = {
  uef: rgb(200, 230, 255),
  cybran: rgb(255, 150, 150),
  aeon: rgb(210, 250, 210),
  seraphim: rgb(255, 230, 205),
  nomads: rgb(255, 80, 0)
}

const FACTIONS = Object.keys(FACTION_COLORS)

let container = null
const factionFilterIds = {}

const buildColorMatrix = (faction) => {
  const c = FACTION_COLORS[faction?.toLowerCase()] || { r: 1, g: 1, b: 1 }
  return `${c.r} 0 0 0 0  ${c.g} 0 0 0 0  ${c.b} 0 0 0 0  0 0 0 1 0`
}

const buildFiltersSvg = () => {
  const filters = FACTIONS.map(f => `
    <filter id="faction-filter-${f}">
      <feColorMatrix type="matrix" values="${buildColorMatrix(f)}"/>
    </filter>
  `).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true">
    <defs>${filters}</defs>
  </svg>`
}

const ensureFilters = () => {
  if (container) return

  const doc = new DOMParser().parseFromString(buildFiltersSvg(), 'image/svg+xml')
  container = doc.documentElement
  Object.assign(container.style, {
    position: 'absolute',
    pointerEvents: 'none'
  })

  for (const faction of FACTIONS) {
    factionFilterIds[faction] = `faction-filter-${faction}`
  }
  document.body.appendChild(container)
}

export const useFactionColorFilter = (faction) => {
  ensureFilters()

  const factionValue = toValue(faction)?.toLowerCase()
  const filterId = factionFilterIds[factionValue]

  const factionFilter = factionValue === 'nomads'
    ? `url(#${filterId}) saturate(70%) brightness(150%)`
    : `url(#${filterId}) saturate(500%)`

  return { filterId, factionFilter }
}
