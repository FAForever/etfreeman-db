<template>
  <div class="mass-icon">
    <div class="mass-icon__wrap">
      <img class="mass-icon__img" src="/img/ui/mass_stripes.png">
    </div>
  </div>
</template>

<style lang="sass">
.mass-icon
  display: flex
  align-items: center
  flex-shrink: 0
  &__wrap
    padding: 2px
    background: color.adjust(rgb(136, 216, 27), $lightness: -40%)
    border-radius: 50%
    box-shadow: inset 0 0 2px rgb(136, 216, 27)
    border: 1px solid rgb(136, 216, 27)
  &__img
    width: 12px
    height: 12px
    filter: drop-shadow(0px 0px 1px rgba(136, 216, 27, .5))
    display: block
</style>
