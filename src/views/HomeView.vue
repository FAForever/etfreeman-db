<template>
  <div class="home">
    <div class="home__top">
      <Header />
      <FiltersComponent class="home__filters" :row="true" />
    </div>
    <div class="home__units" ref="containerRef">
      <div v-for="section in groupSectionsByTier" :key="section.baseClass" class="home__section">
        <div class="home__section-title-wrap">
          <div class="home__section-title">
            <template v-for="(chunk, idx) in section.baseClass.split(' - ')" :key="idx">
              <span>{{ chunk }}</span><span v-if="idx < section.baseClass.split(' - ').length - 1"> - </span>
            </template>
          </div>
        </div>
        <div class="home__section-content" :style="sectionMinWidths[section.baseClass] ? { minWidth: `${sectionMinWidths[section.baseClass]}px` } : undefined">
          <div v-for="(tierGroup, tierIndex) in section.tierGroups" :key="tierGroup.tier" class="home__section-tier">
            <div class="home__faction-rows">
              <div class="home__faction-row home__faction-row--buttons">
                <button v-for="n in (tierButtons[section.baseClass]?.[tierIndex] || 0)"
                  :key="n"
                  @click="selectColumn(tierGroup, n)"
                  class="home__faction-rows-colselect">+</button>
              </div>
              <div v-for="faction in effectiveVisibleFactions" :key="faction"
                :class="['home__faction-row', `home__faction-row--${faction.toLowerCase()}`]">
                <ThumbComponent v-for="unit in tierGroup.unitsByFaction[faction]" :key="unit.id" :item="unit"
                  @unit-click="handleUnitClick" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitGrouping } from '../composables/useUnitGrouping.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import { useOptimalLayout } from '../composables/useOptimalLayout.js'
import Header from '../components/Header.vue'
import FiltersComponent from '../components/FiltersComponent.vue'
import ThumbComponent from '../components/ThumbComponent.vue'

const router = useRouter()
const { visibleUnits, toggleUnitSelection, contenders, effectiveVisibleFactions } = useUnitData()
const { groupByHierarchy } = useUnitGrouping()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)

const groupedByBase = computed(() => groupByHierarchy(visibleUnits.value))

const containerRef = ref(null)
const scrollbarGap = 10
const rawWidth = ref(document.body.offsetWidth)
const containerWidth = computed(() => rawWidth.value - scrollbarGap)

// Transform sections to have tierGroups before optimal layout
const tierOrder = { 'T1': 1, 'T2': 2, 'T3': 3, 'EXP': 4 }

const tierButtons = {
  'Land': [5, 6, 3],
  'Air': [4, 4, 4],
  'Naval': [2, 3, 1],
  'Structures - Weapons': [3, 6, 4],
  'Construction - Buildpower': [2, 1, 2],
  'Structures - Economy': [5, 3, 3],
  'Structures - Intelligence': [2, 3, 2],
  'Structures - Support': [2, 1, 1],
  'Structures - Factories': [3, 6, 7],
  'Experimental': [1]
}

const sectionMinWidths = {
  'Structures - Intelligence': 60,
  'Construction - Buildpower': 60,
  'Experimental': 70
}

