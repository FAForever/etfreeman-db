<template>
  <div class="compare__unitlist-line" :style="{ '--units-per-row': units.length }" :class="{ 'compare__unitlist-line--no-align': !compareStore.linedUpSections }">
    <UnitComponent2
      v-for="(u, colIndex) in units"
      :ref="el => setUnitRef(el, colIndex)"
      :key="u.id"
      :unit="u"
      :showedSections="showedSections"
      :sectionOrder="sectionOrder"
      :compactOverrides="compactOverrides"
      :linedUp="compareStore.linedUpSections"
      :style="{ gridColumn: colIndex + 1 }"
      :class="{ 'uc--initializing': !isReady }"
    />
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { useCompareStore } from '../stores/compare.js'
import UnitComponent2 from './UnitComponent2.vue'

const props = defineProps(['units', 'showedSections'])
const compareStore = useCompareStore()

const DEFAULT_ORDER = ['header', 'defense', 'economy', 'offense', 'physics',
  'abilities', 'intel', 'transport', 'veterancy', 'wreckage', 'enhancements']

const unitRefs = ref([])
const isReady = ref(false)

const setUnitRef = (el, index) => {
  if (el) unitRefs.value[index] = el
}

const sectionOrder = computed(() => {
  if (unitRefs.value.length !== props.units.length) return DEFAULT_ORDER
  if (unitRefs.value.some(r => !r?.sections)) return DEFAULT_ORDER

  const shownKeysPerUnit = unitRefs.value.map(ref =>
    ref.sections.filter(s => s.show).map(s => s.key)
  )

  const occurrenceCount = {}
  for (const keys of shownKeysPerUnit) {
    for (const key of keys) {
      occurrenceCount[key] = (occurrenceCount[key] || 0) + 1
    }
  }

  const orderIndex = Object.fromEntries(DEFAULT_ORDER.map((k, i) => [k, i]))

  return Object.keys(occurrenceCount).sort((a, b) => {
    const countDiff = occurrenceCount[b] - occurrenceCount[a]
    if (countDiff !== 0) return countDiff
    return (orderIndex[a] ?? 99) - (orderIndex[b] ?? 99)
  })
})

const compactOverrides = computed(() => {
  if (!compareStore.linedUpSections) return {}
  if (props.units.length <= 1) return {}
  if (unitRefs.value.some(r => !r?.sections)) return {}

  const shownKeysPerUnit = unitRefs.value.map(ref =>
    ref.sections.filter(s => s.show).map(s => s.key)
  )

  const occurrenceCount = {}
  for (const keys of shownKeysPerUnit) {
    for (const key of keys) {
      occurrenceCount[key] = (occurrenceCount[key] || 0) + 1
    }
  }

  const multiUnitKeys = Object.keys(occurrenceCount).filter(k => occurrenceCount[k] >= 2)

  const overrides = {}
  for (const key of multiUnitKeys) {
    const sectionData = unitRefs.value.map(r => r.sections.find(s => s.key === key)).filter(Boolean)
    if (sectionData.length < 2) continue

    const compactnesses = sectionData.map(s => s.compact)
    const allSame = compactnesses.every(c => c === compactnesses[0])
    if (allSame) continue

    const maxScore = Math.max(...sectionData.map(s => s.expandScore || 0))
    overrides[key] = maxScore <= 1.9
  }

  return overrides
})

watch(() => unitRefs.value.length, (len) => {
  if (len === props.units.length) {
    nextTick(() => isReady.value = true)
  }
}, { immediate: true })
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
  &--no-align
    align-items: start

.uc--initializing
  visibility: hidden
</style>
