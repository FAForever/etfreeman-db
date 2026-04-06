<template>
  <div class="uc faction" :class="[unit.faction.toLowerCase()]"
    :style="{ gridRow: `span ${layoutInfo.rowCount}` }">
    <component v-for="section in sortedSections" :key="section.name"
      :is="SectionComponents[section.name]" ref="sectionRefs" :unit="unit"
      :compactOverride="getCompactOverride(section.name)" :class="layoutInfo.columnClasses[section.name]"/>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCompareStore } from '@/stores/compare/index.js'
import { DEFAULT_ORDER } from '@/stores/compare/sectionOrder.js'
import * as SectionComponents from './unit/sections/index.js'

const props = defineProps(['unit', 'sectionOrder', 'compactOverrides'])
const compareStore = useCompareStore()
const sectionNames = Object.keys(SectionComponents)
const sectionRefs = ref([])

const sections = computed(() => {
  return sectionNames.map(name => {
    const ref = sectionRefs.value.find(r => r.name === name)
    return {
      name, show: ref?.isShown, compact: ref?.isCompact,
      expandScore: ref?.expandScore || 0, rowSpan: ref?.rowSpan || 1
    }
  })
})

const sortedSections = computed(() => {
  const order = props.sectionOrder || DEFAULT_ORDER
  const orderIndex = Object.fromEntries(order.map((k, i) => [k, i]))
  return sections.value
    .map(s => ({
      ...s,
      compact: compareStore.toggles.compactSections ? (props.compactOverrides?.[s.name] ?? s.compact) : false
    }))
    .sort((a, b) => (orderIndex[a.name] ?? 99) - (orderIndex[b.name] ?? 99))
})

const layoutInfo = computed(() => {
  const columnClasses = {}
  const expanded = new Set()
  let total = 0
  const secs = sortedSections.value.filter(s => s.show)

  for (let i = 0; i < secs.length; i++) {
    const sec = secs[i]
    const column = total % 1 ? 2 : 1
    columnClasses[sec.name] = sec.compact ? `uc__section_column-${column}` : null

    if (total % 1) {
      total += sec.compact ? 0.5 : 1.5
    } else {
      total += sec.compact ? 0.5 : 1
    }
    if (sec.rowSpan > 1) total += (sec.rowSpan - 1)

    if (total % 1) {
      const nextSec = secs[i + 1]
      if (!nextSec || !nextSec.compact) expanded.add(sec.name)
    }
  }

  for (const name of expanded) {
    columnClasses[name] = null
  }

  return { columnClasses, expanded, rowCount: Math.ceil(total) }
})

const getCompactOverride = (name) => {
  if (!compareStore.toggles.compactSections) return false
  if (layoutInfo.value.expanded.has(name)) return false
  return props.compactOverrides?.[name]
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
  grid-template-rows: var(--uc-template-rows, subgrid)
  @supports (corner-shape: bevel)
    corner-shape: bevel
    border-radius: 6px
  &:has(.uenhancements:last-child)
    padding-bottom: 0
  &:has(.uheader:last-child)
    padding-bottom: 10px
  &:hover
    z-index: 100
  @each $name, $color in colors.$factions
    &.#{$name}
      background: linear-gradient(rgba(0,0,0,.37), rgba(0,0,0,.37))
      background-color: color.adjust($color)
      border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%)
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
      grid-column: span var(--columncount)
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
