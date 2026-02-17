<script setup>
import { computed } from 'vue'
import Icon from '../Icon.vue'
import LineItem from './LineItem.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const intel = unit.Intel || {}

const intelConfig = [
  { key: 'VisionRadius', label: 'Vision radius' },
  { key: 'WaterVisionRadius', label: 'Water vision radius' },
  { key: 'RadarRadius', label: 'Radar radius' },
  { key: 'SonarRadius', label: 'Sonar radius' },
  { key: 'RadarStealthFieldRadius', label: 'Radar Stealth radius' },
  { key: 'SonarStealthFieldRadius', label: 'Sonar Stealth radius' },
  { key: 'ReactivateTime', label: 'Reactivate Time' },
  { key: 'MaxVisionRadius', label: 'Max Vision Radius' },
  { key: 'MinVisionRadius', label: 'Min Vision Radius' },
]

const intelItems = intelConfig
  .filter(item => intel[item.key])
  .map(item => ({ text: item.label, value: intel[item.key] }))

const isCompact = computed(() => intelItems.length <= 3)
const isShown = computed(() => intelItems.length > 0)
const expandScore = computed(() => intelItems.length / 3)

defineExpose({ isCompact, isShown, expandScore })
</script>

<template>
  <div class="u2intel uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <Icon class="u2intel__header-icon" name="eye" width="22" />
        <span>Intel</span>
      </h2>
      <div class="uc__section-line">
        <LineItem v-for="item in intelItems" :key="item.text" :text="item.text + ':'" :value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">

.u2intel
  @container (max-width: 330px)
    .uc__section-line
      --columncount: 6
  &__header-icon
    margin: -1px
    fill: white
</style>
