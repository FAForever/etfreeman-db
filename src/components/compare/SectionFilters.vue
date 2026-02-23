<template>
  <div class="section-filters">
    <button
      v-for="(isShown, section) in filteredSections"
      :key="section"
      :class="['section-filters__btn', { active: isShown }]"
      @click="compareStore.toggleSection(section)"
    >
      {{ section }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCompareStore } from '@/stores/compare'

const compareStore = useCompareStore()

const filteredSections = computed(() => {
  const { Header, ...rest } = compareStore.showedSections
  return rest
})
</script>

<style lang="sass">
.section-filters
  display: grid
  grid-template-columns: repeat(10, min-content)
  gap: 6px
  @include from(900px)
    grid-template-columns: repeat(5, min-content)
  @include from(500px)
    grid-template-columns: repeat(3, min-content)
  &__btn
    display: flex
    align-items: center
    justify-content: center
    border-radius: 4px
    border: 1px solid var(--bcolor, #555)
    background: var(--bg, #111)
    box-shadow: inset 0 0 2px 0px var(--scolor, #333)
    transition: .2s
    padding: 6px 12px
    font-size: 14px
    &:hover
      --bg: #1a1a1a
      --bcolor: #888
    &:active
      --bg: #222
      --bcolor: white
      --scolor: black
    &.active
      --bcolor: #ccc
      --scolor: #666
    &:not(.active)
      opacity: 0.4
</style>
