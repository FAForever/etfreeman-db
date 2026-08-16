<script setup>
import { ref, reactive, computed } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { parseStatLabel } from '@/stores/compare/customStatsVars'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps(['stat', 'unitId'])
const emit = defineEmits(['close'])

const store = useCompareStore()
const popupRef = ref(null)
const forAll = ref(true)
const vars = computed(() => parseStatLabel(props.stat.label).vars)
const form = reactive(Object.fromEntries(vars.value.map(n => [n, String(store.getVarValue(props.stat, props.unitId, n))])))

const save = () => {
  store.setVarOverrides(props.stat.id, { ...form }, forAll.value ? null : props.unitId)
  emit('close')
}

useClickOutside(popupRef, () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div class="svp__overlay">
      <div ref="popupRef" class="svp__popup">
        <div class="svp__title">{{ stat.label }}</div>
        <label v-for="n in vars" :key="n" class="svp__row">
          <span>{{ n }}</span>
          <input v-model="form[n]" />
        </label>
        <div class="svp__actions">
          <label class="svp__check">
            <input type="checkbox" v-model="forAll" />
            <span>Set for all units</span>
          </label>
          <button class="svp__save" @click="save">Save</button>
        </div>
        <button class="svp__close" @click="emit('close')">×</button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="sass" scoped>
.svp__overlay
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.7)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.svp
  &__popup
    background: linear-gradient(rgba(40,40,40,.95), rgba(20,20,20,.98))
    border: 1px solid rgba(255, 255, 255, .3)
    border-radius: 8px
    padding: 20px
    min-width: 320px
    max-width: 420px
    position: relative
    display: flex
    flex-direction: column
    gap: 10px

  &__title
    font-weight: 600
    font-size: 13px
    color: rgba(255,255,255,.7)
    text-transform: uppercase
    letter-spacing: 0.5px

  &__row
    display: flex
    align-items: center
    gap: 10px
    font-size: 13px
    span
      color: rgba(255,255,255,.6)
      min-width: 60px
      font-family: monospace
    input
      flex: 1
      background: #111
      border: 1px solid #333
      border-radius: 4px
      padding: 6px 10px
      color: white
      font-size: 14px
      font-family: inherit
      &:focus
        border-color: rgba(100,150,255,.7)
        outline: none

  &__actions
    display: flex
    align-items: center
    justify-content: space-between
    margin-top: 6px

  &__check
    display: flex
    align-items: center
    gap: 8px
    font-size: 13px
    color: rgba(255,255,255,.6)
    cursor: pointer
    input
      width: 15px
      height: 15px
      cursor: pointer

  &__save
    background: rgba(100,150,255,.3)
    border: 1px solid rgba(100,150,255,.5)
    color: white
    padding: 7px 22px
    border-radius: 4px
    cursor: pointer
    font-size: 13px
    &:hover
      background: rgba(100,150,255,.5)

  &__close
    position: absolute
    top: 10px
    right: 10px
    background: none
    border: none
    color: rgba(255,255,255,.5)
    font-size: 24px
    cursor: pointer
    line-height: 1
    &:hover
      color: white
</style>
