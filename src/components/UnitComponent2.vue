<template>
  <div class="uc faction" :class="unit.faction.toLowerCase()">
    <U2Header :unit="unit" />
    <U2Defense v-if="showedSections?.Defense" :unit="unit" />
    <U2Economy v-if="showedSections?.Economy && isEconomyFirst" :unit="unit" />
    <U2Offense v-if="showedSections?.Offense" :unit="unit" :weapons="unit.Weapon" />
    <U2Physics v-if="showedSections?.Physics" :unit="unit" />
    <U2Abilities v-if="showedSections?.Abilities" :unit="unit" />
    <U2Intel v-if="showedSections?.Intel" :unit="unit" />
    <U2Economy v-if="showedSections?.Economy && !isEconomyFirst" :unit="unit" />
    <U2Transport v-if="showedSections?.Transport && unit.Transport" :unit="unit" />
    <U2Veterancy v-if="canGetVeterancy && showedSections?.Veterancy && unit.Defense" :unit="unit" />
    <U2Wreckage v-if="showedSections?.Wreckage && unit.Wreckage?.HealthMult" :unit="unit" />
    <U2Enhancements v-if="showedSections?.Enhancements && unit.Enhancements" :unit="unit" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import U2Abilities from './unit2/U2Abilities.vue';
import U2Defense from './unit2/U2Defense.vue';
import U2Economy from './unit2/U2Economy.vue';
import U2Enhancements from './unit2/U2Enhancements.vue';
import U2Header from './unit2/U2Header.vue';
import U2Intel from './unit2/U2Intel.vue';
import U2Offense from './unit2/U2Offense.vue';
import U2Physics from './unit2/U2Physics.vue';
import U2Transport from './unit2/U2Transport.vue';
import U2Veterancy from './unit2/U2Veterancy.vue';
import U2Wreckage from './unit2/U2Wreckage.vue';

const props = defineProps(['unit', 'showedSections'])

const isEconomyFirst = computed(() => {
  const eco = props.unit.Economy || {}
  return (eco.BuildRate ?? 0) > 1 || eco.ProductionPerSecondMass || eco.ProductionPerSecondEnergy || (eco.MaintenanceConsumptionPerSecondEnergy >= 200)
})

const canGetVeterancy = computed(() =>
  props.unit.Weapon?.some(w =>
    !w.FireOnDeath && !['Teleport', 'Kamikaze', 'Death'].includes(w.WeaponCategory) && !(w.Label == "DeathWeapon") && (w.Damage || w.NukeInnerRingDamage)
  )
)
</script>

<style lang="sass">
@use 'sass:selector'
@each $name, $color in colors.$factions2
  .#{$name}
    --titlebg: #{color.adjust($color, $alpha: -0.1)}
    --factioncolor: #{$color}
    --factioncolorsolid: #{color.adjust($color, $alpha:1)}
    --factioncolorsoliddark: #{color.adjust($color, $alpha:1, $lightness: -30%)}
    .uc__li::before
      background: color.adjust($color, $alpha: 1)
    .uc__section::before,&::after
      background: color.adjust($color, $alpha: -0.1)
    .uc__section-title
      svg
        display: none
      background: var(--titlebg)
      border-top: 2px solid var(--factioncolor)
.uc
  overflow: hidden
  padding: 10px 0 3px
  position: relative
  border-radius: 5px
  display: flex
  flex-wrap: wrap
  &:has(.u2enhancements:last-child)
    padding-bottom: 0
  &:has(.u2header:last-child)
    padding-bottom: 10px

  &:hover
    z-index: 100
  @each $name, $color in colors.$factions2
    &.#{$name}
      background: linear-gradient(rgba(0,0,0,.37), rgba(0,0,0,.37))
      background-color: color.adjust($color)
      border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%) !important
      box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: .2, $saturation: 700%, $lightness: 20%)
      filter: contrast(110%)
      outline: 1px solid transparent
      transition: border .1s, box-shadow .1s, outline .1s, transform .1s
  &__section
    position: relative
    flex-grow: 1
    padding-left: 10px
    padding-right: 10px
    padding-bottom: 5px
    flex-grow: 1
    flex-basis: 100%
    container-type: inline-size
    &_compact
      flex-basis: 50%
    &::before, &::after
      content: ''
      position: absolute
      left: -2px
      top: 2px
      z-index: 50
      display: none
      height: calc(100% - 2px)
      width: 2px
    &::after
      right: -2px
      left: initial
    &-query
      container-type: inline-size
      width: 100%
    &-title
      font-family: var(--titlefont)
      letter-spacing: var(--titlespacing)
      font-weight: 600
      font-size: 16px
      display: flex
      gap: 3px
      height: 31px
      margin: 0 -10px 5px
      padding: 0 10px
      align-items: center
      text-align: left
      justify-content: flex-start
      width: calc(100% + 20px)
      color: white
      svg
        --color1: transparent        

    &-line
      --columncount: 12
      display: grid
      grid-template-columns: repeat(var(--columncount), 1fr)
      padding: 3px 0
      gap: 6px 5px
      >*
        grid-column: span 6
      &_flex
        display: flex
        justify-content: space-between
        flex-wrap: wrap
        gap: var(--flexgap, 10px)
      &-item
        display: flex
  &__li
    white-space: nowrap
    padding-left: 12px
    position: relative
    &:first-child:last-child
      grid-column: span 12
    &::before
      content: ''
      width: .5em
      height: .5em
      border-radius: 50%
      position: absolute
      left: 0
      top: 50%
      transform: translateY(-50%)

.uc
  @container (max-width: 350px)
    .uc__section-line
      --columncount: 6
      --flexgap: 6px 5px
      display: grid

</style>
