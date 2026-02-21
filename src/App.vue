<script setup>
import { provide } from 'vue'
import { RouterView } from 'vue-router'
import { useResizeWatcher } from '@/composables/useResizeWatcher'
import SvgSprite from '@/components/SvgSprite.vue'
import BackgroundPicture from '@/components/app/BackgroundPicture.vue'
import * as iconData from '@/data/svgicons/index.js'

const icons = Object.values(iconData)
provide('icons', Object.fromEntries(icons.map(i => [i.name, i])))
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
@use './sass/modules/fraction.sass'
@use './sass/modules/tooltip.sass'
@use './sass/modules/tool-btn.sass'

body
  display: flex
  flex-direction: column
  min-height: 100vh
  min-height: 100dvh
  background-color: #090909
  @include specials.thinScrollbar

  color: #fff
  font-family: Nunito
  --titlefont: Montserrat
</style>