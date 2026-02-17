<template>
  <div class="compare">
    <header class="compare__tools">
      <button class="compare__tools-back" @click="router.push(lastListViewRoute)" title="back to unit list">
        <svg viewBox="0 0 1228.8 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M267.5 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L268.9 443.784h876.6c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H267.5z"></path></g></svg>
        back
      </button>
      <SectionToggles ref="sectionTogglesRef" />
    </header>
    <div class="compare__unitlist" ref="containerRef">
      <UnitRow
        v-for="(row, rowIndex) in unitRows"
        :key="rowIndex"
        :units="row"
        :showedSections="sectionTogglesRef?.showedSections"
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
import UnitRow from '../components/UnitRow.vue'
import SectionToggles from '../components/SectionToggles.vue'

const route = useRoute()
const router = useRouter()
const { unitsMap } = useUnitData()
const store = useUnitDataStore()
const { lastListViewRoute } = storeToRefs(store)

const sectionTogglesRef = ref(null)
const containerRef = ref(null)

const UNIT_WIDTH = 370
const GAP = 8

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
  const newUnitsPerRow = Math.max(1, Math.floor((innerWidth + GAP) / (UNIT_WIDTH + GAP)))
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
</script>

<style lang="sass">
.compare
  display: flex
  flex-direction: column
  &__tools
    position: sticky
    top: 0
    display: flex
    align-items: center
    gap: 5px
    padding: 8px
    z-index: 1000
    backdrop-filter: blur(0px)
    transition: .3s ease-out
    &-back
      display: flex
      align-items: center
      background: rgba(255, 255, 255, 0.05)
      border: 1px solid rgba(255, 255, 255, .5)
      border-radius: 2px
      color: #fff
      padding: 3px 8px
      cursor: pointer
      font-size: 0.85em
      font-weight: 500
      transition: opacity 0.2s
      gap: 3px
      svg
        transform-origin: left center
        fill: white
        stroke: white
        stroke-width: 20
        height: 12px
      &:hover
        background: rgba(255, 255, 255, 0.15)
  &__unitlist
    padding: 0 8px

body.scrolled .compare__tools
  background: rgba(0,0,0,.75)
  backdrop-filter: blur(5px)
</style>
