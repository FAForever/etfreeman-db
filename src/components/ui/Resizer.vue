<script setup>
const { open } = defineProps(['open'])
</script>

<template>
  <div class="resizer" :class="{ 'resizer_open': open }">
    <div class="resizer__inner">
      <slot />
    </div>
  </div>
</template>

<style lang="sass">
.resizer
  display: grid
  grid-template-rows: 0fr
  transition: grid-template-rows 0.3s ease
  &__inner
    overflow: hidden
  &_open
    grid-template-rows: 1fr
    .resizer__inner
      animation: showOverflow 0s 0.3s forwards

@keyframes showOverflow
  to
    overflow: visible
</style>
