<script setup>
import { ref } from 'vue'
import ThumbComponent from '../ThumbComponent.vue'
import { useUnitData } from '@/composables/useUnitData.js'

const props = defineProps(['data', 'buttonCount'])

const { smartSelect } = useUnitData()
const selectColumn = index => {
  const units = Object.values(props.data).map(arr => arr[index - 1]).filter(Boolean)
  smartSelect(units)
}

const activeColumn = ref(null)
const onMouseOver = (e) => {
  if (e.target.classList.contains('thumb'))
    activeColumn.value = Array.from(e.target.parentNode.children).indexOf(e.target) + 1
}
const onMouseOut = (e) => {
  if (e.target.classList.contains('thumb'))
    activeColumn.value = null
}
</script>

<template>
  <div class="tier">
    <div class="tier__rows" @mouseover="onMouseOver" @mouseout="onMouseOut">
      <div class="tier__row tier__row_buttons">
        <button v-for="n in buttonCount" :key="n" @click="selectColumn(n)" class="tier__colselect"
          :class="{ 'active': activeColumn == n }">+</button>
      </div>
      <div v-for="[faction, units] in Object.entries(data)" :key="faction" class="tier__row" >
        <ThumbComponent v-for="unit in units" :key="unit.id" :item="unit" />
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.tier
  display: flex
  flex-direction: column
  gap: 6px
  &:not(:first-child)
    padding-left: 6px
  &:not(:last-child)
    padding-right: 6px
    border-right: 2px dashed rgba(255, 255, 255, .6)

  &__rows
    contain: layout style
    display: flex
    flex-direction: column
    gap: 6px
    position: relative
    z-index: 1

  &__row
    display: flex
    flex-wrap: wrap
    gap: 6px
    &:empty
      display: none
    &_buttons
      position: absolute
      z-index: -1
      flex-wrap: nowrap

  &__colselect
    position: relative
    width: 48px
    display: flex
    align-items: center
    justify-content: center
    pointer-events: auto
    opacity: 0
    transition: .1s
    transition-delay: 0.3s
    border-radius: 4px
    border: 1px solid var(--bcolor, #aaa)
    background: var(--bg, black)
    box-shadow: inset 0 0 4px 0px var(--scolor, #777)
    z-index: -1
    font-size: 10px
    font-weight: 800

    &:hover
      --bg: #050505
      --bcolor: #ccc
      --scolor: #999
      transition-delay: 0s
      opacity: 1
      transform: translateY(-15px)
    &:active
      --bg: #111
      --bcolor: white
      --scolor: #aaa
      transform: scale(0.99) translateY(-15px)

    &::before
      content: ''
      z-index: -1
      opacity: 1
      position: absolute
      width: 100%
      left: 0
      right: 0
      bottom: -15px
      top: -15px

    &.active
      opacity: 1
      transform: translateY(-15px)
      transition-delay: 0s
</style>
