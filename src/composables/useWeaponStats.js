import { Column } from '@/composables/useWeaponColumns'

export const ONE_TIME_USE_CATEGORIES = ['Kamikaze', 'Death', 'Teleport']

export const isOneTimeUse = (weapon) => weapon?.FireOnDeath || ONE_TIME_USE_CATEGORIES.includes(weapon?.__category)

export const isOneTimeUseCategory = (category) => ONE_TIME_USE_CATEGORIES.includes(category)

export { Column }
