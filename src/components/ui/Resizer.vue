<template>
  <div class="resizer" :class="{ 'resizer--open': open }">
    <div class="resizer__inner">
      <slot/>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false }
})
</script>

<style lang="sass">
.resizer
  display: grid
  grid-template-rows: 0fr
  transition: grid-template-rows 0.3s ease
  &--open
    grid-template-rows: 1fr
  &__inner
    overflow: hidden
    min-height: 0
</style>
