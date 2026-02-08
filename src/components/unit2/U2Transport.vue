<script setup>
import { computed } from 'vue'
import LineItem from './LineItem.vue'

const { unit } = defineProps(['unit'])

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
</script>

<template>
  <div class="u2transport uc__section" v-if="transportItems.length" :class="{ 'uc__section_compact': isCompact }">
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
.u2transport
</style>
