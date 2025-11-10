<template>
  <img class="app-bg" src="/img/background.jpg"/>    
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
  background-color: #222
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

.app-bg
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100%
  z-index: -100
  object-fit: cover
  object-position: center

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

.pe-none
  pointer-events: none

.sm
  font-size: 80%

.w-fc
  width: fit-content

.ta-c
  text-align: center

.w-100
  width: 100%
</style>