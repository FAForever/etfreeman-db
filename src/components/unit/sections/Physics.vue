<script setup>
import { computed } from 'vue'
import { round } from '@/composables/helpers/common';
import LineItem from '../helpers/LineItem.vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const physics = unit.Physics || {}
const isSubmersible = unit.Categories?.includes('SUBMERSIBLE') && (physics.Elevation < 0 || physics.MaxHitboxDepth)
const isAir = unit.Categories?.includes('AIR')
const air = unit.Air || {}

const formatTime = (val, formatMap = {}) => {
  if (formatMap[val] !== undefined) return formatMap[val]
  const m = Math.floor(val / 60)
  const s = round(val % 60, 1)
  return m ? `${m}m ${s}s` : `${s}s`
}

const speedValue = computed(() => {
  if (air.MaxAirspeed) return `${air.MinAirspeed || 0}-${air.MaxAirspeed}`
  return physics.MaxSpeed || 0
})

const getFinalSpeed = (speed, multiplier) => {
  const power = multiplier < 1 ? 2 : 1
  return round(speed * multiplier ** power, 2)
}

const backupDistance = round(physics.BackUpDistance >= 0 ? physics.BackUpDistance : 3 * unit.SizeZ, 2)
const hasReverse = backupDistance > 0 && physics.MaxSpeedReverse > 0
const backupSpeed = (multiplier) => {
  if (!hasReverse || (physics.MaxSpeedReverse === physics.MaxSpeed)) return null
  return getFinalSpeed(physics.MaxSpeedReverse, multiplier)
}

const hitboxDepth = isSubmersible ? round(physics.MaxHitboxDepth ?? -(physics.Elevation + unit.SizeY + (unit.CollisionOffsetY || 0)), 3) : null
const hitboxTooltip = (suffix = '') => hitboxDepth && [`To damage this submerged unit, a surface-level projectile must have AOE strictly greater than ${hitboxDepth}${suffix}`, 'top left smfont lineitem-value wider']

const physicsItems = [
  { text: 'Speed', value: speedValue.value },
  { text: 'Speed (on land)', value: getFinalSpeed(physics.MaxSpeed, physics.LandSpeedMultiplier) },
  { text: 'Speed (submerged)', value: getFinalSpeed(physics.MaxSpeed, physics.SubSpeedMultiplier) },
  { text: 'Speed (in water)', value: getFinalSpeed(physics.MaxSpeed, physics.WaterSpeedMultiplier) },
  { text: 'Sniper mode speed', value: getFinalSpeed(physics.MaxSpeed, physics.SniperModeSpeedMultiplier) },
  { text: 'Turn rate', value: physics.TurnRate },
  { text: 'Turn speed', value: air.TurnSpeed },
  { text: 'StartTurnDistance ', value: air.StartTurnDistance },
  { text: 'Backup Distance', value: hasReverse ? backupDistance : null },
  { text: 'Backup Speed', value: backupSpeed(1) },
  { text: 'B. Speed (on land)', value: backupSpeed(physics.LandSpeedMultiplier) },
  { text: 'B. Speed (submerged)', value: backupSpeed(physics.SubSpeedMultiplier) },
  { text: 'B. Speed (in water)', value: backupSpeed(physics.WaterSpeedMultiplier) },
  { text: 'B. Speed (sniper mode)', value: backupSpeed(physics.SniperModeSpeedMultiplier) },
  { text: 'Elevation', value: isAir ? physics.Elevation : null, dontSkipZero: true },
  { text: 'Max Hitbox Depth', value: isSubmersible ? physics.MaxHitboxDepth : null, tooltip: hitboxTooltip(' (lower in shallow water)') },
  { text: 'Hitbox Depth', value: isSubmersible && !physics.MaxHitboxDepth ? hitboxDepth : null, tooltip: hitboxTooltip() },
  { text: 'Combat turn speed', value: air.CombatTurnSpeed },
  { text: 'Fuel use time', value: physics.FuelUseTime, format: formatTime },
  { text: 'Fuel recharge', value: 10 * physics.FuelUseTime / physics.FuelRechargeRate, format: formatTime, formatMap: { Infinity: '-' } }
].filter(item => item.value || (item.value === 0 && item.dontSkipZero))
.map(item => item.format ? { ...item, value: item.format(item.value, item.formatMap) } : item)

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
        <LineItem v-for="item in physicsItems" :text="item.text + ':'" :value="item.value" :data-tooltip="item.tooltip?.[0]" :data-tooltip-params="item.tooltip?.[1]" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
</style>
