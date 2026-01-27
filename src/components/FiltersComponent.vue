<template>
  <aside class="filters" :class="{ 'filters_row': row }">
    <header class="filters__header">
      <button class="filters__btn filters__compare" :class="{ 'filters__compare--active': contenders.size }" title="compare"
        :disabled="!contenders.size" @click="router.push('/' + [...contenders].join(','))"
        ><div v-html="contenders.size ? `compare&nbsp;<span>${contenders.size}</span>&nbsp;unit${contenders.size > 1 ? 's' : ''}` : 'select units to compare'" /></button>
      <button type="button" title="clear selection" class="filters__btn filters__header-clear" :disabled="!contenders.size"
        @click="clearSelection">
        <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M4.56189 13.5L4.14285 13.9294L4.5724 14.3486L4.99144 13.9189L4.56189 13.5ZM9.92427 15.9243L15.9243 9.92427L15.0757 9.07574L9.07574 15.0757L9.92427 15.9243ZM9.07574 9.92426L15.0757 15.9243L15.9243 15.0757L9.92426 9.07574L9.07574 9.92426ZM19.9 12.5C19.9 16.5869 16.5869 19.9 12.5 19.9V21.1C17.2496 21.1 21.1 17.2496 21.1 12.5H19.9ZM5.1 12.5C5.1 8.41309 8.41309 5.1 12.5 5.1V3.9C7.75035 3.9 3.9 7.75035 3.9 12.5H5.1ZM12.5 5.1C16.5869 5.1 19.9 8.41309 19.9 12.5H21.1C21.1 7.75035 17.2496 3.9 12.5 3.9V5.1ZM5.15728 13.4258C5.1195 13.1227 5.1 12.8138 5.1 12.5H3.9C3.9 12.8635 3.92259 13.2221 3.9665 13.5742L5.15728 13.4258ZM12.5 19.9C9.9571 19.9 7.71347 18.6179 6.38048 16.6621L5.38888 17.3379C6.93584 19.6076 9.54355 21.1 12.5 21.1V19.9ZM4.99144 13.9189L7.42955 11.4189L6.57045 10.5811L4.13235 13.0811L4.99144 13.9189ZM4.98094 13.0706L2.41905 10.5706L1.58095 11.4294L4.14285 13.9294L4.98094 13.0706Z"
              fill="white"></path>
          </g>
        </svg>
      </button>
    </header>

    <input class="filters__input" autocomplete="off" id="filter" type="text" placeholder="filter" v-model="filterSearch" />

    <div class="filter-icons">
      <div class="icon-column">
        <a v-for="f in factions" :key="f" :title="f" @click.prevent="filterStore.toggleFaction(f)"
          :class="['icon_ui', `icon-${f}`, { active: filterFactions.includes(f) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="k in kinds" :key="k" :title="k" @click.prevent="filterStore.toggleKind(k)"
          :class="['icon_ui', `icon-${k}`, { active: filterKinds.includes(k) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="t in techLevels" :key="t" :title="t" @click.prevent="filterStore.toggleTech(t)"
          :class="['icon_ui', `icon-${t}`, { active: filterTech.includes(t) }]"></a>
      </div>
    </div>

    <div v-if="false" class="v2-link">
      <a href="https://faf-unitdb.web.app">try out V2! <small>(wip)</small></a>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUnitData } from '../composables/useUnitData.js'
import { useFilterStore } from '../stores/filterStore.js'

const { row } = defineProps(['row'])

const router = useRouter()

const filterStore = useFilterStore()
const { factions: filterFactions, kinds: filterKinds, tech: filterTech, search: filterSearch } = storeToRefs(filterStore)
const { clearSelection, contenders } = useUnitData()

const factions = ref(['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'])
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
      svg
        width: 24px
        height: 24px
        transition: transform .1s ease-out
        transform: translateY(-0.5px)
      &[disabled]
        svg
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
      svg, div
        transform: translateY(0.5px)

  &__compare
    font-size: 18px
    font-weight: 700
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
      font-weight: 700
      font-size: .92em
      display: inline-block
    div
      transition: transform .1s ease-out
      transform: translateY(-0.5px)

  &__input
    width: 100%
    height: 30px
    border-radius: 5px
    padding: 5px 10px
    color: white
    border: 1px solid #333
    background: #111 !important
    opacity: 0.5
    &::placeholder
      color: #aaa
    &:focus
      opacity: 1
      border: 1px solid white

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