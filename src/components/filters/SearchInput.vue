<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore.js'
import { useClickOutside } from '@/composables/useClickOutside.js'
import Input from '../ui/Input.vue'
import SettingsButton from '../ui/SettingsButton.vue'

const filterStore = useFilterStore()
const { search: filterSearch, searchFields } = storeToRefs(filterStore)

const dropdownOpen = ref(false)
const dropdownRef = ref(null)
useClickOutside(dropdownRef, () => { dropdownOpen.value = false })

const fields = ['id', 'name', 'description', 'faction', 'kind', 'type', 'categories', 'abilities']
const capitalize = s => s[0].toUpperCase() + s.slice(1)
</script>

<template>
  <div class="search-input">
    <Input id="filter" placeholder="filter" v-model="filterSearch" />
    <SettingsButton v-model="dropdownOpen" class="search-input__btn" width="22" @mousedown.prevent @click.stop />
    <div v-if="dropdownOpen" class="search-input__dropdown" ref="dropdownRef">
      <span class="search-input__title">Search in...</span>
      <label v-for="field in fields" :key="field" class="search-input__field">
        <input type="checkbox" :checked="searchFields.has(field)" @change="filterStore.toggleSearchField(field)">
        {{ capitalize(field) }}
      </label>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.search-input
  position: relative
  display: flex
  width: 100%

  @include for-mob
    &__btn, &__dropdown
      display: none

  &__btn
    position: absolute
    right: 0
    top: 0
    bottom: 0
    margin: auto
    opacity: 0
    pointer-events: none
    transition: opacity .2s, transform .2s
    .search-input:focus-within &
      opacity: 1
      pointer-events: auto
      transform: translateX(calc(100% + 5px))
    &.active
      opacity: 1
      pointer-events: auto
      transform: translateX(calc(100% + 5px))

  &__dropdown
    position: absolute
    top: calc(100% + 4px)
    left: 0
    min-width: 100%
    width: max-content
    background: #111
    border: 1px solid #555
    border-radius: 5px
    padding: 6px 10px
    display: grid
    grid-template-columns: auto auto
    gap: 6px
    z-index: 10

  &__title
    grid-column: 1 / -1
    color: #aaa
    font-size: 11px
    margin-bottom: 2px

  &__field
    display: flex
    align-items: center
    gap: 3px
    cursor: pointer
    font-size: 13px
    color: #ccc
    &:hover
      color: white
    input
      accent-color: white
      width: 13px
      height: 13px
</style>