const sectionsWithTiers = computed(() => {
  return groupedByBase.value.map(section => {
    const tierGroups = {}

    section.classifications.forEach(classGroup => {
      Object.entries(classGroup.unitsByFaction).forEach(([faction, units]) => {
        units.forEach(unit => {
          const tier = unit.tech || 'T1'
          if (unit.Id == 'XEB0204') {
            console.log(unit)
            console.log("TIER")
            console.log(tier)
          }


          if (!tierGroups[tier]) {
            tierGroups[tier] = {
              tier,
              sortOrder: tierOrder[tier] || 99,
              unitsByFaction: { UEF: [], Cybran: [], Aeon: [], Seraphim: [], Nomads: [] }
            }
          }

          tierGroups[tier].unitsByFaction[faction].push(unit)
        })
      })
    })

    // Sort units in each tier->faction by sortOrder (only if has customOrder > 1e20)
    Object.values(tierGroups).forEach(tier => {
      Object.keys(tier.unitsByFaction).forEach(faction => {
        const needsSort = tier.unitsByFaction[faction].some(u => u.sortOrder > 1e20)
        if (needsSort) {
          tier.unitsByFaction[faction].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        }
      })
    })

    return {
      baseClass: section.baseClass,
      tierGroups: Object.values(tierGroups).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  })
})

const { optimalOrder } = useOptimalLayout(sectionsWithTiers, containerWidth)
const groupSectionsByTier = computed(() => optimalOrder.value)

const selectColumn = (tierGroup, index) => {
  const columnUnits = Object.values(tierGroup.unitsByFaction)
    .map(units => units[index - 1])
    .filter(Boolean)

  const allSelected = columnUnits.every(u => u.selected)

  if (allSelected) {
    columnUnits.forEach(u => toggleUnitSelection(u.id))
  } else {
    columnUnits.forEach(u => {
      if (!u.selected) toggleUnitSelection(u.id)
    })
  }
}

const updateWidth = () => {
  if (containerRef.value) {
    rawWidth.value = containerRef.value.clientWidth
  }
}

onMounted(() => {
  updateWidth()
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>

<style lang="sass">
body.scrolled .home__top
  background: rgba(0,0,0,.75)
  backdrop-filter: blur(5px)

.home
  width: 100%
  display: flex
  flex-direction: column
  align-items: flex-start

  &__left
    flex-shrink: 0
    display: grid
    gap: 10px
    padding-top: 10px

  &__top
    padding: 5px 0 10px
    display: flex
    align-items: center
    gap: 10px
    top: 0
    width: 100%
    position: sticky
    z-index: 1
    backdrop-filter: blur(0px)
    transition: .3s ease-out

  &__units
    display: flex
    flex-wrap: wrap
    gap: 10px
    align-content: flex-start
    flex-grow: 1
    width: 100%

  &__section
    background: rgba(0,0,0,.35)
    border: 2px solid rgba(255, 255, 255, .6)
    border-bottom-color: rgba(255, 255, 255, .15)
    border-radius: 5px
    padding: 0 6px 7px
    backdrop-filter: blur(1px)
    &-title-wrap
      container-type: inline-size
      white-space: nowrap
    &-title
      padding: 5px 0 8px
      font-weight: 700
      font-size: 16px
      letter-spacing: 0.1em
      text-align: center
      width: 100%
      @container (max-width: 250px)
        span:not(:last-child)
          display: none
      @container (max-width: 150px)
        font-size: 14px
        letter-spacing: 0
      @container (max-width: 100px)
        font-size: 12px
        letter-spacing: 0

    &-content
      display: flex
  &__section-tier
    display: flex
    flex-direction: column
    gap: 6px
    &:not(:first-child)
      padding-left: 6px
    &:not(:last-child)
      padding-right: 6px
      border-right: 2px dashed rgba(255, 255, 255, .6)

  &__faction-rows
    display: flex
    flex-direction: column
    gap: 6px
    position: relative
    z-index: 1

  &__faction-row
    display: flex
    flex-wrap: wrap
    gap: 6px
    &:empty
      display: none
    &--buttons
      position: absolute
      z-index: -1

  &__faction-rows-colselect
    width: 48px
    display: flex
    align-items: center
    justify-content: center
    font-size: 10px
    font-weight: 700
    color: white
    border-radius: 4px
    border: 1px solid var(--bcolor, #aaa)
    opacity: 0
    pointer-events: auto
    transition: opacity 0.1s, transform 0.1s
    position: relative
    background: var(--bg,black)
    transition-delay: 0.3s
    box-shadow: inset 0 0 4px 0px var(--scolor, #777)
    z-index: -1
    &:hover
      --bg: #050505
      --bcolor: #ccc
      --scolor: #999
    &:active
      --bg: #111
      --bcolor: white
      --scolor: #aaa
      transform: scale(0.99) translateY(-14.5px) !important

    &::before, &::after
      content: ''
      z-index: -1
      opacity: 1
      position: absolute
      bottom: -15px
      left: 0
      right: 0
      width: 100%
      height: 15px
    &::after
      bottom: initial
      top: -15px
    &:hover
      transition-delay: 0s !important
      opacity: 1
      transform: translateY(-15px)

@for $i from 1 through 10
  .home__section-tier:has(> .home__faction-rows > .home__faction-row:not(.home__faction-row--buttons) > a:nth-of-type(#{$i}):hover) .home__faction-row--buttons button:nth-of-type(#{$i})
    opacity: 1
    transform: translateY(-15px)
    transition-delay: 0s !important

</style>
