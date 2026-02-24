export const ONE_TIME_USE_CATEGORIES = ['Kamikaze', 'Death', 'Teleport']
export const isOneTimeUse = (weapon) => weapon?.FireOnDeath || ONE_TIME_USE_CATEGORIES.includes(weapon?.__category)