<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { parseStatLabel } from '@/stores/compare/customStatsVars'
import Popup from '@/components/ui/Popup.vue'

const props = defineProps(['stat', 'unitId', 'focusVar'])
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

onMounted(() => {
  const input = props.focusVar && popupRef.value?.querySelector(`input[data-var-input="${props.focusVar}"]`)
  if (input) input.select()
})
</script>

<template>
  <Popup :open="true" @close="emit('close')">
    <div ref="popupRef" class="svp">
      <div class="svp__title">{{ stat.label }}</div>
      <label v-for="n in vars" :key="n" class="svp__row">
        <span>{{ n }}</span>
        <input v-model="form[n]" :data-var-input="n" @keyup.enter="save" />
      </label>
      <div class="svp__actions">
        <label class="svp__check">
          <input type="checkbox" v-model="forAll" />
          <span>Set for all units</span>
        </label>
        <button class="svp__save" @click="save">Save</button>
      </div>
    </div>
  </Popup>
</template>

<style lang="sass" scoped>
.svp
  padding: 20px
  min-width: 320px
  max-width: 420px
  display: flex
  flex-direction: column
  gap: 10px

  &__title
    padding-right: 20px
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
    font-size: 13px
    &:hover
      background: rgba(100,150,255,.5)
</style>
