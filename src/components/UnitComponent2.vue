<template>
  <div class="uc faction" :class="[unit.faction.toLowerCase(), { 'uc--no-subgrid': !linedUp }]" :style="{ gridRow: `span ${rowCount}` }">
    <U2Header ref="headerRef" :unit="unit" :style="{ order: getOrder('header') }" />
    <U2Defense ref="defenseRef" v-if="showedSections?.Defense" :unit="unit" :compactOverride="getCompactOverride('defense')" :style="{ order: getOrder('defense') }" />
    <U2Economy ref="economyRef" v-if="showedSections?.Economy" :unit="unit" :compactOverride="getCompactOverride('economy')" :style="{ order: getOrder('economy') }" :class="getOrder('economy') == sortedSections.length - 1? 'last':''" />
    <U2Offense ref="offenseRef" v-if="showedSections?.Offense" :unit="unit" :weapons="unit.Weapon" :compactOverride="getCompactOverride('offense')" :style="{ order: getOrder('offense') }" />
    <U2Physics ref="physicsRef" v-if="showedSections?.Physics" :unit="unit" :compactOverride="getCompactOverride('physics')" :style="{ order: getOrder('physics') }" />
    <U2Abilities ref="abilitiesRef" v-if="showedSections?.Abilities" :unit="unit" :compactOverride="getCompactOverride('abilities')" :style="{ order: getOrder('abilities') }" />
    <U2Intel ref="intelRef" v-if="showedSections?.Intel" :unit="unit" :compactOverride="getCompactOverride('intel')" :style="{ order: getOrder('intel') }" />
    <U2Transport ref="transportRef" v-if="showedSections?.Transport" :unit="unit" :compactOverride="getCompactOverride('transport')" :style="{ order: getOrder('transport') }" />
    <U2Veterancy ref="veterancyRef" v-if="showedSections?.Veterancy" :unit="unit" :compactOverride="getCompactOverride('veterancy')" :style="{ order: getOrder('veterancy') }" />
    <U2Wreckage ref="wreckageRef" v-if="showedSections?.Wreckage" :unit="unit" :compactOverride="getCompactOverride('wreckage')" :style="{ order: getOrder('wreckage') }" />
    <U2Enhancements ref="enhancementsRef" v-if="showedSections?.Enhancements" :unit="unit" :style="{ order: getOrder('enhancements') }" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCompareStore } from '../stores/compare.js'
import U2Abilities from './unit2/U2Abilities.vue';
import U2Defense from './unit2/U2Defense.vue';
import U2Economy from './unit2/U2Economy.vue';
import U2Enhancements from './unit2/U2Enhancements.vue';
import U2Header from './unit2/U2Header.vue';
import U2Intel from './unit2/U2Intel.vue';
import U2Offense from './unit2/U2Offense.vue';
import U2Physics from './unit2/U2Physics.vue';
import U2Transport from './unit2/U2Transport.vue';
import U2Veterancy from './unit2/U2Veterancy.vue';
import U2Wreckage from './unit2/U2Wreckage.vue';

const props = defineProps(['unit', 'showedSections', 'sectionOrder', 'compactOverrides', 'linedUp'])
const compareStore = useCompareStore()

const DEFAULT_ORDER = ['header', 'defense', 'economy', 'offense', 'physics',
  'abilities', 'intel', 'transport', 'veterancy', 'wreckage', 'enhancements']

const headerRef = ref(null)
const defenseRef = ref(null)
const economyRef = ref(null)
const offenseRef = ref(null)
const physicsRef = ref(null)
const abilitiesRef = ref(null)
const intelRef = ref(null)
const transportRef = ref(null)
const veterancyRef = ref(null)
const wreckageRef = ref(null)
const enhancementsRef = ref(null)

const sections = computed(() => {
  const s = props.showedSections || {}
  return [
    { key: 'header', show: true, compact: false, expandScore: 0 },
    { key: 'defense', show: s.Defense && defenseRef.value?.isShown, compact: defenseRef.value?.isCompact, expandScore: defenseRef.value?.expandScore || 0 },
    { key: 'economy', show: s.Economy && economyRef.value?.isShown, compact: economyRef.value?.isCompact, expandScore: economyRef.value?.expandScore || 0 },
    { key: 'offense', show: s.Offense && offenseRef.value?.isShown, compact: offenseRef.value?.isCompact, expandScore: offenseRef.value?.expandScore || 0 },
    { key: 'physics', show: s.Physics && physicsRef.value?.isShown, compact: physicsRef.value?.isCompact, expandScore: physicsRef.value?.expandScore || 0 },
    { key: 'abilities', show: s.Abilities && abilitiesRef.value?.isShown, compact: abilitiesRef.value?.isCompact, expandScore: abilitiesRef.value?.expandScore || 0 },
    { key: 'intel', show: s.Intel && intelRef.value?.isShown, compact: intelRef.value?.isCompact, expandScore: intelRef.value?.expandScore || 0 },
    { key: 'transport', show: s.Transport && transportRef.value?.isShown, compact: transportRef.value?.isCompact, expandScore: transportRef.value?.expandScore || 0 },
    { key: 'veterancy', show: s.Veterancy && veterancyRef.value?.isShown, compact: veterancyRef.value?.isCompact, expandScore: veterancyRef.value?.expandScore || 0 },
    { key: 'wreckage', show: s.Wreckage && wreckageRef.value?.isShown, compact: true, expandScore: wreckageRef.value?.expandScore || 0 },
    { key: 'enhancements', show: s.Enhancements && enhancementsRef.value?.isShown, compact: false, expandScore: 0 },
  ]
})

