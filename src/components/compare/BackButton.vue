<template>
  <button class="tool-btn back-btn" title="back to unit list" @click="toPreferredView">
    <Icon name="arrow_left" width="14.5"/>
  </button>
</template>

<script setup>
import { toPreferredView } from '@/router'
import Icon from '../Icon.vue'
</script>

<style lang="sass">
.back-btn
  border-radius: 5px
  color: inherit
  --insetradius: 0px
  --bcolor: #888
  --scolor: #777
  .icon
    fill: white
  &:hover
    --insetradius: 10px
    --bg: #050505
    --bcolor: #ddd
  &:active
    --bg: black
    --bcolor: white
    --scolor: black
</style>
