<template>
  <div class="energy-icon">
    <div class="energy-icon__wrap">
      <img class="energy-icon__img" src="/img/ui/e_stripes_new.png">
    </div>
  </div>
</template>

<style lang="sass">
.energy-icon
  display: flex
  align-items: center
  flex-shrink: 0
  &__wrap
    border-radius: 50%
    background: color.adjust(rgba(237, 195, 25), $lightness: -42%)
  &__img
    position: relative
    z-index: 5
    display: block
    width: 18px
    height: 18px
    filter: drop-shadow(0px 0px 1px rgba(237, 195, 25, .7))
</style>
