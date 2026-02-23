<template>
  <div class="compare__unitlist-line" :style="{ '--units-per-row': units.length }"
    :class="{ 'compare__unitlist-line_no-align': !compareStore.toggles.linedUpSections }">
    <UnitComponent2 v-for="(u, colIndex) in units" :ref="el => setUnitRef(el, colIndex)" :key="u.id" :unit="u"
      :showedSections="showedSections"
      :sectionOrder="sectionOrder" :compactOverrides="compactOverrides" :linedUp="compareStore.toggles.linedUpSections"
      :style="{ gridColumn: colIndex + 1 }"
      :class="{ 'uc_initializing': !isReady }" />
  </div>
</template>

<script setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useCompareStore } from '../stores/compare'
import { useRowAlignment } from '../composables/useRowAlignment.js'
import UnitComponent2 from './UnitComponent2.vue'

const props = defineProps(['units', 'showedSections'])
const { units } = toRefs(props)
const compareStore = useCompareStore()

const unitRefs = ref([])

const setUnitRef = (el, index) => {
  if (el) unitRefs.value[index] = el
}

watch(() => props.units, () => {
  unitRefs.value = []
})

const { isReady, sectionOrder, compactOverrides } = useRowAlignment(unitRefs, units)
</script>

<style lang="sass">
.compare__unitlist-line
  display: grid
  grid-template-columns: repeat(var(--units-per-row, 4), var(--unitwidth))
  grid-template-rows: 1fr
  @include from(400px)
    grid-template-columns: minmax(100%, var(--unitwidth))
  gap: 0 var(--unitgap)
  &:not(:last-child)
    margin-bottom: var(--unitgap)
  &_no-align
    align-items: start

.uc_initializing
  visibility: hidden
</style>
