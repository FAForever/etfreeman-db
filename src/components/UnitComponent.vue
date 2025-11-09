<template>
  <article :class="['unit-details', 'faction', unit.faction.toLowerCase()]">
    <UnitHeader :unit="unit" />
    <section class="unit-details__body">
      <table class="unit-details__table">
        <DefenseSection v-if="showedSections.Defense" :defense="unit.Defense" :economy="unit.Economy" />
        <EconomySection v-if="showedSections.Economy && hasEconomy" :economy="unit.Economy" />
        <AbilitiesSection v-if="showedSections.Abilities" :abilities="unit?.Display?.Abilities" />
        <IntelSection v-if="showedSections.Intel" :intel="unit.Intel" />
        <PhysicsSection v-if="showedSections.Physics" :physics="unit.Physics" />
        <AirPhysicsSection v-if="showedSections.AirPhysics && unit.Air?.MaxAirspeed" :air="unit.Air"
          :physics="unit.Physics" />
        <WreckageSection v-if="showedSections.Wreckage && unit.Wreckage?.HealthMult" :wreckage="unit.Wreckage"
          :defense="unit.Defense" :economy="unit.Economy" />
        <VeterancySection v-if="showedSections.Veterancy && unit.Veteran" :veteran="unit.Veteran"
          :defense="unit.Defense" :categories="unit.Categories" :tech="unit.tech" />
        <WeaponsSection v-if="showedSections.Weapons && unit.Weapon" :weapons="unit.Weapon" :unit="unit" />
        <UpgradesSection v-if="showedSections.Upgrades && unit.Enhancements" :enhancements="unit.Enhancements" />
      </table>
    </section>
  </article>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import UnitHeader from './unit/UnitHeader.vue'
import DefenseSection from './unit/DefenseSection.vue'
import EconomySection from './unit/EconomySection.vue'
import AbilitiesSection from './unit/AbilitiesSection.vue'
import IntelSection from './unit/IntelSection.vue'
import PhysicsSection from './unit/PhysicsSection.vue'
import AirPhysicsSection from './unit/AirPhysicsSection.vue'
import WreckageSection from './unit/WreckageSection.vue'
import VeterancySection from './unit/VeterancySection.vue'
import WeaponsSection from './unit/WeaponsSection.vue'
import UpgradesSection from './unit/UpgradesSection.vue'

const props = defineProps(['unit', 'showedSections'])

const hasEconomy = computed(() => {
  const eco = props.unit.Economy
  if (!eco) return false
  return eco.BuildRate || eco.StorageMass || eco.StorageEnergy ||
    eco.ProductionPerSecondMass || eco.ProductionPerSecondEnergy ||
    eco.MaintenanceConsumptionPerSecondEnergy
})
</script>

<style lang="sass">
.unit-details
  padding: 10px 5px 0
  margin: 0 1px 1px 0
  font-size: 14px
  max-width: 360px
  border: 1px solid rgba(255,255,255,.2)

  &__header
    padding: 0 0 10px
    color: colors.$orange
    display: grid
    grid-template-columns: auto 1fr
    grid-template-rows: auto 1fr
    gap: 0 8px

  &__thumb
    grid-row: span 2
    width: 40px

  & &__firstline td
    padding-bottom: 5px

  &__title
    margin: 0 0 2px
    padding: 0
    font-size: 16px
    font-weight: normal

  & &__minititle
    font-weight: 600
    padding-bottom: 4px

  &__table
    width: calc(100% + 10px)
    margin: 0 -5px
    min-width: min-content !important
    td
      min-width: min-content !important
      padding: 0 5px

    tbody:nth-child(even) tr
      background: rgba(0,0,0,.2)
    tbody:last-child tr:last-child td
      padding-bottom: 10px

    td
      vertical-align: top
      white-space: nowrap

      &:first-child
        min-width: 92px

      &:last-child
        white-space: normal

  &__sec
    td
      border-top: 1px solid rgba(255, 255, 255, .2)
      padding-top: 7px
      &:first-child
        white-space: normal
    &_spaced td
      padding-bottom: 8px
  &__sec-end td
    padding-bottom: 7px

  &__ic
    display: inline-block
    vertical-align: middle
</style>
