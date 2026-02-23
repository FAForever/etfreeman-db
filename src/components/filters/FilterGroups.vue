<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore.js'

const filterStore = useFilterStore()
const { factions, kinds, tech } = storeToRefs(filterStore)

const groups = computed(() => [
  { items: ['uef', 'cybran', 'aeon', 'seraphim', 'nomads'], active: factions.value, toggle: f => filterStore.toggleFaction(f) },
  { items: ['Base', 'Land', 'Air', 'Naval'], active: kinds.value, toggle: k => filterStore.toggleKind(k) },
  { items: ['T1', 'T2', 'T3', 'EXP'], active: tech.value, toggle: t => filterStore.toggleTech(t) }
])
</script>

<template>
  <div class="filterGroups">
    <div class="filterGroups__row" v-for="group in groups" :key="group.items[0]">
      <a v-for="item in group.items" :key="item" :title="item" @click.prevent="group.toggle(item)"
        :class="['icon_ui', `icon-${item}`, { active: group.active.has(item) }]"></a>
    </div>
  </div>
</template>

<style lang="sass">
.filterGroups
  display: flex
  align-items: center
  gap: var(--iconsgap, 16px)

  a
    border-radius: 3px
    background-size: 400% 400%
    width: var(--iconsize, 30px)
    height: var(--iconsize, 30px)
    transition: filter 0.2s, opacity 0.2s
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
