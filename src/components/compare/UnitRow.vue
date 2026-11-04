<template>
  <div class="unitRow" :style="{ '--units-per-row': units.length }"
    :class="{ 'unitRow_initializing': !isReady }">
    <UnitComponent v-for="u in units" ref="unitRefs" :key="u.id" :unit="u"
      :sectionOrder="sectionOrder" :compactOverrides="compactOverrides"/>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue'
import { useRowAlignment } from '@/composables/useRowAlignment.js'
import UnitComponent from '../UnitComponent.vue'

const props = defineProps(['units'])
const unitRefs = ref([])

const { isReady, sectionOrder, compactOverrides } = useRowAlignment(unitRefs, toRef(props, 'units'))
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
  @include from(699.98px)
    align-items: start
    --uc-template-rows: auto
  &_initializing
    visibility: hidden
</style>
