<script setup>
import { ref, computed } from 'vue'
import { useMods } from '@/composables/useMods.js'
import { useClickOutside } from '@/composables/useClickOutside.js'

const props = defineProps(['options', 'placeholder', 'disabled', 'size'])
const modelValue = defineModel()

const { mods } = useMods(props, 'select', { size: null })
const open = ref(false)
const selectRef = ref(null)

useClickOutside(selectRef, () => open.value = false)

const normalized = computed(() =>
  props.options.map(o => typeof o === 'object' ? o : { value: o, label: String(o) })
)

const selected = computed(() =>
  normalized.value.find(o => o.value === modelValue.value)
)

const toggle = () => !props.disabled && (open.value = !open.value)
const select = opt => (modelValue.value = opt.value, open.value = false)

defineExpose({ open })
</script>

<template>
  <div class="select" :class="mods" ref="selectRef">
    <button type="button" class="select-trigger" :class="{ open }" :disabled @click="toggle">
      <span class="select-value" :class="{ placeholder: !selected }">
        {{ selected?.label || props.placeholder }}
      </span>
      <span class="select-arrow">▼</span>
    </button>
    <ul class="select-dropdown" v-show="open">
      <li v-for="opt in normalized" :class="{ selected: opt.value === modelValue }" @mousedown.stop.prevent="select(opt)">
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<style lang="sass" scoped>
.select
  position: relative
  width: 100%
  user-select: none

  &_size-small .select-trigger
    height: 22px
    padding: 2px 8px 0px
    font-size: 14px
  &_size-small .select-dropdown
    font-size: 14px
    li
      padding: 4px 8px

.select-trigger
  width: 100%
  height: 30px
  border-radius: 5px
  padding: 5px 10px
  background: #111
  color: white
  border: 1px solid #333
  display: flex
  justify-content: space-between
  align-items: center
  cursor: pointer
  transition: all 0.2s

  &:hover, &:focus, &.open
    border-color: white

  &:focus-visible
    outline: 2px solid white
    outline-offset: 2px

  &.open .select-arrow
    transform: rotate(180deg)

  &:disabled
    opacity: 0.3
    cursor: not-allowed

.select-value
  overflow: hidden
  color: white
  text-overflow: ellipsis
  white-space: nowrap

  &.placeholder
    color: #aaa

.select-arrow
  font-size: 10px
  transition: transform 0.2s
  color: #aaa
  flex-shrink: 0
  margin-left: 8px
  transform-origin: 50% 42%

.select-dropdown
  position: absolute
  top: 100%
  left: 0
  background: #111
  border: 1px solid #333
  border-radius: 5px
  margin-top: 2px
  max-height: 200px
  overflow-y: auto
  z-index: 1000
  list-style: none
  padding: 0
  margin-bottom: 0
  min-width: 100%

  li
    width: max-content
    max-width: 300px
    min-width: 100%
    padding: 8px 10px
    cursor: pointer
    color: white

    &:hover
      background: #222

    &.selected
      background: #333
</style>
