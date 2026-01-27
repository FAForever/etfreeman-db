<template>
  <div class="home">
    <HomeTop />
    <MasonryWall class="home__byclass" :items="sections" :column-width="320" :gap="10" :padding="10">
      <template #default="{ item: section }">
        <div class="home__byclass-base">
          <h1 class="home__byclass-base-title">{{ section.name }}</h1>
          <section v-for="[typeName, unitsByFaction] in Object.entries(section.types)" :key="typeName"
            class="home__byclass-section">
            <div v-for="faction in filterStore.effectiveVisibleFactions" :key="faction" class="home__byclass-faction">
              <ThumbComponent v-for="unit in (unitsByFaction[faction] || [])" :key="unit.id" :item="unit" :mini="true"
                @unit-click="handleUnitClick" />
            </div>
            <h2 class="home__byclass-section-title">
              <a class="calm" @click="toggleUnitsOfTheSameClass(typeName)">
                {{ typeName }}
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
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import HomeTop from '../components/HomeTop.vue'
import ThumbComponent from '../components/ThumbComponent.vue'
import { useFilterStore } from '../stores/filterStore.js'

const router = useRouter()
const { visibleUnits, toggleUnitSelection, setUnitSelection, contenders, typeTree } = useUnitData()
const filterStore = useFilterStore()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)

const sections = computed(() => {
  return Object.entries(typeTree.value).map(([name, types]) => ({ name, types }))
})

const toggleUnitsOfTheSameClass = (typeName) => {
  const classItems = visibleUnits.value.filter(unit => unit.type === typeName)
  const isAlreadySelected = classItems.some(u => u.selected)
  classItems.forEach(unit => setUnitSelection(unit.id, !isAlreadySelected))
}
</script>

<style lang="sass">
.home
  &__byclass
    width: 100%
    padding: 5px

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
