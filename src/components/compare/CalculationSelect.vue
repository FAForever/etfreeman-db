<script setup>
import { ref } from 'vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import Select from '../ui/Select.vue'

defineProps(['label', 'options'])
const modelValue = defineModel()
const inverted = defineModel('inverted')
const selectRef = ref(null)
</script>

<template>
  <label class="panel__select">
    <Select ref="selectRef" v-model="modelValue" size="small"
      :options="options" class="panel__select-select" />
    <div class="panel__select-toggle" :class="{ visible: selectRef?.open }">
      <label class="panel__toggle" @mousedown.stop @click.stop @pointerdown.stop>
        <ToggleSwitch v-model="inverted" />
        <span class="panel__toggle-text">Invert</span>
      </label>
    </div>
    <span class="panel__select-label" :class="{ 'fade-out': selectRef?.open }">
      {{ label }}
    </span>
  </label>
</template>

<style lang="sass">
.panel__select
  position: relative
  grid-row: span 2
  display: flex
  flex-direction: column
  justify-content: space-between
  cursor: pointer
  color: white

  &-select
    order: 2
    &:hover
      z-index: 2
      position: relative
  &-select:hover ~ &-toggle
    z-index: 1
    opacity: 1
    transform: translateY(0)
  &-select:hover ~ &-label, &-toggle:hover ~ &-label
    opacity: 0

  &-label
    padding-top: 2px
    font-size: 14px
    transition: opacity 0.2s

    &.fade-out
      opacity: 0

  &-toggle
    padding-bottom: 20px
    position: absolute
    top: 0
    right: 0
    left: 0
    z-index: -2
    opacity: 0
    transform: translateY(20px)
    transition: opacity 0.2s, transform 0.2s
    &:hover
      z-index: 1
      opacity: 1
      transform: translateY(0)
    &.visible
      z-index: 1
      opacity: 1
      transform: translateY(0)
</style>
