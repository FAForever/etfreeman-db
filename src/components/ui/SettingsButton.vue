<script setup>
import Icon from '../Icon.vue'

defineProps({
  width: { type: [String, Number], default: 24 },
  dim: { type: Boolean, default: false }
})
const active = defineModel({ type: Boolean, default: false })
</script>

<template>
  <button class="tool-btn settings-btn" :class="{ active: active, dim: dim }" title="settings" @click="active = !active">
    <Icon name="cog" :width="width" />
  </button>
</template>

<style lang="sass">
.settings-btn
  flex-shrink: 0
  svg
    stroke-width: 1.5
  &.dim:not(:hover, .active)
    --bcolor: #333
    box-shadow: none
    opacity: 0.5
    svg
      opacity: 0.5
</style>
