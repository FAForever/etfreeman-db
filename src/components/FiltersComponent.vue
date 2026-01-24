<template>
  <aside class="filters" :class="{ 'filters_row': row }">
    <header class="filters__header">
      <span class="count" :title="`${contenders.length} selected`">{{ contenders.length }}x</span>
      <router-link :to="'/' + contenders.join(',')" title="compare" :class="{ glow: contenders.length, compare: true }">
        compare
      </router-link>
      <a href="" title="clear selection" class="filters__header-clear" @click.prevent="clearSelection">
        <svg viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" width="25">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M4.56189 13.5L4.14285 13.9294L4.5724 14.3486L4.99144 13.9189L4.56189 13.5ZM9.92427 15.9243L15.9243 9.92427L15.0757 9.07574L9.07574 15.0757L9.92427 15.9243ZM9.07574 9.92426L15.0757 15.9243L15.9243 15.0757L9.92426 9.07574L9.07574 9.92426ZM19.9 12.5C19.9 16.5869 16.5869 19.9 12.5 19.9V21.1C17.2496 21.1 21.1 17.2496 21.1 12.5H19.9ZM5.1 12.5C5.1 8.41309 8.41309 5.1 12.5 5.1V3.9C7.75035 3.9 3.9 7.75035 3.9 12.5H5.1ZM12.5 5.1C16.5869 5.1 19.9 8.41309 19.9 12.5H21.1C21.1 7.75035 17.2496 3.9 12.5 3.9V5.1ZM5.15728 13.4258C5.1195 13.1227 5.1 12.8138 5.1 12.5H3.9C3.9 12.8635 3.92259 13.2221 3.9665 13.5742L5.15728 13.4258ZM12.5 19.9C9.9571 19.9 7.71347 18.6179 6.38048 16.6621L5.38888 17.3379C6.93584 19.6076 9.54355 21.1 12.5 21.1V19.9ZM4.99144 13.9189L7.42955 11.4189L6.57045 10.5811L4.13235 13.0811L4.99144 13.9189ZM4.98094 13.0706L2.41905 10.5706L1.58095 11.4294L4.14285 13.9294L4.98094 13.0706Z"
              fill="white"></path>
          </g>
        </svg>
      </a>
    </header>

    <form @submit.prevent>
      <input class="filters__input" id="filter" type="text" placeholder="filter" autofocus v-model="textFilter"
        @input="onInput" />
    </form>

    <div class="filter-icons">
      <div class="icon-column">
        <a v-for="f in factions" :key="f" :title="f" @click.prevent="toggleFaction(f)"
          :class="['icon_ui-scalable', `icon-${f}`, { active: isFactionSelected(f) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="k in kinds" :key="k" :title="k" @click.prevent="toggleKind(k)"
          :class="['icon_ui-scalable', `icon-${k}`, { active: isKindSelected(k) }]"></a>
      </div>
      <div class="icon-column">
        <a v-for="t in techLevels" :key="t" :title="t" @click.prevent="toggleTech(t)"
          :class="['icon_ui-scalable', `icon-${t}`, { active: isTechSelected(t) }]"></a>
      </div>
    </div>

    <div v-if="false" class="v2-link">
      <a href="https://faf-unitdb.web.app">try out V2! <small>(wip)</small></a>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'

const { row } = defineProps(['row'])

const route = useRoute()

const {
  toggleFaction,
  toggleKind,
  toggleTech,
  clearSelection,
  isFactionSelected,
  isKindSelected,
  isTechSelected,
  contenders,
  textFilter
} = useUnitData()

const factions = ref(['UEF', 'Cybran', 'Aeon', 'Seraphim', 'Nomads'])
const kinds = ref(['Base', 'Land', 'Air', 'Naval'])
const techLevels = ref(['T1', 'T2', 'T3', 'EXP'])
</script>

<style lang="sass">
.glow
  animation: neon-glow 1.5s ease-in-out infinite alternate
  
@keyframes neon-glow
  from
    text-shadow: 0 0 1px #fff, 0 0 2px #fff, 0 0 3px #fff, 0 0 4px #f90, 0 0 5px #f90, 0 0 6px #f90, 0 0 7px #f90, 0 0 8px #f90
  to
    text-shadow: 0 0 0 #fff

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
      margin-top: 5px

  &_row
    display: flex
    max-width: initial
    align-items: center
    gap: 10px

    .filter-icons
      display: flex !important
      flex-direction: row
      align-items: center
      gap: 16px !important
      a
        width: 30px
        height: 30px
      &, .icon-column
        gap: 0px
        display: flex
        flex-direction: row

  header
    font-size: 20px
    text-align: center
    color: colors.$orange
    a
      font-size: 28px
      text-decoration: none
      display: inline-block

      &:hover, &:focus, &:active
        color: #fff

  &__input
    width: 100%
    border-radius: 5px
    padding: 5px 10px

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
</style>