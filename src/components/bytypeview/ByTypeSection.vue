<script setup>
import ThumbComponent from '../ThumbComponent.vue'
import { useUnitData } from '@/composables/useUnitData.js'
import { useFilterStore } from '@/stores/filterStore.js'

const props = defineProps(['section'])

const { smartSelect } = useUnitData()
const filterStore = useFilterStore()

const toggleUnitsOfTheSameType = (unitsByFaction) => {
  const units = Object.values(unitsByFaction).flat()
  smartSelect(units)
}
</script>

<template>
  <div class="section">
    <h1 class="section__title">{{ section.name }}</h1>
    <div v-for="[typeName, unitsByFaction] in Object.entries(section.types)" :key="typeName" class="section__type">
      <div v-for="faction in filterStore.effectiveVisibleFactions" :key="faction" class="section__faction">
        <ThumbComponent v-for="unit in (unitsByFaction[faction] || [])" :key="unit.id" :item="unit" :mini="true" />
      </div>
      <div class="section__type-title">
        <a class="link-orange" @click="toggleUnitsOfTheSameType(unitsByFaction)">
          {{ typeName }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.section
  --hpad: 5px
  background-color: rgba(0,0,0,.5)
  border: 1px solid rgba(255,255,255,.2)
  box-shadow: inset 0 0 30px 5px rgb(0, 0, 0, 1)

  &__title
    padding: 10px var(--hpad) 8px
    font-family: var(--titlefont)
    font-size: 20px
    font-weight: 600

  &__type
    display: flex
    padding: 4px var(--hpad) 2px
    &:last-child
      padding-bottom: 5px
    &:hover
      background: rgba(255,255,255,.1)

  &__type-title
    flex-grow: 1
    font-size: 17px
    font-family: Mulish
    margin-left: 5px
    a
      padding: 5px 8px 5px 0
      margin: -4px 0 -1px

  &__faction
    flex-shrink: 0
    width: 24px
</style>
