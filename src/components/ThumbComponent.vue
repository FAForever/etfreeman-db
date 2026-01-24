<template>
  <a :class="[
    'thumb',
    `thumb_${item.faction.toLowerCase()}`,
    { selected: item.selected, 'thumb_mini': mini, 'calm': !mini }
  ]" :title="`${item.fullName} [${item.id}]`" @click="handleClick">
    <div class="thumb__inner icon_units" :class="`icon-${item.id}`" v-if="!mini">
      <span :class="[
        'strategic',
        'icon_strategic',
        `icon-${item.faction}_${item.strategicIcon}`
      ]" />
    </div>
    <span v-else :class="[
      'strategic',
      'icon_strategic',
      `icon-${item.faction}_${item.strategicIcon}`
    ]"/>
  </a>
</template>

<script setup>
const props = defineProps(['item', 'mini'])
const emit = defineEmits(['unit-click'])

function handleClick(event) {
  emit('unit-click', props.item, event)
}
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

  .strategic
    position: absolute
    top: 0
    left: 0

  &:not(&_mini)
    width: var(--thumbwidth,48px)
    height: var(--thumbwidth,48px)
    @each $name, $color in colors.$factions2
      &.thumb_#{$name}
        background-color: color.adjust($color, $alpha: -0.15)
        border: 1px solid color.adjust($color, $alpha: .1, $lightness: 30%) !important
        box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: .2, $saturation: 700%, $lightness: 20%)
        padding: 3px
        filter: contrast(110%)
        &.selected
          filter: contrast(120%) brightness(120%) saturate(120%)
          border: 1px solid color.adjust($color, $alpha: 1, $lightness: 30%) !important
          outline: 1px solid color.adjust($color, $alpha: 1, $lightness: 30%) !important
          box-shadow: inset 0 0 8px 0px color.adjust($color, $alpha: 1, $saturation: 700%, $lightness: 20%), 0 0 5px 2px color.adjust($color, $alpha: 1, $saturation: 700%, $lightness: 20%)
  &__inner
    width: 100%
    height: 100%
  &_mini
    background: none
    width: 21px
    height: 21px
    margin-right: 3px
    margin-bottom: 8px

    .strategic
      top: 1px
      left: 2px
</style>