<script setup>
import { shorten } from '../../composables/helpers/common.js'
import MassIcon from '../ui/MassIcon.vue'
import EnergyIcon from '../ui/EnergyIcon.vue'
import BuildtimeIcon from '../ui/BuildtimeIcon.vue'

const props = defineProps(['projectile'])
</script>

<template>
  <div class="u2projectile">
    <div class="u2projectile__heading">
      <span class="u2projectile__title">{{ projectile.Description }}</span>
      <div class="u2projectile__costs">
        <div class="u2projectile__cost">
          <MassIcon />
          <span class="u2projectile__cost-value">{{ shorten(projectile.BuildCostMass) }}</span>
        </div>
        <div class="u2projectile__cost">
          <EnergyIcon />
          <span class="u2projectile__cost-value">{{ shorten(projectile.BuildCostEnergy) }}</span>
        </div>
        <div class="u2projectile__cost">
          <BuildtimeIcon />
          <span class="u2projectile__cost-value">{{ shorten(projectile.BuildTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.u2projectile
  width: calc(100% + 20px)
  margin: 0 -10px
  & + & &__heading
    border-top: none
  &:nth-last-child(1) &__heading
    border-bottom: none
  &__heading
    padding: 5px 10px 5px
    display: flex
    flex-wrap: wrap
    justify-content: space-between
    align-items: center
    gap: 4px 10px
    border: 1px solid var(--factioncolor)
    background: var(--titlebg)
  &__title
    font-family: var(--titlefont)
    font-weight: 600
    font-size: 14px
  &__costs
    display: flex
    flex-wrap: wrap
    gap: 10px
  &__cost
    display: flex
    align-items: center
    gap: 3px
  &__cost-value
    font-weight: 600
    font-size: 16px
</style>
