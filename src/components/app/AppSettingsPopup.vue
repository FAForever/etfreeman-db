<script setup>
import { computed, inject } from 'vue'
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
const iconsScaled = inject('iconsScaled')
const scalingDown = inject('scalingDown')

const fields = ['id', 'name', 'description', 'faction', 'kind', 'type', 'categories', 'abilities']
const capitalize = s => s[0].toUpperCase() + s.slice(1)

const mode = computed({
  get: () => (manualZoomModifier.value ? 'manual' : 'auto'),
  set: v => { manualZoomModifier.value = v === 'manual' ? zoomModifier.value : null }
})

</script>

<template>
  <Popup :open="open" @close="emit('close')">
    <div class="asp">
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

          <div v-if="mode === 'manual'" class="asp__range">
            <input v-model.number="manualZoomModifier" type="range" min="0.5" max="2.5" step="0.05">
            <span class="asp__value">{{ Math.round(zoomModifier * 100) }}%</span>
          </div>
        </section>

        <section class="asp__section">
          <div class="asp__label">APP: sharp icons</div>
          <div class="asp__check-row">
            <label class="asp__check">
              <input v-model="iconsScaled" type="checkbox">
              <span>Enable</span>
            </label>
            <div v-if="iconsScaled" class="asp__radios asp__radios_inline">
              <label class="asp__radio">
                <input v-model="scalingDown" type="radio" name="iconScalingDir" :value="false">
                <span>Scale up</span>
              </label>
              <label class="asp__radio">
                <input v-model="scalingDown" type="radio" name="iconScalingDir" :value="true">
                <span>Scale down</span>
              </label>
            </div>
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

  &__check-row
    display: flex
    align-items: center
    gap: 16px

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
    display: flex
    align-items: center
    gap: 10px
    input
      flex: 1
      accent-color: rgba(100,150,255,.8)

  &__value
    font-size: 13px
    font-family: monospace
    min-width: 44px
    text-align: right

  &__check
    display: flex
    align-items: center
    gap: 8px
    font-size: 13px
    cursor: pointer
    input
      width: 16px
      height: 16px
      cursor: pointer

  &__hint
    font-size: 12px
    line-height: 1.4
    color: rgba(255,255,255,.55)
    background: rgba(255,255,255,.06)
    padding: 6px 10px
    border-radius: 4px
</style>
