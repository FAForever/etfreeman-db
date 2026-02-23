<template>
  <button
    :class="['tool-btn', 'settings-btn', { active: compareStore.settingsOpen }]"
    title="settings"
    @click="compareStore.toggleSettings"
  >
    <Icon name="cog" width="24" />
  </button>
</template>

<script setup>
import { useCompareStore } from '@/stores/compare'
import Icon from '../Icon.vue'

const compareStore = useCompareStore()
</script>

<style lang="sass">
.settings-btn
  svg
    stroke-width: 1.5
</style>
