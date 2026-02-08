<script setup>
import { inject } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  width: { type: [String, Number] }
})

const icons = inject('icons', {})

if (!icons[props.name]?.viewBox) {
  console.error(`Icon: id "${props.name}" not found in icons`)
}
</script>

<template>
  <svg class="icon" v-bind="$attrs" :viewBox="icons[name]?.viewBox" :width="width || icons[name]?.width">
    <use :xlink:href="`#${name}`" />
  </svg>
</template>

<style lang="sass">
.icon
  flex-shrink: 0

</style>
