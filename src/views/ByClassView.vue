<template>
  <div class="home">
    <div class="home__left">
      <Header />
      <FiltersComponent class="home__filters" />
    </div>
    <MasonryWall class="home__byclass" :items="groupedByBase" :column-width="320" :gap="10" :padding="10">
      <template #default="{ item: baseGroup }">
        <div class="home__byclass-base">
          <h1 class="home__byclass-base-title" @click="selectAll(baseGroup)">{{ baseGroup.baseClass }}</h1>
          <section v-for="classGroup in baseGroup.classifications" :key="classGroup.classification"
            class="home__byclass-section">
            <div v-for="faction in effectiveVisibleFactions" :key="faction" class="home__byclass-faction">
              <ThumbComponent v-for="unit in classGroup.unitsByFaction[faction]" :key="unit.id" :item="unit"
                :mini="true" @unit-click="handleUnitClick" />
            </div>
            <h2 class="home__byclass-section-title">
              <a class="calm" @click="toggleUnitsOfTheSameClass(classGroup.classification)">
                {{ classGroup.classification }}
              </a>
            </h2>
          </section>
        </div>
      </template>
    </MasonryWall>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitGrouping } from '../composables/useUnitGrouping.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import Header from '../components/Header.vue'
import FiltersComponent from '../components/FiltersComponent.vue'
import ThumbComponent from '../components/ThumbComponent.vue'

const router = useRouter()
const { visibleUnits, toggleUnitSelection, setUnitSelection, contenders, effectiveVisibleFactions } = useUnitData()
const { groupByHierarchy } = useUnitGrouping()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)

const groupedByBase = computed(() => groupByHierarchy(visibleUnits.value))

const toggleUnitsOfTheSameClass = (classification) => {
  const classItems = visibleUnits.value.filter(unit => unit.detailedClassification === classification)
  const isAlreadySelected = classItems.some(u => u.selected)
  classItems.forEach(unit => setUnitSelection(unit.id, !isAlreadySelected))
}

const selectAll = (baseGroup) => {
  baseGroup.classifications.forEach(classification => {
    //toggleUnitsOfTheSameClass(classification.classification)
    const unitsInClass = visibleUnits.value.filter(unit => unit.detailedClassification === classification.classification)
    const beamedUnits = (unitsInClass.flat().filter(el=>el.Weapon?.some(w=>w.BeamLifetime)))
    if (beamedUnits?.length) {
      console.log(beamedUnits.map(u=>u.name))
      for (const unit of beamedUnits) {
        setUnitSelection(unit.id, true)
      }
    }
  })
}
</script>

<style lang="sass">
.home
  width: 100%
  display: flex
  align-items: flex-start
  gap: 10px

  &__left
    flex-shrink: 0

  &__byclass
    padding: 10px
    flex-grow: 1

  &__byclass-base
    display: block
    background: rgba(0,0,0,.5)
    padding: 10px 5px 5px
    border: 1px solid rgba(255,255,255,.2)

  &__byclass-base-title
    font-size: 1.3em
    margin-bottom: 8px

  &__byclass-section
    width: 100%
    display: flex

  &__byclass-section-title
    margin-left: 8px
    margin-right: 8px
    font-size: 1em
    margin: 3px 0
    font-weight: normal
    font-family: 'Muli', Verdana, Arial, sans-serif

  &__byclass-faction
    flex-shrink: 0
    min-height: 21px
    width: 24px
    display: block
</style>
