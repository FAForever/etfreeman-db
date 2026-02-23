<template>
  <button
    :class="['tool-btn', 'filter-btn', { active: compareStore.filterOpen }]"
    title="toggle section filters"
    @click="compareStore.toggleFilter"
  >
    <Icon name="filter" width="18"/>
  </button>
</template>

<script setup>
import { useCompareStore } from '@/stores/compare'
import Icon from '../Icon.vue'

const compareStore = useCompareStore()
</script>

<style lang="sass">
</style>
