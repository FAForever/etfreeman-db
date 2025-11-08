<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style lang="sass">
@use './sass/normalize.sass'
@use './sass/fonts.sass'
@use './sass/generated/units_sprites.sass'
@use './sass/generated/strategic_sprites.sass'
@use './sass/generated/ui_sprites.sass'

body
  background: #222 fixed url(/img/background.jpg) no-repeat 0 0 !important
  background-size: cover
  color: #fff
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  font-family: 'Muli', Verdana, Arial, sans-serif

#app
  flex-grow: 1
  display: flex
  flex-direction: column

  & > *:first-child
    flex-grow: 1

h1, h2, h3, h4, h5, h6
  font-family: 'Zeroes Three', 'Muli', Verdana, Arial, sans-serif

a
  text-decoration: none
  color: white
  &:not(.calm)
    &:hover, &:focus, &:active, &.active, &.selected
      background-color: rgba(255,255,255, .4) !important
  &.calm
    &:hover, &:focus, &:active
      color: colors.$orange

@each $name, $color in colors.$factions
  .#{$name}
    background-color: $color

.invisible
  visibility: hidden

.pe-none
  pointer-events: none

.sm
  font-size: 80%

.w-fc
  width: fit-content
</style>