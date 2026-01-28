<template>
  <header class="app-header" v-if="!isMobile">
    <div class="app-header__version ta-c sm">
      Game version: {{ version || '' }}
    </div>
    <div class="app-header__view-switcher">
      <router-link to="/" title="view units by kind" :class="['calm',{ active: route.path === '/' }]" @click="saveView('/')">View A</router-link>
      |
      <router-link to="/by-type" title="view units by type" :class="['calm',{ active: route.path === '/by-type' }]" @click="saveView('/by-type')">View B</router-link>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { inject } from 'vue'

const isMobile = inject('isMobile')
const route = useRoute()
const { version } = useUnitData()

const saveView = (path) => {
  localStorage.setItem('faf-last-view', path)
}
</script>

<style lang="sass">
.app-header
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  text-align: center
  gap: 5px
  padding-right: 10px
  padding-left: 5px
  align-self: stretch
  border-right: 1px dashed rgba(255,255,255,.1)

  &__version
    font-size: 10px
    opacity: .5

  &__view-switcher
    display: flex
    align-items: center
    gap: 3px
    a
      transition: opacity 0.2s
      &:not(.active,:hover)
        opacity: 0.5
</style>
