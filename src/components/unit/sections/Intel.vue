<script setup>
import { computed } from 'vue'
import LineItem from '../helpers/LineItem.vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const intel = unit.Intel || {}
const isWater = ['amph', 'sea'].includes((unit.General?.Icon || '').split('/')[0])
const intelConfig = [
  { key: 'OmniRadius', label: 'Omni radius' },
  { label: 'Vision radius', value: intel.MaxVisionRadius ? null : (intel.VisionRadius ?? 10) },
  { label: 'Water vision radius', value: isWater ? (intel.WaterVisionRadius ?? 10) : null },
  { key: 'RadarRadius', label: 'Radar radius' },
  { key: 'SonarRadius', label: 'Sonar radius' },
  { key: 'RadarStealthFieldRadius', label: 'Radar Stealth radius' },
  { key: 'SonarStealthFieldRadius', label: 'Sonar Stealth radius' },
  { key: 'ReactivateTime', label: 'Reactivate Time' },
  { key: 'MaxVisionRadius', label: 'Max Vision Radius' },
  { key: 'MinVisionRadius', label: 'Min Vision Radius' },
  { key: 'RemoteViewingRadius', label: 'Remote View Radius' },
]

const intelItems = intelConfig
  .filter(item => item.value !== undefined ? item.value : intel[item.key])
  .map(item => ({ text: item.label, value: item.value !== undefined ? item.value : intel[item.key] }))

const isCompact = computed(() => intelItems.length <= 3)
const isShown = computed(() => showedSections['Intel'] && intelItems.length > 0)
const expandScore = computed(() => intelItems.length / 3)

defineExpose({ name: 'Intel', isCompact, isShown, expandScore })
</script>

<template>
  <div class="uintel uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Intel</h2>
      <div class="uc__section-line">
        <LineItem v-for="item in intelItems" :text="item.text + ':'" :value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">

.uintel
  @container (max-width: 300px)
    .uc__section-line
      --columncount: 6
</style>
