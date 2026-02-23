<script setup>
import { computed } from 'vue'
import LineItem from '../helpers/LineItem.vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const transport = unit.Transport || {}

const transportConfig = [
  { key: 'SlotsSmall', label: 'Small slots' },
  { key: 'Class1Capacity', label: 'Class 1 capacity' },
  { key: 'SlotsMedium', label: 'Medium slots' },
  { key: 'Class2AttachSize', label: 'Class 2 size' },
  { key: 'SlotsLarge', label: 'Large slots' },
  { key: 'Class3AttachSize', label: 'Class 3 size' },
]

const transportItems = transportConfig
  .filter(item => transport[item.key])
  .map(item => ({ text: item.label, value: transport[item.key] }))

const isCompact = computed(() => transportItems.length <= 3)
const isShown = computed(() => showedSections['Transport'] && !!unit.Transport && unit.Transport.AirClass && transportItems.length > 0)
const expandScore = computed(() => transportItems.length / 3)

defineExpose({ name: 'Transport', isCompact, isShown, expandScore })
</script>

<template>
  <div class="utransport uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <span>Transport</span>
      </h2>
      <div class="uc__section-line">
        <LineItem v-for="item in transportItems" :key="item.text" :text="item.text + ':'" :value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
</style>
