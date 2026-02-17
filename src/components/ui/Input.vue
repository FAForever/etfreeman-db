<script setup>
defineProps({
  modelValue: String,
  placeholder: String,
  id: String,
  autocomplete: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="input"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :id="id"
    :autocomplete="autocomplete ?? 'off'"
  />
</template>

<style lang="sass" scoped>
.input
  width: 100%
  height: 30px
  border-radius: 5px
  padding: 5px 10px
  color: white
  border: 1px solid #333
  background: #111 !important
  opacity: 0.5
  &::placeholder
    color: #aaa
  &:focus
    opacity: 1
    border: 1px solid white
</style>
