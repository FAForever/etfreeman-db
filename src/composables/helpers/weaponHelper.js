export const ONE_TIME_USE_CATEGORIES = ['Kamikaze', 'Death', 'Teleport']
export const isOneTimeUse = (weapon) => weapon?.FireOnDeath || ONE_TIME_USE_CATEGORIES.includes(weapon?.__category)
export const isMissile = (weapon) => weapon.WeaponCategory == 'Missile'
export const isTorpedo = (weapon) => weapon.WeaponCategory == 'Anti-navy'
export const isAntiTorpedo = (weapon) => weapon.WeaponCategory == 'Defense' && weapon.TargetRestrictOnlyAllow?.toLowerCase().match('torpedo')
export const isAntiMissile = (weapon) => weapon.WeaponCategory == 'Defense' && weapon.TargetRestrictOnlyAllow?.toLowerCase().match('missile')
export const isAntiMissileFlare = (weapon) => weapon.isAntiMissileFlare
