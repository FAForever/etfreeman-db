<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUnitData } from '../../composables/useUnitData.js'
import Icon from '../Icon.vue'

const router = useRouter()
const { clearSelection, contenders } = useUnitData()

const compareText = computed(() => contenders.value.size
  ? `compare&nbsp;<span>${contenders.value.size}</span>&nbsp;unit${contenders.value.size > 1 ? 's' : ''}`
  : 'select units to compare')
</script>

<template>
  <header class="filtersHeader">
    <button class="filtersHeader__btn filtersHeader__compare" :class="{ 'filtersHeader__compare_active': contenders.size }" 
      title="compare" :disabled="!contenders.size" @click="router.push('/' + [...contenders].join(','))"
      >
      <div v-html="compareText" />
    </button>
    <button type="button" title="clear selection" class="filtersHeader__btn filtersHeader__clear" :disabled="!contenders.size"
      @click="clearSelection">
      <Icon name="clear" />
    </button>
  </header>
</template>

<style lang="sass" scoped>
.filtersHeader
  display: flex
  align-items: center
  gap: 5px

  &__btn
    display: inline-flex
    align-items: center
    justify-content: center
    border-radius: 4px
    border: 1px solid var(--bcolor, #bbb)
    background: var(--bg, #111)
    box-shadow: inset 0 0 var(--insetradius, 8px) 0px var(--scolor, #777)
    transition: all 0.2s, font-size 0s, font-weight 0s
    cursor: pointer
    color: inherit
    &[disabled]
      --bcolor: #333
      box-shadow: none
      opacity: 0.5
      pointer-events: none
    &:hover
      --bg: #050505
      --bcolor: #ddd
      --scolor: #777
    &:active
      --bg: black
      --bcolor: white
      --scolor: black
      .icon, div
        transform: translateY(0.5px)

  &__compare
    font-size: 18px
    color: white
    height: 30px
    width: 200px
    text-decoration: none
    font-weight: 500
    white-space: nowrap
    &[disabled]
      font-size: 15px
    &_active:not(:hover)
      animation: glow-pulse 2s ease-in-out infinite alternate
    span
      font-weight: 800
      font-size: .92em
    div
      transition: transform .1s ease-out
      transform: translateY(-0.5px)

  &__clear
    width: 30px
    height: 30px
    padding: 0
    --insetradius: 4px
    .icon
      width: 24px
      height: 24px
      transition: transform .1s ease-out
      transform: translateY(-0.5px)
    &[disabled]
      .icon
        opacity: 0.5

@keyframes glow-pulse
  from
    box-shadow: 0 0 0px 0px rgba(255, 255, 255, 0.2), inset 0 0 3px 0px #888
    border-color: #bbb
  to
    box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.6), inset 0 0 5px 1px #aaa
    border-color: #eee
</style>
