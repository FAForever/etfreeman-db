import { inject, provide } from 'vue'

export function useIcons(icons) {
  const prev = inject('icons', {})
  const obj = { ...prev }
  for (const icon of icons) {
    obj[icon.name] = icon
  }
  provide('icons', obj)
}
