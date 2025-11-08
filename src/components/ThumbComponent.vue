<template>
  <a
    :class="[
      'thumb',
      'icon_units',
      item.faction?.toLowerCase(),
      `icon-${item.id}`,
      { selected: item.selected, 'thumb_mini': mini }
    ]"
    :title="`${item.fullName} [${item.id}]`"
    @click="handleClick"
  >
    <span
      :class="[
        'strategic',
        'icon_strategic',
        `icon-${item.faction}_${item.strategicIcon}`
      ]"
    ></span>
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
  border-radius: 3px
  width: auto
  height: auto
  aspect-ratio: 1
  max-width: 64px

  .strategic
    position: absolute
    top: 0
    left: 0

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