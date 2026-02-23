<template>
  <a :class="thumbClasses" @click="handleUnitClick(item, $event)" :title="item.fullName">
    <div :class="['thumb__inner', 'icon_units', `icon-${item.id}`]">
      <span :class="['strategic', 'icon_strategic', `icon-${item.faction}_${item.strategicIcon}`]" />
      <span v-if="!mini && item.fullName?.endsWith('HQ')" class="thumb__HQ">HQ</span>
    </div>
  </a>
</template>

<script setup>
import { useUnitData } from '@/composables/useUnitData';
import { useDoubleClickHandler } from '@/composables/useDoubleClickHandler';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
const router = useRouter()
const props = defineProps(['item', 'mini'])
const { toggleUnitSelection, contenders } = useUnitData()
const { handleUnitClick } = useDoubleClickHandler(toggleUnitSelection, contenders, router)
const thumbClasses = computed(() => [
  'thumb', `thumb_${props.item.faction.toLowerCase()}`, { selected: props.item.selected },
  ...(props.mini ? ['thumb_mini', 'link-highlight'] : [])
])
</script>

<style lang="sass">
.thumb
  cursor: pointer
  position: relative
  display: block
  border-radius: 5px
  width: auto
  height: auto
  aspect-ratio: 1
  max-width: var(--thumbwidth, 64px)
  &:active
    transform: scale(0.99) translateY(1px)
  .strategic
    position: absolute
    top: 0
    left: 0

  &__HQ
    position: absolute
    right: 2px
    top: 2px
    font-size: 10px
    font-weight: 800
    z-index: 199
    color: white
    display: block
    text-shadow: -2px -2px 0 #000, 0 -2px 0 #000, 2px -2px 0 #000, 2px 0 0 #000, 2px 2px 0 #000, 0 2px 0 #000, -2px 2px 0 #000, -2px  0 0 #000
    border-radius: 5px

  &:not(&_mini)
    width: var(--thumbwidth,48px)
    height: var(--thumbwidth,48px)
    will-change: box-shadow, border-color, outline-color
    .strategic
      top: 1px
      left: 1px
    @each $name, $color in colors.$factions
      &.thumb_#{$name}
        background: linear-gradient(rgba(0,0,0,.27), rgba(0,0,0,.27))
        background-color: color.adjust($color, $alpha: -0.1)
        border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%) !important
        box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: .2, $saturation: 700%, $lightness: 20%)
        padding: 3px
        filter: contrast(110%)
        outline: 1px solid transparent
        transition: border .1s, box-shadow .1s, outline .1s, transform .1s
        &:hover
          border-color: color.adjust($color, $alpha: .5, $lightness: 30%) !important
          box-shadow: inset 0 0 6px 0px color.adjust($color, $alpha: .4, $saturation: 700%, $lightness: 20%)
          outline-color: color.adjust($color, $alpha: .5, $lightness: 30%) !important
        &.selected
          background-color: color.adjust($color, $alpha: 0, $lightness: 20%)
          filter: contrast(120%) brightness(120%) saturate(120%)
          border-color: color.adjust($color, $alpha: 1, $lightness: 30%) !important
          outline-color: color.adjust($color, $alpha: 1, $lightness: 30%) !important
          box-shadow: inset 0 0 8px 0px color.adjust($color, $alpha: 1, $saturation: 700%, $lightness: 20%), 0 0 5px 2px color.adjust($color, $alpha: 1, $saturation: 700%, $lightness: 20%)
  &__inner
    width: 100%
    height: 100%
  &_mini
    background: none
    width: 21px
    height: 21px
    display: flex
    justify-content: center
    align-items: center

    .strategic
      position: static
  &_mini &__inner
    display: contents
</style>
