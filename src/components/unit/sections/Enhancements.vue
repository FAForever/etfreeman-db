<script setup>
import { computed, ref } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { useEnhancementSort } from '@/composables/useEnhancementSort'
import { useFactionColorFilter } from '@/composables/useFactionColorFilter'
import leftArm from '@/assets/img/icons/left_arm.png'
import back from '@/assets/img/icons/back.png'
import rightArm from '@/assets/img/icons/right_arm.png'
import UEnhancement from '../helpers/Enhancement.vue'

const { unit } = defineProps(['unit'])
const compareStore = useCompareStore()

const activeTab = ref('RCH')

const SLOTS = [
  { key: 'RCH', icon: rightArm, label: 'Right Arm' },
  { key: 'Back', icon: back, label: 'Back' },
  { key: 'LCH', icon: leftArm, label: 'Left Arm' }
]

const { sortedEnhancements: activeEnhancements, groupedBySlot } = useEnhancementSort(
  unit.Enhancements, SLOTS,
  computed(() => compareStore.toggles.enhancementsTabs ? activeTab.value : null)
)

const { factionFilter } = useFactionColorFilter(() => unit.faction)

const isShown = computed(() => compareStore.showedSections['Enhancements'] && !!unit.Enhancements)
const rowSpan = computed(() => compareStore.toggles.enhancementsTabs ? 1 : 3)
const useTabs = computed(() => compareStore.toggles.enhancementsTabs)

const displaySlots = computed(() => SLOTS.filter(s => groupedBySlot.value[s.key]?.length))

defineExpose({ name: 'Enhancements', isShown, isCompact: false, rowSpan })
</script>

<template>
  <div class="uenhancements uc__section" :class="{ 'uenhancements_subgrid': !useTabs }"
    v-if="isShown" :style="{ '--factionFilter': factionFilter }">
    <template v-if="useTabs">
      <h2 class="uenhancements__title uc__section-title">Enhancements</h2>
      <div class="uenhancements__tabs">
        <button v-for="{ key, icon } in SLOTS" :class="['uenhancements__tab', { active: activeTab === key }]"
          @click="activeTab = key">
          <img :src="icon">
        </button>
      </div>
      <div class="uenhancements__content">
        <UEnhancement v-for="{ enhancement, hasDependents } in activeEnhancements"
          :enhancement="enhancement" :hasDependents="hasDependents" />
      </div>
    </template>

    <template v-else>
      <div v-for="(slot, index) in displaySlots" :style="{ gridRow: index + 1 }"
        class="uenhancements__row uenhancements__slot">
        <h2 v-if="!index" class="uenhancements__title uc__section-title">Enhancements</h2>
        <div class="uenhancements__slot-header">
          <img :src="slot.icon">
          <span>{{ slot.label }}</span>
        </div>
        <UEnhancement v-for="{ enhancement, hasDependents } in groupedBySlot[slot.key]"
          :enhancement="enhancement" :hasDependents="hasDependents" type="calm" />
      </div>
    </template>
  </div>
</template>

<style lang="sass">
.uenhancements
  position: relative
  padding: 0 !important
  container-type: initial !important
  &_subgrid
    display: grid
    grid-template-rows: subgrid
    grid-row: span 3 !important
  &__title
    margin: 0 !important
    padding: 0 var(--sectionpadding)
  &__tabs
    display: flex
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
  &__slot-header
    border-top: 1px solid var(--factioncolorsol)
    display: flex
    align-items: center
    gap: 6px
    padding: 0 5px
    background: rgba(0,0,0,0.3)
    & + .uenhancement .uenhancement__heading
      border-top: none !important
    img
      filter: var(--factionFilter)
    span
      font-weight: 600
      font-size: 14px
</style>
