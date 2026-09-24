<script setup>
import { ref } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import Icon from '@/components/Icon.vue'

defineProps(['open'])
const emit = defineEmits(['close'])
const popupRef = ref(null)
useClickOutside(popupRef, () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="open" class="popup-overlay">
        <div ref="popupRef" class="popup-card">
          <slot />
          <button class="popup-close" @click="emit('close')"><Icon name="close" width="10" /></button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="sass" scoped>
.popup-overlay
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.7)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.popup-card,
.popup-card :deep(*)
  text-box-trim: trim-both
  text-box-edge: cap alphabetic

.popup-card
  background: linear-gradient(rgba(40,40,40,.95), rgba(20,20,20,.98))
  border: 1px solid rgba(255, 255, 255, .3)
  border-radius: 8px
  max-height: calc(80vh / var(--app-zoom))
  overflow: auto
  position: relative

.popup-close
  position: absolute
  top: 4px
  right: 4px
  display: flex
  background: none
  border: none
  color: rgba(255,255,255,.5)
  cursor: pointer
  padding: 6px
  &:hover
    color: white
</style>
