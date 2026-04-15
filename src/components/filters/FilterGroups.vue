<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore.js'
import Icon from '../Icon.vue'

const filterStore = useFilterStore()
const { factions, kinds, tech } = storeToRefs(filterStore)

const groups = computed(() => [
  { items: ['uef', 'cybran', 'aeon', 'seraphim', 'nomads'], active: factions.value, toggle: f => filterStore.toggleFaction(f), svg: true },
  { items: ['Base', 'Land', 'Air', 'Naval'], active: kinds.value, toggle: k => filterStore.toggleKind(k) },
  { items: ['T1', 'T2', 'T3', 'EXP'], active: tech.value, toggle: t => filterStore.toggleTech(t) }
])
</script>

<template>
  <div class="filterGroups">
    <div class="filterGroups__row" v-for="group in groups" :key="group.items[0]">
      <component v-for="item in group.items" :title="item" @click.prevent="group.toggle(item)" role="button"
        :class="[!group.svg && 'icon_ui', `icon-${item}`, { active: group.active.has(item) }]" :is="group.svg? Icon : 'a'" :name="item"></component>
    </div>
  </div>
</template>

<style lang="sass">
.filterGroups
  display: flex
  align-items: center
  gap: var(--iconsgap, 16px)

  a, svg
    cursor: pointer
    border-radius: 3px
    background-size: 300% 300%
    width: var(--iconsize, 30px)
    height: var(--iconsize, 30px)
    transition: filter .2s, opacity .2s, fill .2s
    &:hover, &:focus, &.active
      background-color: rgba(255,255,255, .4)
    &:not(.active)
      filter: grayscale(1)
      opacity: 0.4
      &:hover
        filter: grayscale(.5)
        opacity: 0.75
        background-color: rgba(255,255,255, .1)
    &.active:not(:hover)
      background-color: initial
  svg
    padding: calc(var(--iconsize, 30px) * 0.05)
    @each $faction, $color in colors.$factions
      &.icon-#{$faction}
        fill: rgba($color, 1)
    &:not(.active)
      fill: #aaa
  &__row
    display: flex

.mobile
  @include from(950px)
    .filterGroups
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
</style>
