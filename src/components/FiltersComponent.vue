<script setup>
import { storeToRefs } from 'pinia'
import { useFilterStore } from '../stores/filterStore.js'
import Input from './ui/Input.vue'
import FiltersHeader from './filters/FiltersHeader.vue'
import FilterGroups from './filters/FilterGroups.vue'

const filterStore = useFilterStore()
const { search: filterSearch } = storeToRefs(filterStore)
</script>

<template>
  <aside class="filters">
    <FiltersHeader />
    <Input class="input" id="filter" placeholder="filter" v-model="filterSearch" />
    <FilterGroups />
  </aside>
</template>

<style lang="sass">
.filters
  display: flex
  align-items: center
  gap: 10px

.mobile
  @include from(950px)
    .filters
      flex-direction: row-reverse
      justify-content: space-between
      flex-wrap: wrap-reverse
      width: 100%
      .input
        width: 10px
        flex-grow: 1
        max-width: 235px
</style>
