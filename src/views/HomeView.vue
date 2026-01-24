<template>
  <div class="home">
    <div class="home__top">
      <Header />
      <FiltersComponent class="home__filters" :row="true" />
    </div>
    <div class="home__units" ref="containerRef">
      <div v-for="section in groupSectionsByTier" :key="section.baseClass" class="home__section">
        <div class="home__section-title">{{ section.baseClass }}</div>
        <div class="home__section-content">
          <div v-for="tierGroup in section.tierGroups" :key="tierGroup.tier" class="home__section-tier">
            <div class="home__faction-rows">
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

const sectionsWithTiers = computed(() => {
  return groupedByBase.value.map(section => {
    const tierGroups = {}

    section.classifications.forEach(classGroup => {
      Object.entries(classGroup.unitsByFaction).forEach(([faction, units]) => {
        units.forEach(unit => {
          const tier = unit.tech || 'T1'

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

    return {
      baseClass: section.baseClass,
      tierGroups: Object.values(tierGroups).sort((a, b) => a.sortOrder - b.sortOrder)
    }
  })
})

const { optimalOrder } = useOptimalLayout(sectionsWithTiers, containerWidth)
const groupSectionsByTier = computed(() => optimalOrder.value)

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
.home
  width: 100%
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 10px

  &__left
    flex-shrink: 0
    display: grid
    gap: 10px
    padding-top: 10px

  &__top
    padding-top: 5px
    display: flex
    align-items: center
    gap: 10px

  &__units
    display: flex
    flex-wrap: wrap
    gap: 10px
    align-content: flex-start
    flex-grow: 1
    width: 100%

  &__section
    background: rgba(0,0,0,.1)
    border: 2px solid rgba(255, 255, 255, .6)
    border-bottom: none
    border-radius: 5px
    padding: 0 6px
    &-title
      padding: 3px 0 3px
      font-weight: 700
      font-size: 12px
      text-align: center
      width: 100%
    &-content
      display: flex
  &__section-tier
    display: flex
    flex-direction: column
    gap: 6px
    margin-bottom: 10px
    &:not(:first-child)
      padding-left: 6px
    &:not(:last-child)
      padding-right: 6px
      border-right: 2px dashed rgba(255, 255, 255, .6)

  &__faction-rows
    display: flex
    flex-direction: column
    gap: 6px

  &__faction-row
    display: flex
    flex-wrap: wrap
    gap: 6px
</style>
