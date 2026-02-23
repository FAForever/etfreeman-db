<script setup>
import { computed } from 'vue'
import { round, formatNum } from '@/composables/helpers/common'
import LineItem from '../helpers/LineItem.vue'
import { useUnitData } from '@/composables/useUnitData'
import { useCompareStore } from '@/stores/compare'

const props = defineProps(['unit', 'compactOverride'])
const { unitDefaults } = useUnitData()
const { showedSections } = useCompareStore()

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

const isShown = computed(() => showedSections['Wreckage'] && !!props.unit.Wreckage?.HealthMult)
const isCompact = computed(() => true)
const expandScore = computed(() => 1)

defineExpose({ name: 'Wreckage', isShown, isCompact, expandScore })
</script>

<template>
  <div class="uwreckage uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <h2 class="uc__section-title uwreckage__header">Wreckage</h2>
    <div class="uc__section-line">
      <LineItem v-if="canBeOnLand" text="Mass:" :value="formatNum(round(massValue))" />
      <LineItem v-if="canBeInWater" text="Mass (in water):" :value="formatNum(round(massWaterValue))" />
      <LineItem text="Health:" :value="formatNum(round(healthValue))" />
    </div>
  </div>
</template>

<style lang="sass">
.uwreckage
  &__header-icon
    stroke-width: 50
    fill: transparent
</style>
