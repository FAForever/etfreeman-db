import { computed } from 'vue'
import { useCompareStore } from '../stores/compare'

const divisorKey = { mass: 'BuildCostMass', energy: 'BuildCostEnergy', BT: 'BuildTime' }
const toShieldLabel = (s) => ['DPS', 'DPM'].includes(s) ? `DP${s[2]}tS` : s

export function useCalcEfficiency(type) {
  const store = useCompareStore()

  const mode = computed(() =>
    type === 'unit' ? store.efficiencySettings.unitMode : store.efficiencySettings.weaponMode
  )
  const invert = computed(() =>
    type === 'unit' ? store.efficiencySettings.unitInvert : store.efficiencySettings.weaponInvert
  )

  const parsed = computed(() => {
    const [numerator, denominator] = mode.value.split('/')
    return { numerator, denominator }
  })

  const denominatorLabel = computed(() => parsed.value.denominator)
  const getDivisor = (economy) => economy[divisorKey[parsed.value.denominator]]

  const calculate = (value, divisor) => {
    if (value == null || divisor == null) return null
    return invert.value ? divisor / value : value / divisor
  }

  const getFractionHTML = (isShields = false) => {
    const num = invert.value ? parsed.value.denominator : parsed.value.numerator
    const denom = invert.value ? parsed.value.numerator : parsed.value.denominator
    const transform = isShields ? toShieldLabel : (x) => x
    return `<math class="fraction" xmlns="http://www.w3.org/1998/MathML"><mfrac><mi>${transform(num)}</mi><mi>${transform(denom)}</mi></mfrac></math>`
  }

  return {
    mode, invert, parsed, denominatorLabel,
    getDivisor, calculate, getFractionHTML
  }
}
