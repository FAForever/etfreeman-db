<script setup>
import AuthorBlock from './AuthorBlock.vue';
import FiltersComponent from './FiltersComponent.vue'
import Header from './Header.vue'
</script>

<template>
  <div class="home__top">
    <Header />
    <FiltersComponent />
    <AuthorBlock class="home__top-author" />
  </div>
</template>

<style lang="sass">
body.scrolled .home__top
  &::before, &::after
    content: ''
    position: absolute
    left: 0
    right: 0
    height: 50%
    z-index: -1
  &::before
    bottom: 50%
    background-color: #111
  &::after
    bottom: 0
    background: linear-gradient(to top, rgba(11,11,11,.75), #111)
    backdrop-filter: blur(4px)
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
    z-index: 2
    transition: .3s ease-out

    &-author
      margin-left: auto
      @include from(1000px)
        display: none
</style>

