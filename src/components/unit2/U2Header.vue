<script setup>
import Icon from '../Icon.vue'
import MassIcon from '../ui/MassIcon.vue'
import EnergyIcon from '../ui/EnergyIcon.vue'
import BuildtimeIcon from '../ui/BuildtimeIcon.vue'
import { shorten } from '../../composables/helpers/common.js'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useCompareStore } from '../../stores/compare.js'

const { unit } = defineProps(['unit'])
const compareStore = useCompareStore()
const { showUnitId } = storeToRefs(compareStore)

const baseUrl = import.meta.env.BASE_URL

const blueprintUrl = computed(() => {
  const isNomads = unit.faction?.toLowerCase() === 'nomads'
  const repo = isNomads ? 'nomads' : 'fa'
  const branch = isNomads ? 'master' : 'deploy/faf'
  return `https://github.com/FAForever/${repo}/blob/${branch}/units/${unit.id}/${unit.id}_unit.bp`
})

</script>

<template>
  <div class="u2header" :class="`u2header_${unit.faction}`">
    <a v-if="showUnitId" class="u2header__unitID new" :href="blueprintUrl" target="_blank">{{ unit.id }}</a>
    <a class="u2header__img calm" :href="blueprintUrl" target="_blank">
      <img class="u2header__img-bg" :src="`${baseUrl}img/${unit.General.Icon}.png`">
      <div class="u2header__img-main-wrap">
        <span :class="['u2header__img-main', 'icon_units', `icon-${unit.id}`]" :title="unit.fullName"></span>
      </div>
      <span :class="['u2header__img-strategic', `u2header__img-strategic_${unit.section.toLowerCase()}`, 'strategic', 'icon_strategic', `icon-${unit.faction}_${unit.strategicIcon}`]"></span>
    </a>
    <div class="u2header__content">
      <a v-if="unit.General.UnitName" class="u2header__title new" :href="blueprintUrl" target="_blank">{{ unit.General.UnitName }}</a>
      <div class="u2header__subtitle">
        <a v-if="!unit.General.UnitName" :href="blueprintUrl" target="_blank" class="new">{{ unit.rawTech == 'EXP' ? '' : unit.rawTech }} {{ unit.Description }}</a>
        <template v-else>{{ unit.rawTech == 'EXP' ? '' : unit.rawTech }} {{ unit.Description }}</template>
      </div>
      <div class="u2header__costs">
        <div class="u2header__cost">
          <MassIcon />
          <span class="u2header__cost-value">{{ shorten(unit.Economy.BuildCostMass) }}</span>
        </div>
        <div class="u2header__cost">
          <EnergyIcon />
          <span class="u2header__cost-value">{{ shorten(unit.Economy.BuildCostEnergy) }}</span>
        </div>
        <div class="u2header__cost">
          <BuildtimeIcon />
          <span class="u2header__cost-value">{{ shorten(unit.Economy.BuildTime) }}</span>
        </div>
      </div>
    </div>
    <Icon :name="unit.faction" :class="['u2header__faction', `u2header__faction_${unit.faction}`]"  />
  </div>
</template>

<style lang="sass">
@use 'sass:map'

$localfactions: colors.$factions2
$localfactions: map.merge($localfactions, (uef: color.adjust(map.get($localfactions, uef), $alpha: +0.15)))
.u2header
  align-self: start
  flex-grow: 1
  padding: 0 10px
  order: -3
  grid-column: span 2
  display: flex
  align-items: center
  gap: 10px
  position: relative
  &:not(:last-child)
    margin-bottom: 10px
  @each $name, $color in $localfactions
    &_#{$name}
      --factioncolor: #{$color}
  &__img
    position: relative
    flex-shrink: 0
    //
      &::after
        border-radius: 5px
        content: ''
        display: block
        position: absolute
        left: 0px
        top: -6px
        bottom: -6px
        width: 250px
        z-index: -100
        background: linear-gradient(to right, transparent 0%,var(--factioncolor) 10px, var(--factioncolor) 50%, transparent 100%)
        mask-image: linear-gradient(to bottom, transparent 0, white 10px, white calc(100% - 10px), transparent 100%)
        -webkit-mask-image: linear-gradient(to bottom, transparent 0, white 10px, white calc(100% - 10px), transparent 100%)

    >*
      display: block
    &-main
      width: 64px
      height: 64px
      position: relative
      left: 3px
      top: 3px
      &-wrap
        overflow: hidden
        width: 64px
        height: 64px
    &-bg
      position: absolute
      bottom: 0
      left: 0
      width: 100%
      height: auto
      z-index: -1
      filter: drop-shadow(1px 1px 0px white) drop-shadow(-1px -1px 0px white) drop-shadow(1px -1px 0px white) drop-shadow(-1px 1px 0px white)
    &-strategic
      position: absolute
      left: 2px
      top: 2px
      transform-origin: top left
      &_naval
        left: 3px
        top: 3px
  &__content
    display: flex
    align-self: stretch
    flex-direction: column
    justify-content: flex-start
    gap: 6px
  &__title
    width: fit-content
    font-family: var(--titlefont)
    letter-spacing: var(--titlespacing)
    font-size: 20px
    font-weight: 600
    color: inherit
    text-decoration: none
    &:hover
      text-decoration: underline
  &__subtitle
    font-size: 14px
    font-weight: 600
    &:first-child
      font-size: 18px
    a
      color: inherit
      text-decoration: none
      &:hover
        text-decoration: underline
  &__costs
    display: flex
    gap: 10px
  &__cost
    display: flex
    align-items: center
    gap: 3px
  &__cost-value
    font-weight: 600
    font-size: 18px
  &:has(.u2header__unitID) &__faction
    top: 10px
    width: 53px
    height: 50px
    right: 5px
  &__faction
    position: absolute
    right: 10px
    top: 0
    width: 67px
    height: 64px
    object-fit: contain
    object-position: top center
    @each $name, $color in $localfactions
      &_#{$name}
        fill: color.adjust($color, $alpha: -0.1)
  &__unitID
    position: absolute
    right: 5px
    width: 53px
    text-align: center
    top: -5px
    font-size: 12px
    font-weight: 600
    color: white
    opacity: 0.3
    z-index: 10
    text-decoration: none
    &:hover
      opacity: 1
      text-decoration: underline
</style>
