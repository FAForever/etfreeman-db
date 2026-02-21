import { reactive } from 'vue'

const DEFAULTS = {
  unitMode: 'hp/mass',
  weaponMode: 'DPS/mass',
  unitInvert: false,
  weaponInvert: false
}

export function useEfficiencySettings() {
  const efficiencySettings = reactive({ ...DEFAULTS })

  return { efficiencySettings }
}
