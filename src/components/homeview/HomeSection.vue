<script setup>
import { computed } from 'vue'
import HomeSectionTier from './HomeSectionTier.vue'
import { tierButtons, sectionMinWidths } from './config.js'

const props = defineProps(['section'])
const titleParts = computed(() => props.section.name.split(/( - )/))
</script>

<template>
  <div class="section">
    <div class="section__title-wrap">
      <div class="section__title">
        <span v-for="chunk in titleParts">{{ chunk }}</span>
      </div>
    </div>
    <div class="section__content" :style="{ minWidth: sectionMinWidths[section.name] }">
      <HomeSectionTier
        v-for="[tierName, tierData], tierIndex in Object.entries(section.tiers)"
        :key="tierName"
        :data="tierData"
        :buttonCount="tierButtons[section.name]?.[tierIndex] || 0"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.section
  background: linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,0))
  background-color: rgba(9,9,9,.7)
  border: 2px solid rgba(255, 255, 255, .65)
  border-bottom-color: rgba(255, 255, 255, .15)
  border-radius: 5px
  padding: 0 6px 7px
  overflow: hidden
  box-shadow: inset 0 0 30px 5px rgb(0, 0, 0, 1)

  &__title-wrap
    container-type: inline-size
    white-space: nowrap

  &__title
    padding: 5px 0 8px
    font-weight: 800
    font-size: 16px
    letter-spacing: 0.1em
    text-align: center
    width: 100%
    @container (max-width: 250px)
      span:not(:last-child)
        display: none
    @container (max-width: 150px)
      font-size: 14px
      letter-spacing: 0
    @container (max-width: 100px)
      font-size: 12px

  &__content
    display: flex
</style>
