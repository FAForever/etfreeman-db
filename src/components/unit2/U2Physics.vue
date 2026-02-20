<script setup>
import { computed } from 'vue'
import { round } from '../../composables/helpers/common';
import Icon from '../Icon.vue'
import LineItem from './LineItem.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const physics = unit.Physics || {}
const air = unit.Air || {}

const isFirst3SmallLand = computed(() => {
  return !air.MaxAirspeed
    && physicsItems.length >= 3
    && physicsItems.length % 2
    && physicsItems[0]?.text === 'Speed'
    && physicsItems[1]?.text === 'Turn rate'
    && physicsItems[2]?.text === 'Backup Distance'
})

const isCompact = computed(() => physicsItems.length <= 3)
const isShown = computed(() => physicsItems.length > 0)
const expandScore = computed(() => physicsItems.length / 3)

defineExpose({ isCompact, isShown, expandScore })

const formatTime = (val) => {
  const m = Math.floor(val / 60)
  const s = round(val % 60, 1)
  return m ? `${m}m ${s}s` : `${s}s`
}

const physicsItems = [
  ...(air.MaxAirspeed != null ? [{ text: 'Speed', value: `${air.MinAirspeed || 0}-${air.MaxAirspeed}` }] :
    physics.MaxSpeed != null ? [{ text: 'Speed', value: physics.MaxSpeed }] : []),
  { key: 'TurnRate', label: 'Turn rate', src: physics },
  { key: 'TurnSpeed', label: 'Turn speed', src: air },
  { key: 'BackUpDistance', label: 'Backup Distance', src: physics, skipZero: true },
  { key: 'Elevation', label: 'Elevation', src: physics },
  { key: 'CombatTurnSpeed', label: 'Combat turn speed', src: air },
  { key: 'FuelUseTime', label: 'Fuel use time', src: physics, format: formatTime },
].filter(item => {
  if (item.src) {
    const val = item.src[item.key]
    if (item.skipZero && val === 0) return false
    return val != null
  }
  return item.value != null
})
  .map(item => item.src ? { text: item.label, value: item.format ? item.format(item.src[item.key]) : item.src[item.key] } : item)

if (physics.FuelUseTime && physics.FuelRechargeRate) {
  physicsItems.push({
    text: 'Fuel recharge',
    value: formatTime(10 * physics.FuelUseTime / physics.FuelRechargeRate)
  })
}

const multipliers = [
  { text: 'Speed (on land)', value: round(physics.MaxSpeed * physics.LandSpeedMultiplier * physics.LandSpeedMultiplier, 2) },
  { text: 'Speed (submerged)', value: round(physics.MaxSpeed * physics.SubSpeedMultiplier * physics.SubSpeedMultiplier, 2) },
  { text: 'Speed (in water)', value: round(physics.MaxSpeed * physics.WaterSpeedMultiplier * physics.WaterSpeedMultiplier, 2) },
  { text: 'Sniper mode speed', value: round(physics.MaxSpeed * physics.SniperModeSpeedMultiplier * physics.SniperModeSpeedMultiplier, 2) }
].filter(item => item.value)
console.log(unit)

physicsItems.splice(1, 0, ...multipliers)
</script>

<template>
  <div class="u2physics uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Physics</h2>
      <div class="uc__section-line">
        <LineItem v-for="item in physicsItems" :key="item.text" :text="item.text + ':'" :value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
</style>