const sortedSections = computed(() => {
  const order = props.sectionOrder || DEFAULT_ORDER
  const orderIndex = Object.fromEntries(order.map((k, i) => [k, i]))
  return sections.value
    .filter(s => s.show)
    .map(s => ({
      ...s,
      compact: compareStore.compactSections ? (props.compactOverrides?.[s.key] ?? s.compact) : false
    }))
    .sort((a, b) => (orderIndex[a.key] ?? 99) - (orderIndex[b.key] ?? 99))
})

const expandedKeys = computed(() => {
  const expanded = new Set()
  const secs = sortedSections.value
  let total = 0

  for (let i = 0; i < secs.length; i++) {
    const sec = secs[i]

    if (total % 1) {
      total += sec.compact ? 0.5 : 1.5
    } else {
      total += sec.compact ? 0.5 : 1
    }

    if (total % 1) {
      const nextSec = secs[i + 1]
      if (!nextSec || !nextSec.compact) {
        expanded.add(sec.key)
      }
    }
  }
  return expanded
})

const rowCount = computed(() => {
  let total = 0
  for (const sec of sortedSections.value) {
    if (total % 1) {
      total += sec.compact ? 0.5 : 1.5
    } else {
      total += sec.compact ? 0.5 : 1
    }
  }
  return Math.ceil(total)
})

const sectionOrderIndex = computed(() => {
  const map = {}
  const order = props.sectionOrder || DEFAULT_ORDER
  order.forEach((key, index) => map[key] = index)
  return map
})

const getOrder = (key) => sectionOrderIndex.value[key] ?? 99

const getCompactOverride = (key) => {
  if (!compareStore.compactSections) return false
  if (expandedKeys.value.has(key)) return false
  return props.compactOverrides?.[key]
}

defineExpose({ sections })
</script>

<style lang="sass">
@use 'sass:selector'
@each $name, $color in colors.$factions2
  .#{$name}
    --titlebg: #{color.adjust($color, $alpha: -0.1)}
    --factioncolor: #{$color}
    --factioncolortrans: #{color.adjust($color, $alpha:-.1)}
    --factioncolorsol: #{color.adjust($color, $alpha:.1)}
    --factioncolorsolid: #{color.adjust($color, $alpha:1)}
    --factioncolorsoliddark: #{color.adjust($color, $alpha:1, $lightness: -30%)}
    .uc__li::before
      background: color.adjust($color, $alpha: 1)
    .uc__section::before,&::after
      background: color.adjust($color, $alpha: -0.1)
    .uc__section-title
      svg
        display: none
      background: var(--titlebg)
      border-top: 2px solid var(--factioncolor)
.uc
  overflow: hidden
  padding: 10px 0 3px
  position: relative
  border-radius: 5px
  display: grid
  grid-template-columns: repeat(2, 1fr)
  grid-template-rows: subgrid
  grid-auto-flow: dense
  &--no-subgrid
    grid-template-rows: auto
  @supports (corner-shape: bevel)
    corner-shape: bevel
    border-radius: 6px
  &:has(.u2enhancements:last-child)
    padding-bottom: 0
  &:has(.u2header:last-child)
    padding-bottom: 10px

  &:hover
    z-index: 100
  @each $name, $color in colors.$factions2
    &.#{$name}
      background: linear-gradient(rgba(0,0,0,.37), rgba(0,0,0,.37))
      background-color: color.adjust($color)
      border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%) !important
      box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: .2, $saturation: 700%, $lightness: 20%)
      filter: contrast(110%)
      outline: 1px solid transparent
      transition: border .1s, box-shadow .1s, outline .1s, transform .1s
  &__section
    position: relative
    padding-left: 10px
    padding-right: 10px
    padding-bottom: 5px
    grid-column: span 2
    grid-row: span 1
    container-type: inline-size
    &_compact
      grid-column: span 1
    &::before, &::after
      content: ''
      position: absolute
      left: -2px
      top: 2px
      z-index: 50
      display: none
      height: calc(100% - 2px)
      width: 2px
    &::after
      right: -2px
      left: initial
    &-query
      container-type: inline-size
      width: 100%
    &-title
      font-family: var(--titlefont)
      letter-spacing: var(--titlespacing)
      font-weight: 600
      font-size: 16px
      display: flex
      gap: 3px
      height: 31px
      margin: 0 -10px 5px
      padding: 0 10px
      align-items: center
      text-align: left
      justify-content: flex-start
      width: calc(100% + 20px)
      color: white
      svg
        --color1: transparent        

    &-line
      --columncount: 12
      display: grid
      grid-template-columns: repeat(var(--columncount), 1fr)
      padding: 3px 0
      gap: 6px 20px
      &_close 
        gap: 6px 5px
      >*
        grid-column: span 6
      &_flex
        display: flex
        justify-content: space-between
        flex-wrap: wrap
        gap: var(--flexgap, 10px)
      &-item
        display: flex
  &__li
    position: relative
    display: flex
    align-items: flex-start
    &:first-child:last-child
      grid-column: span 12
    &::before
      content: ''
      flex-shrink: 0
      width: .5em
      height: .5em
      margin: 4px 4px 4px 0px
      border-radius: 50%

.uc
  @container (max-width: 300px)
    .uc__section-line
      --columncount: 6
      --flexgap: 6px 5px
      display: grid

</style>
