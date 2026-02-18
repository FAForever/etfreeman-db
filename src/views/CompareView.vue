<template>
  <div class="compare" :style="{ '--unitwidth': compareStore.unitWidth + 'px', '--uccolumngap': compareStore.unitWidth < 370? '10px' : '20px', '--unitgap': compareStore.gap + 'px' }">
    <header class="compare__tools">
      <button class="compare__tools-back" @click="router.push(lastListViewRoute)" title="back to unit list">
        <svg viewBox="0 0 1228.8 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M267.5 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L268.9 443.784h876.6c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H267.5z"></path></g></svg>
      </button>
      <FilterButton />
      <SettingsButton />
    </header>
    <Resizer :open="compareStore.filterOpen">
      <SectionFilters />
    </Resizer>
    <Resizer :open="compareStore.settingsOpen">
      <div class="compare__settings"><SettingsPanel /></div>
    </Resizer>
    <div class="compare__unitlist" ref="containerRef">
      <UnitRow
        v-for="(row, rowIndex) in unitRows"
        :key="rowIndex"
        :units="row"
        :showedSections="compareStore.showedSections"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitDataStore } from '../stores/unitData.js'
import { useCompareStore } from '../stores/compare.js'
import UnitRow from '../components/UnitRow.vue'
import FilterButton from '../components/FilterButton.vue'
import SettingsButton from '../components/SettingsButton.vue'
import SectionFilters from '../components/SectionFilters.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import Resizer from '../components/ui/Resizer.vue'

const route = useRoute()
const router = useRouter()
const { unitsMap } = useUnitData()
const store = useUnitDataStore()
const compareStore = useCompareStore()
const { lastListViewRoute } = storeToRefs(store)

const containerRef = ref(null)

const units = computed(() => {
  const ids = route.params.ids?.split(',') || []
  return ids.map(id => unitsMap.value[id]).filter(Boolean)
})

const unitsPerRow = ref(1)

const unitRows = computed(() => {
  const perRow = unitsPerRow.value
  const rows = []
  for (let i = 0; i < units.value.length; i += perRow) {
    rows.push(units.value.slice(i, i + perRow))
  }
  return rows
})

let paddingH = null

const onResize = () => {
  if (!containerRef.value || (paddingH === null)) return
  const innerWidth = containerRef.value.clientWidth - paddingH
  const newUnitsPerRow = Math.max(1, Math.floor((innerWidth + compareStore.gap) / (compareStore.unitWidth + compareStore.gap)))
  if (newUnitsPerRow !== unitsPerRow.value) {
    unitsPerRow.value = newUnitsPerRow
  }
}

let prevWidth = 0
const resizeObserver = new ResizeObserver((entries) => {
  const width = entries[0].contentRect.width
  if (width !== prevWidth) {
    prevWidth = width
    onResize()
  }
})

onMounted(() => {
  resizeObserver.observe(containerRef.value)
  const style = getComputedStyle(containerRef.value)
  paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  onResize()
})

onUnmounted(() => resizeObserver.disconnect())

watch(units, u => u.length || router.push(lastListViewRoute.value))

watch(() => compareStore.unitWidth, onResize)
</script>

<style lang="sass">
.compare
  display: flex
  flex-direction: column
  --padding: 8px
  @include for-mob
    --padding: 4px
  &__tools
    display: flex
    align-items: center
    gap: 5px
    padding: var(--padding)
    &-back
      display: inline-flex
      align-items: center
      justify-content: center
      border-radius: 5px
      border: 1px solid var(--bcolor, #888)
      background: var(--bg, #111)
      box-shadow: inset 0 0 var(--insetradius, 4px) 0px var(--scolor, #777)
      transition: all 0.2s
      cursor: pointer
      color: inherit
      height: 30px
      width: 30px
      gap: 5px
      --insetradius: 0px
      svg
        transform-origin: left center
        fill: white
        stroke: white
        stroke-width: 20
        height: 12px
      &:hover
        --insetradius: 10px
        --bg: #050505
        --bcolor: #ddd
      &:active
        --bg: black
        --bcolor: white
        --scolor: black
  &__unitlist
    padding: 0 var(--padding)
  &__settings
    padding: 0 var(--padding) var(--padding)
</style>
