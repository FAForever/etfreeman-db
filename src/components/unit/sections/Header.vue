<script setup>
import Icon from '../../Icon.vue'
import CostsList from '@/components/ui/CostsList.vue'
import { computed } from 'vue'
import { useCompareStore } from '@/stores/compare'

const { unit } = defineProps(['unit'])
const compareStore = useCompareStore()

const baseUrl = import.meta.env.BASE_URL
const blueprintUrl = computed(() => {
  const isNomads = unit.faction?.toLowerCase() === 'nomads'
  const repo = isNomads ? 'nomads' : 'fa'
  const branch = isNomads ? 'master' : 'deploy/faf'
  return `https://github.com/FAForever/${repo}/blob/${branch}/units/${unit.id}/${unit.id}_unit.bp`
})

const subtitleProps = computed(() => unit.General.UnitName
  ? { is: 'div', attrs: {} }
  : { is: 'a', attrs: { href: blueprintUrl.value, target: '_blank', class: 'link link-underline' } }
)

const isShown = computed(() => compareStore.showedSections['Header'])

defineExpose({ name: 'Header', isShown, isCompact: false })
</script>

<template>
  <div class="uheader uc__section" :class="`uheader_${unit.faction}`">
    <a v-if="compareStore.toggles.showUnitId" class="uheader__unitID link link-underline" :href="blueprintUrl" target="_blank">{{ unit.id }}</a>
    <a class="uheader__img" :href="blueprintUrl" target="_blank">
      <img class="uheader__img-bg" :src="`${baseUrl}img/${unit.General.Icon}.webp`">
      <div class="uheader__img-main-wrap">
        <div :class="['uheader__img-main', 'icon_units', `icon-${unit.id}`]" :title="unit.fullName"></div>
      </div>
      <span :class="['uheader__img-strategic', `uheader__img-strategic_${unit.section.toLowerCase()}`, 'strategic', 'icon_strategic', `icon-${unit.faction}_${unit.strategicIcon}`]"></span>
    </a>
    <div class="uheader__content">
      <a v-if="unit.General.UnitName" class="uheader__title link link-underline" :href="blueprintUrl" target="_blank">{{ unit.General.UnitName }}</a>
      <component :is="subtitleProps.is" v-bind="subtitleProps.attrs" class="uheader__subtitle">{{ unit.rawTech == 'EXP' ? '' : unit.rawTech }} {{ unit.Description }}</component>
      <CostsList :item="unit.Economy" :size="18" />
    </div>
    <Icon :name="unit.faction" :class="['uheader__faction', `uheader__faction_${unit.faction}`]" />
  </div>
</template>

<style lang="sass">
.uheader
  display: flex
  height: fit-content
  gap: 8px
  position: relative
  --bottompadding: 7px
  &:last-child
    --bottompadding: 0px
  &__img
    align-self: center
    position: relative
    margin: 2px
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
    margin-top: 2px
    display: flex
    flex-direction: column
    align-items: flex-start
    gap: 6px
    --costslist-gap: 10px
  &__title
    font-family: var(--titlefont)
    font-size: 20px
    font-weight: 600
  &__subtitle
    font-size: 14px
    font-weight: 600
    &:first-child
      font-size: 18px
  &:has(.uheader__unitID) &__faction
    top: 10px
    width: 53px
    height: 50px
    right: 5px
  &__faction
    z-index: -1
    position: absolute
    right: 10px
    top: 0
    width: 67px
    height: 64px
    object-fit: contain
    object-position: top center
    fill: var(--factioncolortrans)
    &_uef
      fill: var(--factioncolor)
  &__unitID
    position: absolute
    min-width: 53px
    top: -5px
    right: 5px
    font-size: 12px
    text-align: center
    color: white
    font-weight: 600
    opacity: 0.3
    z-index: 10
    &:hover
      opacity: 1
</style>
