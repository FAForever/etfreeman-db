<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore.js'
import Input from '../ui/Input.vue'
import SettingsButton from '../ui/SettingsButton.vue'
import AppSettingsPopup from '../app/AppSettingsPopup.vue'

const filterStore = useFilterStore()
const { search: filterSearch } = storeToRefs(filterStore)

const settingsOpen = ref(false)

function onKeydown(e) {
  if (e.key.length !== 1 || e.key.match(/\s/) || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.target.closest('input, textarea, select, button, a[href], [contenteditable]')) return
  document.getElementById('filter-input').focus()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="search-input">
    <Input id="filter-input" placeholder="filter" v-model="filterSearch" />
    <SettingsButton class="search-input__settings" v-model="settingsOpen" width="22" @click.stop />
    <AppSettingsPopup :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<style lang="sass" scoped>
.search-input
  position: relative
  display: flex
  gap: 5px
  width: 100%

  &:not(:focus-within) &__settings:not(:hover, :active, .active)
    --bcolor: #333
    box-shadow: none
    opacity: 0.5
</style>
