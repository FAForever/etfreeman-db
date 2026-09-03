<script setup>
import ThumbComponent from '../ThumbComponent.vue'
import { computed } from 'vue'
import { useUnitData } from '@/composables/useUnitData.js'
import { useFilterStore } from '@/stores/filterStore.js'
import { useSmartIconScaling } from '@/composables/useSmartIconScaling.js'

defineProps(['section'])

const { smartSelect } = useUnitData()
const filterStore = useFilterStore()
const { iconsScaled, scaleRatio } = useSmartIconScaling()

const sizeClass = computed(() => {
  if (!iconsScaled.value) return null
  if (scaleRatio.value > 1.5) return 'section_scaled'
  if (scaleRatio.value > 1.2) return 'section_scaled-small'
  return null
})

const toggleUnitsOfTheSameType = (unitsByFaction) => {
  const units = Object.values(unitsByFaction).flat()
  smartSelect(units)
}

const hasSelected = (unitsByFaction) => {
  const units = filterStore.effectiveVisibleFactions.flatMap(f => unitsByFaction[f] || [])
  return units.some(u => u.selected)
}
</script>

<template>
  <div class="section" :class="[{ section_experimental: iconsScaled }, sizeClass]" :style="{ '--icon-scale-ratio': iconsScaled ? scaleRatio : null, '--icon-rendering': iconsScaled ? 'pixelated' : null }">
    <h1 class="section__title">{{ section.name }}</h1>
    <div v-for="[typeName, unitsByFaction] in Object.entries(section.types)" :key="typeName" class="section__type" :class="{ active: hasSelected(unitsByFaction) }">
      <div v-for="faction in filterStore.effectiveVisibleFactions" :key="faction" class="section__faction">
        <ThumbComponent v-for="unit in (unitsByFaction[faction] || [])" :key="unit.id" :item="unit" :mini="true" />
      </div>
      <div class="section__type-title">
        <a class="link-orange" @click="toggleUnitsOfTheSameType(unitsByFaction)">
          <span>{{ typeName }}</span>
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

  &_experimental
    --experimental-disable-icon-scaling: calc(1 / var(--app-zoom))

  &_scaled-small
    --thumb-width: calc(25px / var(--app-zoom) * 1.2)

  &_scaled
    --thumb-width: calc(30px / var(--app-zoom) * 1.2)
    --thumb-height: calc(25px / var(--app-zoom) * 1.2)

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
    &.active
      background: color.adjust(#fda005, $alpha: -.8, $lightness: 15%)

  &__type-title
    flex-grow: 1
    font-size: 17px
    font-family: Mulish
    margin-left: 5px
    display: flex
    align-items: stretch
    a
      flex-grow: 1
      span
        min-height: var(--thumb-height, 21px)
        margin-top: -1px
        display: flex
        align-items: center

  &__faction
    flex-shrink: 0
    width: calc(var(--thumb-width, 21px) + 3px)
</style>
