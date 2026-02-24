<script setup>
import { computed } from 'vue'
import { round } from '@/composables/helpers/common';
import LineItem from '../helpers/LineItem.vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const physics = unit.Physics || {}
const air = unit.Air || {}

const formatTime = (val) => {
  const m = Math.floor(val / 60)
  const s = round(val % 60, 1)
  return m ? `${m}m ${s}s` : `${s}s`
}

const speedValue = computed(() => {
  if (air.MaxAirspeed) return `${air.MinAirspeed || 0}-${air.MaxAirspeed}`
  return physics.MaxSpeed || 0
})

const physicsItems = [
  { text: 'Speed', value: speedValue.value },
  { text: 'Speed (on land)', value: round(physics.MaxSpeed * physics.LandSpeedMultiplier ** 2, 2) },
  { text: 'Speed (submerged)', value: round(physics.MaxSpeed * physics.SubSpeedMultiplier ** 2, 2) },
  { text: 'Speed (in water)', value: round(physics.MaxSpeed * physics.WaterSpeedMultiplier ** 2, 2) },
  { text: 'Sniper mode speed', value: round(physics.MaxSpeed * physics.SniperModeSpeedMultiplier ** 2, 2) },
  { text: 'Turn rate', value: physics.TurnRate },
  { text: 'Turn speed', value: air.TurnSpeed },
  { text: 'StartTurnDistance ', value: air.StartTurnDistance },
  { text: 'Backup Distance', value: physics.BackUpDistance},
  { text: 'Elevation', value: physics.Elevation, dontSkipZero: true },
  { text: 'Combat turn speed', value: air.CombatTurnSpeed },
  { text: 'Fuel use time', value: physics.FuelUseTime, format: formatTime },
  { text: 'Fuel recharge', value: 10 * physics.FuelUseTime / physics.FuelRechargeRate, format: formatTime }
].filter(item => item.value || (item.value === 0 && item.dontSkipZero))
.map(item => item.format ? { ...item, value: item.format(item.value) } : item)

const isCompact = computed(() => physicsItems.length <= 3)
const isShown = computed(() => showedSections['Physics'] && physicsItems.length > 0)
const expandScore = computed(() => physicsItems.length / 3)

defineExpose({ name: 'Physics', isCompact, isShown, expandScore })
</script>

<template>
  <div class="uphysics uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Physics</h2>
      <div class="uc__section-line">
        <LineItem v-for="item in physicsItems" :text="item.text + ':'" :value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
</style>
