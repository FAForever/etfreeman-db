<script setup>
import { storeToRefs } from 'pinia'
import { useCompareStore } from '../stores/compare.js'
import ToggleSwitch from './ui/ToggleSwitch.vue'

const compareStore = useCompareStore()
const { showUnitId } = storeToRefs(compareStore)
</script>

<template>
  <div class="settings-panel">
    <label class="panel__toggle">
      <ToggleSwitch v-model="showUnitId" />
      <span class="panel__toggle-text">Show unit ID</span>
    </label>
  </div>
</template>

<style lang="sass" scoped>
.settings-panel
  display: grid
  grid-template-columns: repeat(3, fit-content)

.panel__toggle
  width: fit-content
  user-select: none
  display: flex
  align-items: center
  gap: 8px
  cursor: pointer
</style>
