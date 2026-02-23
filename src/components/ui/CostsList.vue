<script setup>
import SingleCostItem from './SingleCostItem.vue'
import { useMods } from '@/composables/useMods.js'

const props = defineProps({
  item: Object,
  size: { type: Number, default: 14 }
})
const { mods } = useMods(props, 'costslist', { size: 14 })
</script>

<template>
  <div class="costslist" :class="mods">
    <SingleCostItem type="mass" :value="item.BuildCostMass" />
    <SingleCostItem type="energy" :value="item.BuildCostEnergy" />
    <SingleCostItem type="buildtime" :value="item.BuildTime" />
  </div>
</template>

<style lang="sass">
.costslist
  display: flex
  gap: var(--costslist-gap, 8px)
  &_size-14 .singlecost__value
    font-size: 14px
  &_size-16 .singlecost__value
    font-size: 16px
  &_size-18 .singlecost__value
    font-size: 18px
</style>
