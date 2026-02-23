<template>
  <div class="uc faction" :class="[unit.faction.toLowerCase(), { 'uc--no-subgrid': !linedUp }]"
    :style="{ gridRow: `span ${rowCount}` }">
    <component v-for="section in sortedSections" :key="section.key" 
      :is="getComponent(section.key)" ref="sectionRefs" :unit="unit"
      :compactOverride="getCompactOverride(section.key)" :class="getColumnClass(section.key)" />
  </div>
</template>

<script setup>
import { computed,  ref } from 'vue'
import { useCompareStore } from '../stores/compare'
import { DEFAULT_ORDER } from '../stores/compare/sectionOrder.js'
import * as SectionComponents from './unit2/index.js'

const props = defineProps(['unit', 'showedSections', 'sectionOrder', 'compactOverrides', 'linedUp'])
const compareStore = useCompareStore()

const sectionRefs = ref([])

const getComponent = key => SectionComponents['U2' + key.charAt(0).toUpperCase() + key.slice(1)]

const sections = computed(() => {
  const s = props.showedSections || {}
  return DEFAULT_ORDER.map(key => {
    const toggleKey = key.charAt(0).toUpperCase() + key.slice(1)
    const ref = sectionRefs.value.find(r => r.key === key)
    return {
      key,
      show: s[toggleKey] && ref?.isShown,
      compact: ref?.isCompact,
      expandScore: ref?.expandScore || 0,
      rowSpan: ref?.rowSpan || 1
    }
  })
})

const sortedSections = computed(() => {
  const order = props.sectionOrder || DEFAULT_ORDER
  const orderIndex = Object.fromEntries(order.map((k, i) => [k, i]))
  return sections.value
    .map(s => ({
      ...s,
      compact: compareStore.toggles.compactSections ? (props.compactOverrides?.[s.key] ?? s.compact) : false
    }))
    .sort((a, b) => (orderIndex[a.key] ?? 99) - (orderIndex[b.key] ?? 99))
})

const layoutInfo = computed(() => {
  const columns = {}
  const expanded = new Set()
  let total = 0
  const secs = sortedSections.value.filter(s => s.show)

  for (let i = 0; i < secs.length; i++) {
    const sec = secs[i]
    const column = total % 1 ? 2 : 1
    columns[sec.key] = sec.compact ? column : null

    if (total % 1) {
      total += sec.compact ? 0.5 : 1.5
    } else {
      total += sec.compact ? 0.5 : 1
    }
    if (sec.rowSpan > 1) total += (sec.rowSpan - 1)

    if (total % 1) {
      const nextSec = secs[i + 1]
      if (!nextSec || !nextSec.compact) expanded.add(sec.key)
    }
  }

  for (const key of expanded) {
    columns[key] = null
  }

  return { columns, expanded, rowCount: Math.ceil(total) }
})

const expandedKeys = computed(() => layoutInfo.value.expanded)
const rowCount = computed(() => layoutInfo.value.rowCount)
const getColumn = (key) => layoutInfo.value.columns[key]
const getColumnClass = (key) => {
  const col = getColumn(key)
  return col ? `uc__section_column-${col}` : null
}

const getCompactOverride = (key) => {
  if (!compareStore.toggles.compactSections) return false
  if (expandedKeys.value.has(key)) return false
  return props.compactOverrides?.[key]
}

defineExpose({ sections })
</script>

<style lang="sass">
@use 'sass:selector'
@each $name, $color in colors.$factions
  .#{$name}
    --titlebg: #{color.adjust($color, $alpha: -0.1)}
    --factioncolor: #{$color}
    --factioncolortrans: #{color.adjust($color, $alpha:-.1)}
    --factioncolorsol: #{color.adjust($color, $alpha:.1)}
    --factioncolorsolid: #{color.adjust($color, $alpha:1)}
    --factioncolorsoliddark: #{color.adjust($color, $alpha:1, $lightness: -30%)}
    .uc__section-title
      position: relative
      &::before
        content: ''
        position: absolute
        z-index: -1
        background: var(--titlebg)
        top: 0
        bottom: 0
        right: calc(var(--rightpadding, var(--sectionpadding)) * (-1))
        left: calc(var(--leftpadding, var(--sectionpadding)) * (-1))
        border-top: 2px solid var(--factioncolor)
.uc
  overflow: hidden
  padding: 10px 0 3px
  position: relative
  border-radius: 5px
  display: grid
  gap: 0
  grid-template-columns: repeat(2, 1fr)
  grid-template-rows: subgrid
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
  @each $name, $color in colors.$factions
    &.#{$name}
      background: linear-gradient(rgba(0,0,0,.37), rgba(0,0,0,.37))
      background-color: color.adjust($color)
      border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%) !important
      box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: .2, $saturation: 700%, $lightness: 20%)
      filter: contrast(110%)
      outline: 1px solid transparent
      transition: border .1s, box-shadow .1s, outline .1s, transform .1s
  &__section
    --sectionpadding: 10px
    position: relative
    padding-bottom: var(--bottompadding, 5px)
    padding-left: var(--leftpadding, var(--sectionpadding))
    padding-right: var(--rightpadding, var(--sectionpadding))
    grid-column: span 2
    grid-row: span 1
    container-type: inline-size
    &_compact
      grid-column: span 1
    &_column-1
      --rightpadding: calc(var(--uccolumngap) / 2)
    &_column-2
      --leftpadding: calc(var(--uccolumngap) / 2)
    &-query
      container-type: inline-size
      width: 100%
    &-title
      font-family: var(--titlefont)
      font-weight: 600
      font-size: 16px
      display: flex
      gap: 3px
      height: 31px
      margin: 0 0 5px
      align-items: center
      text-align: left
      justify-content: flex-start
      color: white
      svg
        --color1: transparent        

    &-line
      --columncount: 12
      display: grid
      grid-template-columns: repeat(var(--columncount), 1fr)
      padding: 3px 0
      gap: 6px var(--uccolumngap)
      &_close 
        gap: 6px 5px
      >*
        grid-column: span 6
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
      background: var(--factioncolorsolid)

.uc
  @container (max-width: 300px)
    .uc__section-line
      --columncount: 6
      display: grid

</style>
