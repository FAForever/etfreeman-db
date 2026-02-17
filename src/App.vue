<template>
  <SvgSprite :icons="icons" />
  <img class="app-bg" src="/img/background.jpg" />
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useResizeWatcher } from '@/composables/useResizeWatcher'
import { useIcons } from '@/composables/useIcons'
import SvgSprite from '@/components/SvgSprite.vue'
import * as iconData from '@/data/svgicons/index.js'

const icons = Object.values(iconData)
useIcons(icons)

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 0) {
    document.body.classList.add('scrolled')
  } else {
    document.body.classList.remove('scrolled')
  }
})

useResizeWatcher()
</script>

<style lang="sass">
@use './sass/normalize.sass'
@use './sass/fonts.sass'
@use './sass/generated/units_sprites.sass'
@use './sass/generated/strategic_sprites.sass'
@use './sass/generated/ui_sprites.sass'

body
  background-color: #090909
  color: #fff
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  font-family: 'Nunito', 'Muli', Verdana, Arial, sans-serif

  --titlefont: 'Montserrat', 'Zeroes Three'
  --titlespacing: 0

  &::-webkit-scrollbar
    width: 8px
    height: 8px
  &::-webkit-scrollbar-track
    background: #050505
  &::-webkit-scrollbar-thumb
    background: #BBB
    cursor: pointer
    width: 6px
    height: 6px
    border: 2px solid #050505
    border-radius: 8px
    &:hover, &:active
      background: #FFF
  @supports not selector(::-webkit-scrollbar)
    scrollbar-width: thin

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

a:not(.new)
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
.ta-r
  text-align: right

.indented
  padding-left: 5px
  box-sizing: border-box

.w-100
  width: 100%

.nowrap
  white-space: nowrap

.important
  color: rgb(255,255,0)
  font-weight: bold

math
  font-family: 'Nunito', 'Muli', Verdana, Arial, sans-serif
  font-weight: inherit
  font-size: 1.1em
  padding-bottom: .1em
  mi
    padding-bottom: .3em
  mi:last-child
    padding-top: .3em

.not-dotted
  text-decoration: none !important  
[data-tooltip],[data-tooltip-big]
  .underline-dotted
    text-decoration: underline dotted
    text-underline-offset: 3px
    padding-bottom: 4px

[class*="icon_"]
  display: block
  background-repeat: no-repeat

[data-tooltip],[data-tooltip-big]
  position: relative
  text-decoration: underline dotted
  text-underline-offset: 4px
  &:hover::after
    content: attr(data-tooltip)
    line-height: 1.25
    white-space: pre-line
    font-size: var(--tooltipfontsize)
    position: absolute
    top: calc(100% + 5px)
    left: 50%
    transform: translateX(-50%)
    background: #333
    color: #fff
    padding: 5px
    border-radius: 5px
    z-index: 100
[data-tooltip-big]:hover::after
  content: attr(data-tooltip-big) !important
  width: max-content
  max-width: 250px
  padding: 8px
  left: 0 !important
  transform: none !important
  bottom: calc(100% + 5px)
  top: initial !important
[data-tooltip-top]:hover::after
  top: initial !important
  bottom: calc(100% + 5px)
[data-tooltip-right]:hover::after
  left: initial !important
  right: 0 !important
</style>