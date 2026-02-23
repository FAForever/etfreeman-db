<template>
  <div class="unitRow" :style="{ '--units-per-row': units.length }"
    :class="{ 'unitRow_no-align': !compareStore.toggles.linedUpSections, 'unitRow_initializing': !isReady }">
    <UnitComponent v-for="(u, colIndex) in units" :ref="el => setUnitRef(el, colIndex)" :key="u.id" :unit="u"
      :sectionOrder="sectionOrder" :compactOverrides="compactOverrides"/>
  </div>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue'
import { useCompareStore } from '../stores/compare'
import { useRowAlignment } from '../composables/useRowAlignment.js'
import UnitComponent from './UnitComponent.vue'

const props = defineProps(['units'])
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
.unitRow
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
    --uc-template-rows: auto
  &_initializing
    visibility: hidden
</style>
