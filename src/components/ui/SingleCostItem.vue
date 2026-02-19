<script setup>
import { shorten } from '../../composables/helpers/common.js'
import MassIcon from './MassIcon.vue'
import EnergyIcon from './EnergyIcon.vue'
import BuildtimeIcon from './BuildtimeIcon.vue'

defineProps(['type', 'value'])
</script>

<template>
  <div class="singlecost">
    <MassIcon v-if="type === 'mass'" />
    <EnergyIcon v-else-if="type === 'energy'" />
    <BuildtimeIcon v-else />
    <span class="singlecost__value">{{ shorten(value) }}</span>
  </div>
</template>

<style lang="sass">
.singlecost
  display: flex
  align-items: center
  gap: 3px
  &__value
    font-weight: 600
</style>
