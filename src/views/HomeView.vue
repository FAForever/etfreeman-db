<template>
  <div class="home">
    <HomeTop />
    <div class="home__units" ref="containerRef">
      <div v-for="section in optimalOrder" :key="section.name" class="home__section">
        <div class="home__section-title-wrap">
          <div class="home__section-title">
            <template v-for="(chunk, idx) in section.name.split(' - ')" :key="idx">
              <span>{{ chunk }}</span><span v-if="idx < section.name.split(' - ').length - 1"> - </span>
            </template>
          </div>
        </div>
        <div class="home__section-content"
          :style="sectionMinWidths[section.name] ? { minWidth: `${sectionMinWidths[section.name]}px` } : undefined">
          <div v-for="[tierName, tierData], tierIndex in Object.entries(section.tiers)" :key="tierName"
            class="home__section-tier">
            <div class="home__faction-rows">
              <div class="home__faction-row home__faction-row--buttons">
                <button v-for="n in (tierButtons[section.name]?.[tierIndex] || 0)" :key="n"
                  @click="selectColumn(tierData, n)" class="home__faction-rows-colselect">+</button>
              </div>
              <div v-for="[faction, units] in Object.entries(tierData)" :key="faction"
                :class="['home__faction-row', `home__faction-row--${faction.toLowerCase()}`]">
                <ThumbComponent v-for="unit in units" :key="unit.id" :item="unit" @unit-click="handleUnitClick" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useDoubleClickHandler } from '../composables/useDoubleClickHandler.js'
import { useOptimalLayout } from '../composables/useOptimalLayout.js'
import HomeTop from '../components/HomeTop.vue'
import ThumbComponent from '../components/ThumbComponent.vue'

const router = useRouter()
const route = useRoute()
const { toggleUnitSelection, contenders, tierTree } = useUnitData()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)

const containerRef = ref(null)
const scrollbarGap = 10
const mobThreshold = 1120
const rawWidth = ref(document.body.offsetWidth)
const containerWidth = computed(() => rawWidth.value - scrollbarGap)

const tierButtons = {
  'Land': [5, 6, 3],
  'Air': [4, 4, 4],
  'Naval': [2, 3, 1],
  'Structures - Weapons': [3, 6, 4],
  'Construction - Buildpower': [2, 1, 2],
  'Structures - Economy': [5, 3, 3],
  'Structures - Intelligence': [2, 3, 2],
  'Structures - Support': [2, 1, 1],
  'Structures - Factories': [3, 6, 7],
  'Experimental': [1]
}

const sectionMinWidths = {
  'Structures - Intelligence': 60,
  'Construction - Buildpower': 60,
  'Experimental': 70
}

const { optimalOrder } = useOptimalLayout(tierTree, containerWidth)

const selectColumn = (tierData, index) => {
  const columnUnits = Object.values(tierData)
    .map(units => units[index - 1])
    .filter(Boolean)

  const allSelected = columnUnits.every(u => u.selected)

  if (allSelected) {
    columnUnits.forEach(u => toggleUnitSelection(u.id))
  } else {
    columnUnits.forEach(u => {
      if (!u.selected) toggleUnitSelection(u.id)
    })
  }
}

const onResize = () => {
  if (containerRef.value) {
    rawWidth.value = containerRef.value.clientWidth
  }
  if (window.innerWidth < mobThreshold && route.path !== '/by-class') {
    router.push('/by-class')
  }
}

const resizeFunctions = inject('resizeFunctions')

onMounted(() => {
  onResize()
  resizeFunctions.value.push(onResize)
})

onUnmounted(() => resizeFunctions.value = resizeFunctions.value.filter(fn => fn !== onResize))
</script>

<style lang="sass">
.home
  width: 100%
  display: flex
  flex-direction: column
  align-items: flex-start

  &__left
    flex-shrink: 0
    display: grid
    gap: 10px
    padding-top: 10px

  &__units
    display: flex
    flex-wrap: wrap
    gap: 10px
    align-content: flex-start
    flex-grow: 1
    width: 100%

  &__section
    background: rgba(0,0,0,.35)
    border: 2px solid rgba(255, 255, 255, .6)
    border-bottom-color: rgba(255, 255, 255, .15)
    border-radius: 5px
    padding: 0 6px 7px
    backdrop-filter: blur(1px)
    &-title-wrap
      container-type: inline-size
      white-space: nowrap
    &-title
      padding: 5px 0 8px
      font-weight: 700
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
        letter-spacing: 0

    &-content
      display: flex
  &__section-tier
    display: flex
    flex-direction: column
    gap: 6px
    &:not(:first-child)
      padding-left: 6px
    &:not(:last-child)
      padding-right: 6px
      border-right: 2px dashed rgba(255, 255, 255, .6)

  &__faction-rows
    display: flex
    flex-direction: column
    gap: 6px
    position: relative
    z-index: 1

  &__faction-row
    display: flex
    flex-wrap: wrap
    gap: 6px
    &:empty
      display: none
    &--buttons
      position: absolute
      z-index: -1

  &__faction-rows-colselect
    width: 48px
    display: flex
    align-items: center
    justify-content: center
    font-size: 10px
    font-weight: 700
    color: white
    border-radius: 4px
    border: 1px solid var(--bcolor, #aaa)
    opacity: 0
    pointer-events: auto
    transition: opacity 0.1s, transform 0.1s
    position: relative
    background: var(--bg,black)
    transition-delay: 0.3s
    box-shadow: inset 0 0 4px 0px var(--scolor, #777)
    z-index: -1
    &:hover
      --bg: #050505
      --bcolor: #ccc
      --scolor: #999
    &:active
      --bg: #111
      --bcolor: white
      --scolor: #aaa
      transform: scale(0.99) translateY(-14.5px) !important

    &::before, &::after
      content: ''
      z-index: -1
      opacity: 1
      position: absolute
      bottom: -15px
      left: 0
      right: 0
      width: 100%
      height: 15px
    &::after
      bottom: initial
      top: -15px
    &:hover
      transition-delay: 0s !important
      opacity: 1
      transform: translateY(-15px)

@for $i from 1 through 10
  .home__section-tier:has(> .home__faction-rows > .home__faction-row:not(.home__faction-row--buttons) > a:nth-of-type(#{$i}):hover) .home__faction-row--buttons button:nth-of-type(#{$i})
    opacity: 1
    transform: translateY(-15px)
    transition-delay: 0s !important

</style>
