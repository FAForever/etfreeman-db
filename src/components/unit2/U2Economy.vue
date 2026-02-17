<script setup>
import { computed } from 'vue'
import Icon from '../Icon.vue'
import LineItem from './LineItem.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const economy = unit.Economy || {}

const economyConfig = [
  { key: 'BuildRate', label: 'Build rate' },
  { key: 'ProductionPerSecondMass', label: 'Mass yield' },
  { key: 'ProductionPerSecondEnergy', label: 'Energy yield' },
  { key: 'MaintenanceConsumptionPerSecondEnergy', label: 'Energy drain' },
  { key: 'StorageMass', label: 'Mass storage' },
  { key: 'StorageEnergy', label: 'Energy storage' },
]

const economyItems = economyConfig
  .filter(item => economy[item.key])
  .map(item => ({ text: item.label, value: economy[item.key] }))

const isCompact = computed(() => economyItems.length <= 3)
const isShown = computed(() => economyItems.length > 0)
const expandScore = computed(() => economyItems.length / 3)

defineExpose({ isCompact, isShown, expandScore })
</script>

<template>
  <div class="u2economy uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <Icon class="u2economy__header-icon" name="growth" width="18" />
        <span>Economy</span>
      </h2>
      <div class="uc__section-line">
        <LineItem v-for="item in economyItems" :key="item.text" :text="item.text + ':'" :value="item.value.toLocaleString()" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.u2economy
  @container (max-width: 330px)
    .uc__section-line
      --columncount: 6
  &__header-icon
    color: #eee
</style>
