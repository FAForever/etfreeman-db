<script setup>
import FiltersHeader from './filters/FiltersHeader.vue'
import SearchInput from './filters/SearchInput.vue'
import FilterGroups from './filters/FilterGroups.vue'
</script>

<template>
  <aside class="filters">
    <FiltersHeader />
    <SearchInput class="input" />
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
