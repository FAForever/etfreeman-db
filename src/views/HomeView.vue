<template>
  <div class="home">
    <div class="home__units" :style="{ '--factionCount': effectiveVisibleFactions.length }">
      <template v-for="faction in effectiveVisibleFactions" :key="faction">
        <h1 :class="['home__faction-header', `home__faction-header_${faction.toLowerCase()}`]">
          {{ faction }}
        </h1>
        <div v-for="displayClassification in displayClassifications" :key="`${faction}-${displayClassification}`"
          :class="['home__kind', `home__kind--${displayClassification.toLowerCase()}`]">
          <ThumbComponent v-for="unit in getUnitsForFactionAndDisplay(faction, displayClassification)" :key="unit.id"
            :item="unit" @unit-click="handleUnitClick" />
        </div>
      </template>
    </div>
    <FiltersComponent class="home__filters" />
  </div>
  <AppFooter />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import FiltersComponent from '../components/FiltersComponent.vue'
import ThumbComponent from '../components/ThumbComponent.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()
const { visibleUnits, toggleUnitSelection, contenders, effectiveVisibleFactions } = useUnitData()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)

const displayClassifications = ['Build', 'Support', 'Defenses', 'Land', 'Air', 'Naval']

function getUnitsForFactionAndDisplay(faction, displayClassification) {
  return visibleUnits.value
    .filter(unit => unit.faction === faction && unit.displayClassification === displayClassification)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
</script>

<style lang="sass">
.home
  width: 100%
  display: flex
  justify-content: space-between
  align-items: flex-start
  gap: 10px

  &__filters
    position: static
    max-width: 153px
    margin-left: 3px

  &__units
    display: grid
    grid-template-columns: repeat(calc(var(--factionCount) * 6), 1fr)
    flex-grow: 1
    gap: 0 1px
    max-width: calc(var(--factionCount) * 6 * 64px + (var(--factionCount) * 6 - 1) * 1px)

  &__faction-header
    order: -1
    grid-column: span 6
    margin: 0 0 1px
    padding: 0.67em 0
    background: no-repeat right top
    padding-left: 0.33em

    @each $faction, $bg in vars.$factionBGs
      &_#{$faction}
        background-image: url($bg)

  &__kind
    display: flex
    flex-direction: column
    gap: 1px
</style>
