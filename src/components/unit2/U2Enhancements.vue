<script setup>
import { ref, computed } from 'vue'
import leftArm from '@/assets/img/icons/left_arm.png'
import back from '@/assets/img/icons/back.png'
import rightArm from '@/assets/img/icons/right_arm.png'
import U2Enhancement from './U2Enhancement.vue'

const { unit } = defineProps(['unit'])

const activeTab = ref('RCH')

const tabs = [
  { key: 'RCH', icon: rightArm },
  { key: 'Back', icon: back },
  { key: 'LCH', icon: leftArm },
]

const activeEnhancements = computed(() => {
  if (!unit.Enhancements) return []

  const byKey = Object.fromEntries(
    Object.entries(unit.Enhancements)
      .filter(([_, e]) => !e.RemoveEnhancements && e.Name && e.Slot === activeTab.value)
  )

  const deps = {}
  for (const [key, e] of Object.entries(byKey)) {
    if (e.Prerequisite && byKey[e.Prerequisite]) {
      (deps[e.Prerequisite] ??= []).push(key)
    }
  }

  const roots = Object.keys(byKey).filter(key => !byKey[key].Prerequisite || !byKey[byKey[key].Prerequisite])

  const sorted = []
  const seen = new Set()

  const visit = (key) => {
    if (seen.has(key)) return
    seen.add(key)

    const e = byKey[key]
    if (e.Prerequisite && byKey[e.Prerequisite]) {
      visit(e.Prerequisite)
    }

    sorted.push({ enhancement: e, key })

    for (const dep of deps[key] || []) {
      visit(dep)
    }
  }

  for (const root of roots) {
    visit(root)
  }

  return sorted.map(({ enhancement, key }) => ({
    enhancement,
    nextIsChained: deps[key]?.length > 0
  }))
})

const colorMatrix = computed(() => {
  switch (unit.faction?.toLowerCase()) {
    case 'uef': return `${200/255} 0 0 0 0  ${230/255} 0 0 0 0  ${255/255} 0 0 0 0  0 0 0 1 0`
    case 'cybran': return `${255/255} 0 0 0 0  ${150/255} 0 0 0 0  ${150/255} 0 0 0 0  0 0 0 1 0`
    case 'aeon': return `${210/255} 0 0 0 0  ${250/255} 0 0 0 0  ${210/255} 0 0 0 0  0 0 0 1 0`
    case 'seraphim': return `${255/255} 0 0 0 0  ${230/255} 0 0 0 0  ${205/255} 0 0 0 0  0 0 0 1 0`
    case 'nomads': return `${255/255} 0 0 0 0  ${80/255} 0 0 0 0  ${0/255} 0 0 0 0  0 0 0 1 0`
    default: return '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'
  }
})

const filterId = computed(() => `colorTint-${unit.id}`)

const factionFilter = computed(() => {
  const base = `url(#${filterId.value})`
  switch (unit.faction?.toLowerCase()) {
    case 'nomads': return `${base} saturate(70%) brightness(150%)`
    default: return `${base} saturate(500%) `
  }
})

const isShown = computed(() => !!unit.Enhancements)

defineExpose({ isShown })
</script>

<template>
  <div class="u2enhancements uc__section" v-if="isShown">
    <svg style="width:0;height:0;position:absolute;">
      <defs>
        <filter :id="filterId">
          <feColorMatrix type="matrix" :values="colorMatrix"/>
        </filter>
      </defs>
    </svg>
    <div class="uc__section-query">
      <h2 class="u2enhancements__title uc__section-title">
        <span>Enhancements</span>
      </h2>
      <div class="u2enhancements__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['u2enhancements__tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <img :src="tab.icon" :style="{ '--factionFilter': activeTab === tab.key ? factionFilter : 'none' }">
        </button>
      </div>
      <div class="u2enhancements__content">
        <U2Enhancement
          v-for="{ enhancement, nextIsChained } in activeEnhancements"
          :key="enhancement.Name"
          :enhancement="enhancement"
          :nextIsChained="nextIsChained"
        />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.u2enhancements
  position: relative
  padding-bottom: 0 !important
  &__title
    margin-bottom: 0 !important
  &__tabs
    display: flex
    width: calc(100% + 20px)
    margin: 0 -10px
  &__tab
    flex: 1
    display: flex
    justify-content: center
    align-items: center
    padding: 0
    border: 1px solid rgba(255,255,255,.5)
    border-top: none
    border-bottom: none
    &:first-child
      border-left: none
    &:last-child
      border-right: none
    background: rgba(0,0,0,0.1)
    cursor: pointer
    &:hover
      background: rgba(0,0,0,0.2)
    &:not(.active)
      img
        opacity: 0.2
      &:hover
        img
          opacity: .5
    &.active
      background: rgba(0,0,0,0.3)
      img
        filter: var(--factionFilter)
  &__content
    width: calc(100% + 20px)
    margin: 0 -10px
</style>
