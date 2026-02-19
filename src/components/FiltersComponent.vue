<template>
  <aside class="filters" :class="{ 'filters_row': row }">
    <header class="filters__header">
      <button class="filters__btn filters__compare" :class="{ 'filters__compare--active': contenders.size }" title="compare"
        :disabled="!contenders.size" @click="router.push('/' + [...contenders].join(','))"
        ><div v-html="contenders.size ? `compare&nbsp;<span>${contenders.size}</span>&nbsp;unit${contenders.size > 1 ? 's' : ''}` : 'select units to compare'" /></button>
      <button type="button" title="clear selection" class="filters__btn filters__header-clear" :disabled="!contenders.size"
        @click="clearSelection">
        <Icon name="clear" />
      </button>
    </header>

    <Input class="filters__input" id="filter" placeholder="filter" v-model="filterSearch" />

    <div class="filter-icons">
      <div class="icon-column">
        <a v-for="f in factions" :key="f" :title="f" @click.prevent="filterStore.toggleFaction(f)"
          :class="['icon_ui', `icon-${f}`, { active: filterFactions.has(f) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="k in kinds" :key="k" :title="k" @click.prevent="filterStore.toggleKind(k)"
          :class="['icon_ui', `icon-${k}`, { active: filterKinds.has(k) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="t in techLevels" :key="t" :title="t" @click.prevent="filterStore.toggleTech(t)"
          :class="['icon_ui', `icon-${t}`, { active: filterTech.has(t) }]"></a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUnitData } from '../composables/useUnitData.js'
import { useFilterStore } from '../stores/filterStore.js'
import Icon from './Icon.vue'
import Input from './ui/Input.vue'

const { row } = defineProps(['row'])

const router = useRouter()

const filterStore = useFilterStore()
const { factions: filterFactions, kinds: filterKinds, tech: filterTech, search: filterSearch } = storeToRefs(filterStore)
const { clearSelection, contenders } = useUnitData()

const factions = ref(['uef', 'cybran', 'aeon', 'seraphim', 'nomads'])
const kinds = ref(['Base', 'Land', 'Air', 'Naval'])
const techLevels = ref(['T1', 'T2', 'T3', 'EXP'])
</script>

<style lang="sass">
.filters
  flex-shrink: 0
  display: grid
  grid-template-columns: 100%
  gap: 3px

  &__header
    display: flex
    align-items: center
    gap: 5px
    &-clear
      width: 30px
      height: 30px
      padding: 0
      --insetradius: 4px
      .icon
        width: 24px
        height: 24px
        transition: transform .1s ease-out
        transform: translateY(-0.5px)
      &[disabled]
        .icon
          opacity: 0.5
  &_row
    display: flex
    max-width: initial
    align-items: center
    gap: 10px

    .filter-icons
      display: flex !important
      flex-direction: row
      align-items: center
      --iconsize: 30px
      --iconsgap: 16px
      gap: var(--iconsgap) !important
      a
        background-size: 400% 400%
        width: var(--iconsize)
        height: var(--iconsize)
      &, .icon-column
        gap: 0px
        display: flex
        flex-direction: row

  &__btn
    display: inline-flex
    align-items: center
    justify-content: center
    border-radius: 4px
    border: 1px solid var(--bcolor, #bbb)
    background: var(--bg, #111)
    box-shadow: inset 0 0 var(--insetradius, 8px) 0px var(--scolor, #777)
    transition: all 0.2s, font-size 0s, font-weight 0s
    cursor: pointer
    color: inherit
    &[disabled]
      --bcolor: #333
      box-shadow: none 
      opacity: 0.5 !important
      pointer-events: none
    &:hover
      --bg: #050505
      --bcolor: #ddd
      --scolor: #777
    &:active
      --bg: black
      --bcolor: white
      --scolor: black
      .icon, div
        transform: translateY(0.5px)

  &__compare
    font-size: 18px
    color: white
    height: 30px
    width: 200px
    text-decoration: none
    font-weight: 500
    white-space: nowrap
    &[disabled]
      font-size: 15px
    &--active:not(:hover)
      animation: glow-pulse 2s ease-in-out infinite alternate
    span
      font-weight: 800
      font-size: .92em
    div
      transition: transform .1s ease-out
      transform: translateY(-0.5px)

  a
    display: block
    border-radius: 3px
    transition: filter 0.2s, opacity 0.2s

    &:hover, &:focus, &.active
      background-color: rgba(255,255,255, .4)

  .filter-icons
    display: grid
    grid-template-columns: repeat(3, 1fr)
    gap: 3px

    a:not(.active)
      filter: grayscale(1)
      opacity: 0.4
      &:hover 
        filter: grayscale(.5)
        opacity: 0.75
        background-color: rgba(255,255,255, .1) !important

    a.active:not(:hover)
      background-color: initial !important


  .icon-column
    display: flex
    flex-direction: column
    gap: 3px

  .v2-link
    width: 100%

@keyframes glow-pulse
  from
    box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0.2), inset 0 0 3px 0px #888
    border-color: #bbb
  to
    box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.6), inset 0 0 5px 1px #aaa
    border-color: #eee

.mobile 
  @include from(950px)
    .filters
      flex-direction: row-reverse
      justify-content: space-between
      flex-wrap: wrap-reverse
      width: 100%
      .filter-icons
        justify-content: space-between
        width: 100%
        max-width: 450px
        margin: 0 auto
        --iconsize: 24px
        --iconsgap: 5px
        @include since(360px)
          --iconsize: 26px
        @include since(390px)
          --iconsize: 28px
        @include since(420px)
          --iconsize: 30px
        @include since(700px)
          justify-content: center
          max-width: initial
          --iconsgap: 30px
      &__input
        display: block
        width: 10px
        flex-grow: 1
        max-width: 235px
  
</style>