<script setup>
import { computed, ref } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { getTooltip, getTractorTooltip } from '@/composables/weapon/weaponTooltips'
import { useWeaponGrouping } from '@/composables/weapon/useWeaponGrouping'

const { weapons, category, columns, economy } = defineProps(['weapons', 'category', 'columns', 'economy'])
const compareStore = useCompareStore()

const isExpanded = ref(true)
const toggleExpanded = () => { isExpanded.value = !isExpanded.value }
defineExpose({ toggleExpanded, isExpanded })

const { aggregatedStats, groupedWeapons, getDisplayName, stats } =
  useWeaponGrouping(weapons, category, columns, economy, isExpanded)

const tractorTooltip = getTractorTooltip(weapons)

const shouldHighlightCollapsed = computed(() =>
  compareStore.toggles.highlightGroupedWeapons && !isExpanded.value && weapons.length > 1
)

const getCellTooltip = (weapon, col) => getTooltip(weapon, col, category)

const getCellContent = (weapon, col) => stats.getStatText(weapon, col, undefined) ?? '-'
</script>

<template>
  <tr v-if="weapons.length == 1">
    <td v-for="col in columns" :key="col" :data-tooltip="getCellTooltip(weapons[0], col)" data-tooltip-params="big-top-left" v-html="getCellContent(weapons[0], col)" />
  </tr>
  <template v-else>
    <tr class="weaponGroup" :class="{ active: isExpanded, highlighted: shouldHighlightCollapsed }" @click="toggleExpanded" style="cursor: pointer">
      <template v-for="col, index in columns" :key="col">
        <td v-if="index" v-html="aggregatedStats[col] || '-'" />
        <td v-else :data-tooltip="tractorTooltip" data-tooltip-params="big-top-right">
          <div class="groupToggle" @click.stop="toggleExpanded">
            <div class="groupToggle__triangle" :class="{ active: isExpanded }"></div>
            <div v-html="aggregatedStats[col] || '-'"></div>
          </div>
        </td>
      </template>
    </tr>
    <template v-if="isExpanded">
      <tr v-for="group, index in groupedWeapons" :key="group.signature" class="active" :class="{'lastWeapon': index == groupedWeapons.length - 1}">
        <td v-for="col, colIndex in columns" :key="col"
        :data-tooltip="colIndex ? getCellTooltip(group.weapons[0], col) : undefined"
        data-tooltip-params="big-top-left"
        v-html="colIndex ? getCellContent(group.weapons[0], col) : getDisplayName(group)"></td>
      </tr>
    </template>
  </template>
</template>

<style lang="sass">
.weaponGroup
  &__important
    color: rgb(255,255,0)
  &.active td
    border-top: 1px solid rgba(255,255,255,.5)
    padding-top: 5px
  &.highlighted td
    background: rgba(0,0,0,.3)
    border-top: 1px solid rgba(255,255,255,.5) !important
    border-bottom: 1px solid rgba(255,255,255,.5) !important
    padding-top: 5px
    padding-bottom: 5px
  &.highlighted:hover td
    background: rgba(0,0,0,.3)
  &:hover:not(.active):not(.highlighted) td
    background: rgba(0,0,0,.1)
.lastWeapon.active td:nth-child(n)
  border-bottom: 1px solid rgba(255,255,255,.5)
  padding-bottom: 5px
.active .groupToggle
  font-weight: 800 !important
.groupToggle
  display: flex
  justify-content: center
  align-items: center
  gap: 3px
  &__triangle
    width: 0
    height: 0
    border-left: 4px solid transparent
    border-right: 4px solid transparent
    border-top: 6px solid currentColor
    transition: transform 0.2s ease
    cursor: pointer
    &.active
      transform: rotate(180deg)
.shrinkable-param
  width: min-content
  margin: auto
</style>
