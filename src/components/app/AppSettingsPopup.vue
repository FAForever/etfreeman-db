<script setup>
import { computed, inject, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore.js'
import Popup from '@/components/ui/Popup.vue'

defineProps(['open'])
const emit = defineEmits(['close'])

const filterStore = useFilterStore()
const { searchFields } = storeToRefs(filterStore)

const zoomModifier = inject('zoomModifier')
const manualZoomModifier = inject('manualZoomModifier')
const autoZoom = inject('autoZoom')
const manualIconScaling = inject('manualIconScaling')
const manualScalingDown = inject('manualScalingDown')

const initialZoom = ref(zoomModifier.value)
const captureZoom = () => initialZoom.value = zoomModifier.value

const fields = ['id', 'name', 'description', 'faction', 'kind', 'type', 'categories', 'abilities']
const capitalize = s => s[0].toUpperCase() + s.slice(1)

const mode = computed({
  get: () => (manualZoomModifier.value ? 'manual' : 'auto'),
  set: v => { manualZoomModifier.value = v === 'manual' ? zoomModifier.value : null }
})

const iconMode = computed({
  get: () => manualIconScaling.value == null ? 'auto' : (manualIconScaling.value ? 'on' : 'off'),
  set: v => { manualIconScaling.value = { auto: null, on: true, off: false }[v] }
})

</script>

<template>
  <Popup :open="open" @close="emit('close')" overflow-visible>
    <div class="asp" :style="{ '--app-initial-zoom': initialZoom }">
      <div class="asp__title">Settings</div>

      <section class="asp__section">
        <div class="asp__label">Unit filter: search in...</div>
        <div class="asp__fields">
          <label v-for="field in fields" :key="field" class="asp__field">
            <input type="checkbox" :checked="searchFields.has(field)" @change="filterStore.toggleSearchField(field)">
            <span>{{ capitalize(field) }}</span>
          </label>
        </div>
      </section>

      <section class="asp__section">
        <div class="asp__label">App: zoom level</div>
        <div class="asp__radios">
          <label class="asp__radio">
            <input v-model="mode" type="radio" name="appZoomMode" value="auto">
            <span>Auto ({{ Math.round(autoZoom * 100) }}%)</span>
          </label>
          <label class="asp__radio">
            <input v-model="mode" type="radio" name="appZoomMode" value="manual">
            <span>Manual</span>
          </label>
        </div>

        <div v-if="mode === 'manual'" class="asp__range-wrapper">
          <div class="asp__range">
            <input v-model.number="manualZoomModifier" type="range" min="0.5" max="2.5" step="0.05" @focus="captureZoom" @change="captureZoom">
            <span class="asp__value">{{ Math.round(zoomModifier * 100) }}%</span>
          </div>
        </div>
      </section>

      <section class="asp__section">
        <div class="asp__label">APP: sharp icons</div>
        <div class="asp__radios">
          <label class="asp__radio">
            <input v-model="iconMode" type="radio" name="iconScaling" value="auto">
            <span>Auto</span>
          </label>
          <label class="asp__radio">
            <input v-model="iconMode" type="radio" name="iconScaling" value="on">
            <span>On</span>
          </label>
          <label class="asp__radio">
            <input v-model="iconMode" type="radio" name="iconScaling" value="off">
            <span>Off</span>
          </label>
        </div>
        <div v-if="iconMode === 'on'" class="asp__radios asp__radios_inline">
          <label class="asp__radio">
            <input v-model="manualScalingDown" type="radio" name="iconScalingDir" :value="false">
            <span>Scale up</span>
          </label>
          <label class="asp__radio">
            <input v-model="manualScalingDown" type="radio" name="iconScalingDir" :value="true">
            <span>Scale down</span>
          </label>
        </div>
        <div class="asp__hint">
          Changes the size of the icons on the View B screen up to 2x using crisp pixel-art scaling instead
          of browser smoothing
          <br>Always works on view B, not always in other places (it depends)
          <br>Turn this on if the icons look blurry on your display
        </div>
      </section>
    </div>
  </Popup>
</template>

<style lang="sass" scoped>
.asp
  min-width: 320px
  max-width: 420px
  padding: 10px 10px 0
  display: flex
  flex-direction: column
  gap: 5px

  &__title
    margin-bottom: 5px
    font-weight: 600
    font-size: 15px
    color: rgba(255,255,255,1)
    text-transform: uppercase
    letter-spacing: 0.5px

  &__section
    padding: 10px 10px 10px
    width: calc(100% + 20px)
    margin-inline: -10px
    display: flex
    flex-direction: column
    gap: 10px
    &:nth-of-type(odd)
      background: rgba(0,0,0,.25)

  &__label
    font-size: 11px
    font-weight: 600
    color: rgba(255,255,255,.75)
    text-transform: uppercase
    letter-spacing: 0.5px

  &__fields
    display: grid
    grid-template-columns: auto auto
    gap: 6px 16px

  &__field
    display: flex
    align-items: center
    gap: 6px
    font-size: 13px
    color: rgba(255,255,255,.8)
    cursor: pointer
    &:hover
      color: white
    input
      accent-color: white
      width: 13px
      height: 13px
      cursor: pointer

  &__radios
    display: flex
    gap: 16px
    &_inline
      gap: 10px

  &__radio
    display: flex
    align-items: center
    gap: 6px
    font-size: 13px
    cursor: pointer
    input
      cursor: pointer

  &__range
    &-wrapper
      height: 16px
      position: relative
      display: flex
      align-items: center
    display: flex
    position: absolute
    align-items: center
    gap: 10px
    left: 50%
    top: 50%
    height: 100%
    translate: -50% -50%
    width: 100%
    &:active, &:has(input:active)
      scale: calc(1 / var(--app-zoom, 1) * var(--app-initial-zoom, 1))
    input
      flex: 1
      accent-color: rgba(100,150,255,.8)

  &__value
    font-size: 13px
    font-family: monospace
    min-width: 44px
    text-align: right

  &__hint
    font-size: 12px
    line-height: 1.4
    color: rgba(255,255,255,.55)
    background: rgba(255,255,255,.06)
    padding: 10px 8px
    border-radius: 4px
</style>
