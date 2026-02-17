<template>
  <button
    :class="['settings-btn', { active: compareStore.settingsOpen }]"
    title="settings"
    @click="compareStore.toggleSettings"
  >
    <Icon name="cog" width="24" />
  </button>
</template>

<script setup>
import { useCompareStore } from '@/stores/compare.js'
import Icon from './Icon.vue'

const compareStore = useCompareStore()
</script>

<style lang="sass">
.settings-btn
  display: inline-flex
  align-items: center
  justify-content: center
  border-radius: 4px
  border: 1px solid var(--bcolor, #555)
  background: var(--bg, #111)
  box-shadow: inset 0 0 var(--insetradius, 4px) 0px var(--scolor, #333)
  transition: all 0.2s
  cursor: pointer
  color: #888
  width: 30px
  height: 30px
  padding: 0
  --insetradius: 4px
  svg
    stroke-width: 1.5
  &:hover
    --bg: #1a1a1a
    --bcolor: #888
  &:active
    --bg: #222
    --bcolor: white
    --scolor: black
  &.active
    color: white
    --bcolor: white
    --scolor: #aaa
    box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.5), inset 0 0 4px 0px #aaa
</style>
