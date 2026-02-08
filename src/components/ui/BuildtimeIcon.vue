<script setup>
import Icon from '../Icon.vue'
</script>

<template>
  <div class="buildtime-icon">
    <div class="buildtime-icon__wrap">
      <Icon name="buildtime" class="buildtime-icon__img" />
    </div>
  </div>
</template>

<style lang="sass">
.buildtime-icon
  display: flex
  align-items: center
  &__wrap
    padding: 1px
    border: 2px solid #ddd
    border-radius: 50%
    box-shadow: inset 0 0 2px #ddd, 0 0 1px #ddd
    background: color.adjust(black, $lightness: 5%)
  &__img
    transform-origin: center center
    fill-rule: evenodd
    clip-rule: evenodd
    stroke-linejoin: round
    stroke-miterlimit: 2
    color: #ddd
    fill: #ddd
    stroke: #ddd
    stroke-width: 40
    width: 12px
    height: 12px
    filter: drop-shadow(0px 0px 2px rgba(255,255,255,1))
</style>
