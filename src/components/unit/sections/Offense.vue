<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency'
import { useAutoShrinkTable } from '@/composables/useAutoShrinkTable'
import { useWeaponGroups } from '@/composables/useWeaponGroups'
import { useWeaponColumns } from '@/composables/useWeaponColumns'
import { EXPAND_SCORE_THRESHOLD } from '../../../composables/useRowAlignment'
import WeaponGroup from '../helpers/WeaponGroup.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const weapons = unit.Weapon
const compareStore = useCompareStore()
const { getFractionHTML } = useCalcEfficiency('weapon')

const { groups, sortedWeapons } = useWeaponGroups(weapons)
const { weaponColumns, columnHeaders } = useWeaponColumns(sortedWeapons, getFractionHTML)

const isCompact = computed(() => weaponColumns.value.length <= 3)
const isShown = computed(() => compareStore.showedSections['Offense'] && Object.keys(groups.value).length > 0)
const expandScore = computed(() => weaponColumns.value.length / 3 * EXPAND_SCORE_THRESHOLD)

defineExpose({ name: 'Offense', isCompact, isShown, expandScore })

const tableWrapRef = ref(null)
const tableRef = ref(null)
const weaponGroupRefs = ref([])

const { currentShrinkLevel, optimizeTableWidth, handleExpandChange, isReady }
  = useAutoShrinkTable(tableWrapRef, tableRef, weaponGroupRefs)

const anyGroupExpanded = computed(() => weaponGroupRefs.value.some(r => r?.isExpanded))
watch(anyGroupExpanded, handleExpandChange)
onMounted(optimizeTableWidth)
watch(weaponColumns, optimizeTableWidth)
</script>

<template>
  <div class="uoffense uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <h2 class="uc__section-title uoffense__header">Offense</h2>
    <div class="uoffense__table-wrap" ref="tableWrapRef">
      <table class="uoffense__table" ref="tableRef" :data-shrink="currentShrinkLevel" :class="{ 'uoffense__table_ready': isReady }">
        <thead>
          <tr>
            <th v-for="col in weaponColumns" :key="col" v-html="columnHeaders[col] || col" />
          </tr>
        </thead>
        <tbody>
          <WeaponGroup v-for="(weapons, category) in groups" :key="category" ref="weaponGroupRefs" :columns="weaponColumns"
            :weapons="weapons" :economy="unit.Economy" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="sass">

.uoffense
  --tooltipfontsize: 14.5px
  flex-grow: 1
  width: 100%
  .uc__section-title svg
    --color0: transparent
    margin-bottom: -2px
  &__table
    font-size: 15px
    opacity: 0
    border-collapse: collapse
    text-align: center
    &_ready
      opacity: 1
    &[data-shrink="1"]
      --cellpadding: 7px
    @for $level from 2 through 11
      &[data-shrink="#{$level}"]
        @if $level <= 4
          --cellpadding: #{8 - $level}px
        @if $level >= 5
          font-size: 14px
          --cellpadding: 4px
        @if $level >= 6
          font-size: 13px
        @if $level >= 7
          --cellpadding: 3px
        @if $level >= 8
          --cellpadding: 2.5px
        @if $level >= 9
          font-size: 12px
          --customspacing: -0.01em
        @if $level >= 10
          --cellpadding: 2px
          --customspacing: -0.015em
        @if $level >= 11
          font-size: 11.5px
          --customspacing: -0.02em
        .shrinkable-param
          width: min-content
    &-wrap
      width: calc(100% + 16px)
      margin: 0 -8px
    td:not(:first-child,:last-child)
      letter-spacing: var(--customspacing)
    tr.active td
      background: rgba(0,0,0,.3)
    td, th
      padding: 2px var(--cellpadding, 8px)
      transition: background 0.2s ease-out
    td[data-tooltip]:not(:has([data-tooltip-target]))
      padding-bottom: 7px
      padding-top: 7px
      text-underline-offset: 3px
    th [data-tooltip]
      display: block
      padding-bottom: 3px 
      padding-top: 3px
    tbody tr td
      padding-top: 4px
    td:not(:last-child), th:not(:last-child)
      border-right: 1px solid rgba(255,255,255,.1)
    tr:not(:last-child), thead tr
      td, th
        border-bottom: 1px solid rgba(255,255,255,.1)
</style>
