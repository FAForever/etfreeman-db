<template>
  <div class="home">
    <HomeTop />
    <MasonryWall class="home__byclass" :items="sections" :column-width="350" :gap="10" :padding="10">
      <template #default="{ item: section }">
        <div class="home__byclass-base">
          <h1 class="home__byclass-base-title">{{ section.name }}</h1>
          <section v-for="[typeName, unitsByFaction] in Object.entries(section.types)" :key="typeName"
            class="home__byclass-section">
            <div v-for="faction in filterStore.effectiveVisibleFactions" :key="faction" class="home__byclass-faction">
              <ThumbComponent v-for="unit in (unitsByFaction[faction] || [])" :key="unit.id" :item="unit" :mini="true" />
            </div>
            <h2 class="home__byclass-section-title">
              <a class="link-orange" @click="toggleUnitsOfTheSameType(unitsByFaction)">
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
import { useUnitData } from '../composables/useUnitData.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import HomeTop from '../components/HomeTop.vue'
import ThumbComponent from '../components/ThumbComponent.vue'
import { useFilterStore } from '../stores/filterStore.js'

const { typeTree, smartSelect } = useUnitData()
const filterStore = useFilterStore()

const sections = computed(() => {
  return Object.entries(typeTree.value).map(([name, types]) => ({ name, types }))
})

const toggleUnitsOfTheSameType = (unitsByFaction) => {
  const units = Object.values(unitsByFaction).flat()
  smartSelect(units)
}
</script>

<style lang="sass">
.home
  &__byclass
    width: 100%
    padding: 5px

  &__byclass-base
    display: block
    background-color: rgba(0,0,0,.5)
    padding: 10px 5px 0px
    border: 1px solid rgba(255,255,255,.2)
    box-shadow: inset 0 0 30px 5px rgb(0, 0, 0, 1)

  &__byclass-base-title
    font-size: 1.3em
    padding-bottom: 8px

  &__byclass-section
    width: calc(100% + 10px)
    display: flex
    margin: 0 -5px
    --sectionbottompad: 2px
    padding: 4px 0px var(--sectionbottompad) 5px
    &:last-child
      --sectionbottompad: 5px
    &:hover
      background: rgba(255,255,255,.1)
  &__byclass-section-title
    margin-left: 5px
    flex-grow: 1
    font-size: 1em
    font-weight: normal
    font-family: 'Muli', Verdana, Arial, sans-serif
    a
      padding: 5px 8px calc(5px + var(--sectionbottompad)) 0
      margin: -4px 0 calc(var(--sectionbottompad) * (-1))

  &__byclass-faction
    flex-shrink: 0
    min-height: 21px
    width: 24px
    display: block
</style>
