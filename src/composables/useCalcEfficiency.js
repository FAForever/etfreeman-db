import { computed } from 'vue'
import { useCompareStore } from '../stores/compare'

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

  const numeratorLabel = computed(() => parsed.value.numerator)
  const denominatorLabel = computed(() => parsed.value.denominator)

  const getDivisor = (economy) => {
    const key = parsed.value.denominator
    if (key === 'mass') return economy.BuildCostMass
    if (key === 'energy') return economy.BuildCostEnergy
    if (key === 'BT') return economy.BuildTime
  }

  const calculate = (value, divisor) => {
    if (value == null || divisor == null) return null
    return invert.value ? divisor / value : value / divisor
  }

  const getMathMLHeader = (isShields = false) => {
    const num = invert.value ? parsed.value.denominator : parsed.value.numerator
    const denom = invert.value ? parsed.value.numerator : parsed.value.denominator

    let numLabel = num
    let denomLabel = denom

    if (isShields) {
      if (num === 'DPS' || num === 'DPM') {
        numLabel = 'DP' + num[2] + 'tS'
      }
      if (denom === 'DPS' || denom === 'DPM') {
        denomLabel = 'DP' + denom[2] + 'tS'
      }
    }

    return `<math class="fraction" xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>${numLabel}</mi><mi>${denomLabel}</mi></mfrac></math>`
  }

  return {
    mode,
    invert,
    parsed,
    numeratorLabel,
    denominatorLabel,
    getDivisor,
    calculate,
    getMathMLHeader
  }
}
