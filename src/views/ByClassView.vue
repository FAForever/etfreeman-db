<template>
  <div class="home">
    <div class="home__byclass">
      <div v-for="baseGroup in groupedByBase" :key="baseGroup.baseClass" class="home__byclass-base">
        <h1 class="home__byclass-base-title">{{ baseGroup.baseClass }}</h1>
        <section v-for="classGroup in baseGroup.classifications" :key="classGroup.classification" class="home__byclass-section">
          <div v-for="faction in effectiveVisibleFactions" :key="faction" class="home__byclass-faction">
            <ThumbComponent
              v-for="unit in classGroup.unitsByFaction[faction]"
              :key="unit.id"
              :item="unit"
              :mini="true"
              @unit-click="handleUnitClick"
            />
          </div>
          <h2 class="home__byclass-section-title">
            <a class="calm" @click="toggleUnitsOfTheSameClass(classGroup.classification)">
              {{ classGroup.classification }}
            </a>
          </h2>
        </section>
      </div>
    </div>
    <FiltersComponent class="home__filters" />
  </div>
  <AppFooter />
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitGrouping } from '../composables/useUnitGrouping.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import FiltersComponent from '../components/FiltersComponent.vue'
import ThumbComponent from '../components/ThumbComponent.vue'
import AppFooter from '../components/AppFooter.vue'

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
</script>

<style lang="sass">
.home
  &__byclass
    display: flex
    flex-wrap: wrap
    gap: 10px
    padding: 10px
    align-items: flex-start

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
    min-height: 21px
    width: 24px
    display: block
</style>
