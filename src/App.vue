<script setup>
import { RouterView } from 'vue-router'
import { useResizeWatcher } from '@/composables/useResizeWatcher'
import { useIcons } from '@/composables/useIcons'
import SvgSprite from '@/components/SvgSprite.vue'
import BackgroundPicture from '@/components/app/BackgroundPicture.vue'
import * as iconData from '@/data/svgicons/index.js'

const icons = Object.values(iconData)
useIcons(icons)
useResizeWatcher()

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 0) {
    document.body.classList.add('scrolled')
  } else {
    document.body.classList.remove('scrolled')
  }
})
</script>

<template>
  <SvgSprite :icons="icons" />
  <BackgroundPicture />
  <RouterView />
</template>

<style lang="sass">
@use './sass/normalize.sass'
@use './sass/fonts.sass'
@use './sass/abstracts/specials.sass'
@use './sass/generated/units_sprites.sass'
@use './sass/generated/strategic_sprites.sass'
@use './sass/generated/ui_sprites.sass'
@use './sass/modules/link.sass'
@use './sass/modules/math_tag.sass'
@use './sass/modules/tooltip.sass'

body
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  background-color: #090909
  @include specials.thinScrollbar

  color: #fff
  font-family: 'Nunito', 'Muli', Verdana, Arial, sans-serif
  --titlefont: 'Montserrat'
</style>