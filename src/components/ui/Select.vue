<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select...' },
  disabled: Boolean
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const selectRef = ref(null)

const normalizedOptions = computed(() =>
  props.options.map(opt =>
    typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
  )
)

const selectedLabel = computed(() => {
  const found = normalizedOptions.value.find(o => o.value === props.modelValue)
  return found?.label ?? ''
})

const toggle = () => {
  if (!props.disabled) open.value = !open.value
}

const select = (opt) => {
  emit('update:modelValue', opt.value)
  open.value = false
}

const close = (e) => {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', close))
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <div class="select" ref="selectRef">
    <button
      type="button"
      class="select-trigger"
      :class="{ open, disabled }"
      @click="toggle"
      :disabled="disabled"
    >
      <span class="select-value" :class="{ placeholder: !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="select-arrow">▼</span>
    </button>
    <ul class="select-dropdown" v-show="open">
      <li
        v-for="opt in normalizedOptions"
        :key="opt.value"
        :class="{ selected: opt.value === modelValue }"
        @mousedown.stop.prevent="select(opt)"
      >
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

.select-trigger
  width: 100%
  height: 30px
  border-radius: 5px
  padding: 5px 10px
  background: #111
  color: white
  border: 1px solid #333
  opacity: 0.5
  display: flex
  justify-content: space-between
  align-items: center
  cursor: pointer
  transition: all 0.2s

  &:hover, &:focus, &.open
    opacity: 1
    border-color: white

  &:focus-visible
    outline: 2px solid white
    outline-offset: 2px

  &.open .select-arrow
    transform: rotate(180deg)

  &.disabled
    opacity: 0.3
    cursor: not-allowed

.select-value
  overflow: hidden
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
