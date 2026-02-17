<template>
  <div class="section-toggles" ref="containerRef">
    <button class="section-toggles__btn" title="toggle sections" @click="toggle">
      <Icon name="cog" />
    </button>
    <ul v-if="show" class="section-toggles__popup" @mouseenter="cancelClose" @mouseleave="scheduleClose">
      <li v-for="(isShown, section) in showedSections" :key="section">
        <button :class="['section-toggles__btn', 'sm', { active: isShown }]" @click="toggleSection(section)">
          {{ section }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

const STORAGE_KEY = 'faf-compare-sections-v2'

const showedSections = ref({
  Defense: true,
  Economy: true,
  Offense: true,
  Physics: true,
  Abilities: true,
  Intel: true,
  Transport: true,
  Veterancy: true,
  Wreckage: true,
  Enhancements: true
})

defineExpose({ showedSections })

const show = ref(false)
const containerRef = ref(null)
let leaveTimeout = null

function toggle() {
  show.value = !show.value
}

function toggleSection(section) {
  showedSections.value[section] = !showedSections.value[section]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(showedSections.value))
}

function cancelClose() {
  clearTimeout(leaveTimeout)
}

function scheduleClose() {
  leaveTimeout = setTimeout(() => show.value = false, 300)
}

function onClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    show.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return
  try {
    Object.assign(showedSections.value, JSON.parse(stored))
  } catch (e) {
    console.error('Failed to parse section visibility', e)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  clearTimeout(leaveTimeout)
})
</script>

<style lang="sass">
.section-toggles
  position: relative

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
    width: 30px
    height: 30px
    padding: 0
    --insetradius: 4px
    .icon
      width: 24px
      height: 24px
      transition: transform .1s ease-out
      transform: translateY(-0.5px)
    &:hover
      --bg: #050505
      --bcolor: #ddd
    &:active
      --bg: black
      --bcolor: white
      --scolor: black
      .icon
        transform: translateY(0.5px)
    &.sm
      width: auto
      padding: 3px 6px
      font-size: 12px
      height: auto
      --insetradius: 2px
    &.active
      --bcolor: #8f8
      --scolor: #4a4
    &:not(.active)
      opacity: 0.5

  &__popup
    position: absolute
    right: 0
    top: 100%
    margin-top: 4px
    display: grid
    grid-template-columns: repeat(2, auto)
    gap: 4px
    padding: 8px
    background: rgba(0, 0, 0, 0.95)
    border: 1px solid rgba(255, 255, 255, 0.2)
    border-radius: 4px
    z-index: 100
    list-style: none
</style>
