<script setup>
defineProps(['text'])
</script>

<template>
  <span class="infotip" :data-tooltip="text" data-tooltip-params="big top center">?</span>
</template>

<style lang="sass" scoped>
.infotip
  display: inline-flex
  align-items: center
  justify-content: center
  width: 14px
  height: 14px
  border-radius: 50%
  background: rgba(255,255,255,.2)
  color: #fff
  font-size: 10px
  font-weight: 600
  line-height: 1
  flex-shrink: 0
  cursor: help
  text-decoration: none
</style>
