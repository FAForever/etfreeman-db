import { computed } from 'vue'
import { isAntiMissile, isAntiTorpedo } from './helpers/weaponHelper'

const CATEGORIES_MAP = {
  'Direct Fire': 'Direct',
  'Direct Fire Naval': 'Direct',
  'Direct Fire Experimental': 'Direct',
  'Anti Air': 'Anti-Air',
}

const categorizeWeapon = (weapon) => {
  if (weapon.DamageType == "Overcharge") {
    let str = weapon.DisplayName
    if (weapon.Label == "AutoOverCharge" && !weapon.DisplayName.match('Auto'))
      str = str.replace('Overcharge', 'AutoOvercharge')
    return str.replace('Overcharge', 'OC')
  }
  if (weapon.WeaponCategory == 'Missile' && weapon.NukeInnerRingRadius)
    return 'Nuke'
  if (weapon.DisplayName == 'Sih Energy Rifle Sniper Mode')
    return 'Sniper mode'
  if (weapon.__unitID == 'XRL0302' && weapon.IgnoreIfDisabled)
    return 'Kamikaze'
  if (weapon.WeaponCategory == 'Defense') {
    if (isAntiMissile(weapon))
      return 'Anti-Missile'
    if (isAntiTorpedo(weapon))
      return 'Anti-Torpedo'
  }
  return CATEGORIES_MAP[weapon.WeaponCategory] || weapon.WeaponCategory
}

export { categorizeWeapon }

export function useWeaponGroups(weapons) {
  const groups = computed(() => {
    if (!weapons) return {}

    const grouped = weapons.reduce((acc, weapon) => {
      if (!weapon.dps && !weapon.fullDamage && weapon.DamageType != "EMP" && !weapon.Buffs?.some(b => b.BuffType === 'STUN') && !weapon.deathStunParams) return acc

      const category = categorizeWeapon(weapon)
      weapon.__category = category
      if (!acc[category]) acc[category] = []
      acc[category].push(weapon)
      return acc
    }, {})

    const sorted = Object.entries(grouped)
      .sort((a, b) => b[1].reduce((sum, w) => sum + w.dps, 0) - a[1].reduce((sum, w) => sum + w.dps, 0))
      .map(([cat, ws]) => [cat, ws.sort((a, b) => b.dps - a.dps)])

    return Object.fromEntries(sorted)
  })

  const sortedWeapons = computed(() => Object.values(groups.value).flat())

  return { groups, sortedWeapons }
}
