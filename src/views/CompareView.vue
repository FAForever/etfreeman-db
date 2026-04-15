<script setup>
import { computed, ref, watch } from 'vue'
import { useUnitData } from '@/composables/useUnitData.js'
import { useCompareStore } from '@/stores/compare'
import { toPreferredView } from '../router'
import { useUnitsPerRow } from '@/composables/useUnitsPerRow.js'
import UnitRow from '../components/compare/UnitRow.vue'
import BackButton from '../components/compare/BackButton.vue'
import FilterButton from '../components/compare/FilterButton.vue'
import SettingsButton from '../components/compare/SettingsButton.vue'
import SectionFilters from '../components/compare/SectionFilters.vue'
import SettingsPanel from '../components/compare/SettingsPanel.vue'
import Resizer from '../components/ui/Resizer.vue'

const { unitsMap } = useUnitData()
const compareStore = useCompareStore()

const containerRef = ref(null)
const { unitsPerRow } = useUnitsPerRow(containerRef)
const units = computed(() => compareStore.unitIDs.map(id => unitsMap.value[id]).filter(Boolean))
watch(units, u => u.length || toPreferredView())
const unitRows = computed(() =>
  Array.from({ length: Math.ceil(units.value.length / unitsPerRow.value) },
    (_, i) => units.value.slice(i * unitsPerRow.value, (i + 1) * unitsPerRow.value))
)
</script>

<template>
  <div class="compare" :style="{
    '--unitwidth': compareStore.unitWidth + 'px',
    '--uccolumngap': compareStore.unitWidth < 370 ? '10px' : '20px',
    '--unitgap': compareStore.gap + 'px'
  }">
    <header class="compare__tools">
      <BackButton />
      <FilterButton />
      <SettingsButton />
    </header>
    <Resizer :open="compareStore.settingsOpen">
      <div class="compare__settings">
        <SettingsPanel />
      </div>
    </Resizer>
    <Resizer :open="compareStore.filterOpen">
      <SectionFilters class="compare__filters" />
    </Resizer>
    <div class="compare__unitlist" ref="containerRef">
      <UnitRow v-for="row in unitRows" :units="row"/>
    </div>
  </div>
</template>

<style lang="sass">
.compare
  --padding: 8px
  padding: 0 var(--padding)
  @include for-mob
    --padding: 4px
  &__tools
    display: flex
    align-items: center
    gap: 5px
    padding: var(--padding) 0
  &__settings, &__filters, &__unitlist
    padding-bottom: var(--padding)
</style>
