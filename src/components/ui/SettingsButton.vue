<template>
  <button
    class="tool-btn settings-btn"
    :class="{ active: active }"
    title="settings"
    @click="active = !active"
  >
    <Icon name="cog" width="24" />
  </button>
</template>

<script setup>
import Icon from '../Icon.vue'

const active = defineModel({ type: Boolean, default: false })
</script>

<style lang="sass">
.settings-btn
  svg
    stroke-width: 1.5
</style>
