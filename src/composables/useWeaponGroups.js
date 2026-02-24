import { computed } from 'vue'

const CATEGORIES_MAP = {
  'Direct Fire': 'Direct',
  'Direct Fire Naval': 'Direct',
  'Direct Fire Experimental': 'Direct',
  'Anti Air': 'Anti-Air',
  'Anti Navy': 'Anti-Navy'
}

const categorizeWeapon = (weapon) => {
  if (weapon.DamageType == "Overcharge") {
    let str = weapon.DisplayName
    if (weapon.Label == "AutoOverCharge" && !weapon.DisplayName.match('Auto'))
      str = str.replace('Overcharge', 'AutoOvercharge')
    return str.replace('Overcharge', 'OC')
  }
  if (weapon.WeaponCategory == 'Missile' && weapon.NukeInnerRingRadius) return 'Nuke'
  if (weapon.DisplayName == 'Sih Energy Rifle Sniper Mode') return 'Sniper mode'
  if (weapon.__unitID == 'XRL0302' && weapon.IgnoreIfDisabled) return 'Kamikaze' // fire beetle moment
  if (weapon.WeaponCategory == 'Defense') {
    if (weapon.TargetRestrictOnlyAllow?.toLowerCase().match('missile')) return 'Anti-Missile'
    if (weapon.TargetRestrictOnlyAllow?.toLowerCase().match('torpedo')) return 'Anti-Torpedo'
  }
  return CATEGORIES_MAP[weapon.WeaponCategory] || weapon.WeaponCategory
}

export function useWeaponGroups(weapons) {
  const groups = computed(() => {
    if (!weapons) return {}

    const grouped = weapons.reduce((acc, weapon) => {
      if (!weapon.dps && !weapon.fullDamage && weapon.DamageType != "EMP") return acc
      if (weapon.WeaponCategory == "Kamikaze" && weapon.fullDamage == 1) return acc // fire beetle moment

      const category = categorizeWeapon(weapon)
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
