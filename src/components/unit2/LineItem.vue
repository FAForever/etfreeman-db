<script setup>
import Icon from '../Icon.vue'
import { useMods } from '@/composables/useMods.js'

const props = defineProps(['text', 'value', 'icon', 'type', 'span', 'column', 'tooltip'])
const { mods } = useMods(props, 'lineItem', { type: 'basic', span: '', column: '' })
</script>

<template>
  <div :class="['lineItem', ...mods]">
    <slot />
    <span class="lineItem-text" v-if="text" v-html="text"/>
    <span class="lineItem-value" :data-tooltip="tooltip" v-html="value"/>
  </div>
</template>

<style lang="sass">
.lineItem
  display: flex
  align-items: center
  gap: 5px
  font-size: 16px
  @for $span from 1 through 12
    &_span-#{$span}
      grid-column: span #{$span} !important
  @for $column from 1 through 12
    &_column-#{$column}
      grid-column-start: #{$column} !important
  &_type-basic &-text, &_type-basic &-value
    flex-basis: 10px
    min-width: min-content
    white-space: nowrap
  &_type-basic &-text
    display: block
    font-size: 14px
    font-weight: 400
    flex-shrink: 1
  &_type-basic &-value
    font-weight: 700
    span
      font-weight: 400
  
  &_type-bar  
    border-radius: 5px
    justify-content: center
    font-weight: 800
    text-shadow: 1px 1px black, -1px 1px black, 1px -1px black, -1px -1px black
    border-top: 1px solid black
    border-bottom: 1px solid black
    text-align: center
    &-hp
      color: #C8F7C5
      background: linear-gradient(to bottom, lightgreen, green, darkgreen, lightgreen)  
    &-shield
      color: #C8F7C5
      background: linear-gradient(to bottom, darkTurquoise, #008B8B, #006B6B, #005B5B, #006B6B, #008B8B, darkTurquoise)
    &-hp-and-shield
      color: #C8F7C5
      background: linear-gradient(to bottom, #48D1CC, #3CB371, #2E8B57, #1B5E20, #2E8B57, #3CB371, #48D1CC)
  
</style>