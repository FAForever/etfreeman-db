import { Column } from '@/composables/useWeaponColumns'

export const ONE_TIME_USE_CATEGORIES = ['Kamikaze', 'Death', 'Teleport']

export const isOneTimeUse = (weapon, category) =>
  weapon?.FireOnDeath || ONE_TIME_USE_CATEGORIES.includes(category)

export const isOneTimeUseCategory = (category) =>
  ONE_TIME_USE_CATEGORIES.includes(category)

export { Column }
