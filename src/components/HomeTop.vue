<script setup>
import FiltersComponent from './FiltersComponent.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="home__top">
    <Header />
    <FiltersComponent :row="true" />
  </div>
</template>

<style lang="sass">
body.scrolled .home__top
  background: rgba(0,0,0,.75)
  backdrop-filter: blur(5px)
.mobile .home__top
  padding: 5px 5px 10px
.home
  &__top
    padding: 5px 0 10px
    display: flex
    align-items: center
    gap: 10px
    top: 0
    width: 100%
    position: sticky
    z-index: 1
    backdrop-filter: blur(0px)
    transition: .3s ease-out
</style>

