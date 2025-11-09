<template>
  <div class="home">
    <div class="home__left">
      <Header />
      <FiltersComponent class="home__filters" />
    </div>
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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import Header from '../components/Header.vue'
import FiltersComponent from '../components/FiltersComponent.vue'
import ThumbComponent from '../components/ThumbComponent.vue'

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
  align-items: flex-start
  gap: 10px
  padding-bottom: 10px

  &__left
    flex-shrink: 0
    display: grid
    gap: 10px
    padding-top: 10px

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
    background-color: black

    @each $faction, $bg in vars.$factionBGs
      &_#{$faction}
        background-image: url($bg)

  &__kind
    display: flex
    flex-direction: column
    gap: 1px
</style>
