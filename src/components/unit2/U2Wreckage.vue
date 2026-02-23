<script setup>
import { computed } from 'vue'
import { round, formatNum } from '../../composables/helpers/common'
import Icon from '../Icon.vue'
import LineItem from './LineItem.vue'
import { useUnitData } from '../../composables/useUnitData'

const props = defineProps(['unit', 'compactOverride'])
const { unitDefaults } = useUnitData()

const techMassMult = computed(() => {
  const mults = unitDefaults.value.wreckageTechMassMults || {}
  const techKey = 'TECH' + props.unit.tech?.charAt(1)
  return mults[techKey] || mults.EXPERIMENTAL || 1
})

const massValue = computed(() => {
  const mult = props.unit.Wreckage?.MassMult || 0
  return (props.unit.Economy?.BuildCostMass || 0) * mult * techMassMult.value
})

const massWaterValue = computed(() => {
  return massValue.value * unitDefaults.value.wreckageWaterMult
})

const healthValue = computed(() => {
  const mult = props.unit.Wreckage?.HealthMult || 0
  return props.unit.Defense.Health * mult
})

const canBeOnLand = computed(()=>props.unit.General.Icon != 'sea')
const canBeInWater = computed(()=>{
  return !(props.unit.General.Icon == 'land' && props.unit.Categories.includes('STRUCTURE'))
})

const isShown = computed(() => !!props.unit.Wreckage?.HealthMult)
const isCompact = computed(() => true)
const expandScore = computed(() => 1)

defineExpose({ key: 'wreckage', isShown, isCompact, expandScore })
</script>

<template>
  <div class="u2wreckage uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <h2 class="uc__section-title u2wreckage__header">Wreckage</h2>
    <div class="uc__section-line">
      <LineItem v-if="canBeOnLand" text="Mass:" :value="formatNum(round(massValue))" />
      <LineItem v-if="canBeInWater" text="Mass (in water):" :value="formatNum(round(massWaterValue))" />
      <LineItem text="Health:" :value="formatNum(round(healthValue))" />
    </div>
  </div>
</template>

<style lang="sass">
.u2wreckage
  &__header-icon
    stroke-width: 50
    fill: transparent
</style>
