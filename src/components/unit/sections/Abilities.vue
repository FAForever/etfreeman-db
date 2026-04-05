<script setup>
import { computed } from 'vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const abilities = unit.Display?.Abilities || []

const isCompact = computed(() => abilities.length <= 3)
const isShown = computed(() => showedSections['Abilities'] && abilities.length > 0)
const expandScore = computed(() => abilities.length / 3)

const getTooltip = (ability) => {
  switch(ability) {
    case 'Snipemode':
      return 'ACU can be set as this unit\'s target priority'
    default:
      return null
  }
}

defineExpose({ name: 'Abilities', isCompact, isShown, expandScore })
</script>

<template>
  <div class="uabilities uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Abilities</h2>
      <ul class="uc__section-line">
        <li v-for="ability in abilities" :key="ability" class="uc__li" :data-tooltip="getTooltip(ability)" data-tooltip-params="top-left-humble">{{ ability }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="sass">
</style>
