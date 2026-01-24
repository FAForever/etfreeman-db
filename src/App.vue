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
  background-color: #000
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
  opacity: 0.4
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

@each $name, $color in colors.$factions2
  .#{$name}-thumb-a
    background-color: transparent !important
    border: 0px solid color.adjust($color, $alpha: .5, $lightness: 30%) !important
    filter: contrast(120%)
  .#{$name}-thumb-a-wrap
    background-color: color.adjust($color, $alpha: -0.15) !important
    padding: 2px !important
    border: 0px solid color.adjust($color, $alpha: .5, $lightness: 30%) !important
    box-shadow: inset 0 0 4px 0px color.adjust($color, $alpha: +500%, $saturation: 700%, $lightness: 20%)
    border-radius: 4px !important
    --thumbwidth: 60px
    &:has(.selected)
      background-color: rgba(255,255,255,.2) !important
      .selected
        background-color: transparent !important

.pe-none
  pointer-events: none

.sm
  font-size: 80%

.w-fc
  width: fit-content

.ta-c
  text-align: center
.ta-r
  text-align: right

.indented
  padding-left: 5px
  box-sizing: border-box

.w-100
  width: 100%
</style>