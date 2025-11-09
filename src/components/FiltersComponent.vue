<template>
  <aside class="filters">
    <header>
      <span class="count" :title="`${contenders.length} selected`">{{ contenders.length }} selected</span>
      <a href="" title="clear selection" class="clear" @click.prevent="clearSelection">x</a>
      <router-link
        :to="'/' + contenders.join(',')"
        title="compare"
        :class="{ glow: contenders.length, compare: true }"
      >
        compare
      </router-link>
    </header>

    <form @submit.prevent>
      <input
        class="filters__input"
        id="filter"
        type="text"
        placeholder="filter"
        autofocus
        v-model="textFilter"
        @input="onInput"
      />
    </form>

    <div class="filter-icons">
      <div class="icon-column">
        <a
          v-for="f in factions"
          :key="f"
          :title="f"
          @click.prevent="toggleFaction(f)"
          :class="['icon_ui', `icon-${f}`, { active: isFactionSelected(f) }]"
        ></a>
      </div>
      <div class="icon-column">
        <a
          v-for="k in kinds"
          :key="k"
          :title="k"
          @click.prevent="toggleKind(k)"
          :class="['icon_ui', `icon-${k}`, { active: isKindSelected(k) }]"
        ></a>
      </div>
      <div class="icon-column">
        <a
          v-for="t in techLevels"
          :key="t"
          :title="t"
          @click.prevent="toggleTech(t)"
          :class="['icon_ui', `icon-${t}`, { active: isTechSelected(t) }]"
        ></a>
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
    text-shadow: 0 0 1px #fff, 0 0 4px #fff, 0 0 6px #fff, 0 0 8px #f90, 0 0 15px #f90, 0 0 20px #f90, 0 0 30px #f90, 0 0 40px #f90
  to
    text-shadow: 0 0 0 #fff

.filters
  flex-shrink: 0
  max-width: 153px
  overflow: hidden
  display: grid
  grid-template-columns: 100%
  gap: 3px

  header
    margin: 0 0 10px
    font-size: 20px
    text-align: center
    color: colors.$orange
    a
      font-size: 28px
      text-decoration: none
      display: inline-block
      padding: 3px 5px
      margin: 0

      &:hover, &:focus, &:active
        color: #fff

    .clear
      font-size: 20px
      margin: 0
      padding: 0 5px 3px

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
    margin-top: 12px

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