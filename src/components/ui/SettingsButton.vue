<script setup>
import Icon from '../Icon.vue'

defineProps({ width: { type: [String, Number], default: 24 } })
const active = defineModel({ type: Boolean, default: false })
</script>

<template>
  <button class="tool-btn settings-btn" :class="{ active: active }" title="settings" @click="active = !active">
    <Icon name="cog" :width="width" />
  </button>
</template>

<style lang="sass">
.settings-btn
  svg
    stroke-width: 1.5
</style>
