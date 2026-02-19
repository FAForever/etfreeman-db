<template>
  <picture>
    <source srcset="/img/background.avif" type="image/avif">
    <img class="app-bg" src="/img/background.jpg" />
  </picture>
</template>

<style lang="sass">
.app-bg
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100%
  z-index: -100
  object-fit: cover
  object-position: center
  opacity: 0.4
</style>
