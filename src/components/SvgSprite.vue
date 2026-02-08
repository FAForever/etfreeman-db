<script setup>
defineProps({
  icons: { type: Array, required: true }
})
</script>

<template>
  <svg class="svg-sprite" style="width: 0; height: 0; position: absolute; pointer-events: none">
    <symbol v-for="icon in icons" :key="icon.name" :id="icon.name" :viewBox="icon.viewBox" v-html="icon.content" />
  </svg>
</template>
