<script setup>
const modelValue = defineModel()
</script>

<template>
  <label class="toggle-switch">
    <input type="checkbox" v-model="modelValue" />
    <span class="toggle-slider"></span>
  </label>
</template>

<style lang="sass" scoped>
.toggle-switch
  position: relative
  display: inline-block
  width: 36px
  flex-shrink: 0
  height: 18px

  input
    opacity: 0
    width: 0
    height: 0

  .toggle-slider
    position: absolute
    cursor: pointer
    inset: 0
    border-radius: 18px
    background: #111
    border: 1px solid #555
    box-shadow: inset 0 0 4px 0px #333
    transition: all 0.2s

    &:before
      position: absolute
      content: ""
      height: 12px
      width: 12px
      left: 2px
      bottom: 2px
      background: #666
      border-radius: 50%
      transition: all 0.2s

  input:checked + .toggle-slider
    border-color: white
    box-shadow: 0 0 2px 1px rgba(255, 255, 255, 0.5), inset 0 0 2px 0px #aaa

    &:before
      transform: translateX(18px)
      background: white

  input:focus-visible + .toggle-slider
    outline: 2px solid white
    outline-offset: 2px
</style>
