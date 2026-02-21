<script setup>
import { ref, computed } from 'vue'
import { useCompareStore } from '../stores/compare'
import ToggleSwitch from './ui/ToggleSwitch.vue'
import Select from './ui/Select.vue'

const store = useCompareStore()

const unitSelect = ref(null)
const weaponSelect = ref(null)

const unitModeOptions = computed(() => store.efficiencySettings.unitInvert ? [
  { value: 'hp/mass', label: 'mass / HP' },
  { value: 'hp/energy', label: 'energy / HP' },
  { value: 'hp/BT', label: 'BuildTime / HP' }
] : [
  { value: 'hp/mass', label: 'HP / mass' },
  { value: 'hp/energy', label: 'HP / energy' },
  { value: 'hp/BT', label: 'HP / BuildTime' }
])

const weaponModeOptions = computed(() => store.efficiencySettings.weaponInvert ? [
  { value: 'DPS/mass', label: 'mass / DPS' },
  { value: 'DPM/mass', label: 'mass / DPM' },
  { value: 'DPS/energy', label: 'energy / DPS' },
  { value: 'DPM/energy', label: 'energy / DPM' },
  { value: 'DPS/BT', label: 'BuildTime / DPS' },
  { value: 'DPM/BT', label: 'BuildTime / DPM' }
] : [
  { value: 'DPS/mass', label: 'DPS / mass' },
  { value: 'DPM/mass', label: 'DPM / mass' },
  { value: 'DPS/energy', label: 'DPS / energy' },
  { value: 'DPM/energy', label: 'DPM / energy' },
  { value: 'DPS/BT', label: 'DPS / BuildTime' },
  { value: 'DPM/BT', label: 'DPM / BuildTime' }
])
</script>

<template>
  <div class="settings-panel">
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">General</div>
      <div class="settings-panel__group-body">
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.showUnitId" />
          <span class="panel__toggle-text">Show unit ID</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.linedUpSections" />
          <span class="panel__toggle-text">Line up sections</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.compactSections" />
          <span class="panel__toggle-text">Compact sections</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.enhancementsTabs" />
          <span class="panel__toggle-text">Enhancements: tabs</span>
        </label>
      </div>
    </div>
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">Offense</div>
      <div class="settings-panel__group-body">
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.highlightGroupedWeapons" />
          <span class="panel__toggle-text">Highlight grouped weapons</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.minorWeaponStats.MuzzleVelocity" />
          <span class="panel__toggle-text">Show muzzle velocity</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.minorWeaponStats.FiringTolerance" />
          <span class="panel__toggle-text">Show firing tolerance</span>
        </label>
        <label class="panel__toggle">
          <ToggleSwitch v-model="store.toggles.minorWeaponStats.Yaw" />
          <span class="panel__toggle-text">Show turret yaw (angle)</span>
        </label>
      </div>
    </div>
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">Calculations</div>
      <div class="settings-panel__group-body">
        <label class="panel__select">
          <Select class="panel__select-select" ref="unitSelect" v-model="store.efficiencySettings.unitMode" :options="unitModeOptions"
            size="small" />
          <div class="panel__select-toggle" :class="{ visible: unitSelect?.open }">
            <label class="panel__toggle" @mousedown.stop @click.stop @pointerdown.stop>
              <ToggleSwitch v-model="store.efficiencySettings.unitInvert" />
              <span class="panel__toggle-text">Invert</span>
            </label>
          </div>
          <span class="panel__select-label" :class="{ 'fade-out': unitSelect?.open }">Health:</span>
        </label>
        <label class="panel__select">
          <Select class="panel__select-select" ref="weaponSelect" v-model="store.efficiencySettings.weaponMode"
            :options="weaponModeOptions" size="small" />
          <div class="panel__select-toggle" :class="{ visible: weaponSelect?.open }">
            <label class="panel__toggle" @mousedown.stop @click.stop @pointerdown.stop>
              <ToggleSwitch v-model="store.efficiencySettings.weaponInvert" />
              <span class="panel__toggle-text">Invert</span>
            </label>
          </div>
          <span class="panel__select-label" :class="{ 'fade-out': weaponSelect?.open }">Damage:</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.settings-panel
  position: relative
  width: fit-content
  z-index: 20
  border-radius: 4px
  padding: 10px
  background: linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,0))
  background-color: rgba(0,0,0,.35)
  border: 1px solid rgba(255, 255, 255, .3)
  box-shadow: inset 0 0 30px 5px rgb(0, 0, 0, 1)
  display: flex
  gap: 15px
  @include for-mob
    flex-direction: column
  &__group
    display: flex
    flex-direction: column
    gap: 4px

    &-title
      font-weight: 600
      font-size: 13px
      color: rgba(255,255,255,.7)

    &-body
      display: grid
      gap: 8px
      grid-template-columns: 1fr
      grid-auto-rows: 18px

.panel__toggle
  width: fit-content
  user-select: none
  display: flex
  align-items: center
  gap: 8px
  cursor: pointer

.panel__select
  position: relative
  grid-row: span 2
  display: flex
  flex-direction: column
  justify-content: space-between
  cursor: pointer
  color: white

  &-select
    order: 2
    &:hover
      z-index: 2
      position: relative
  &-select:hover ~ &-toggle
    z-index: 1
    opacity: 1
    transform: translateY(0)
  &-select:hover ~ &-label, &-toggle:hover ~ &-label
    opacity: 0

  &-label
    padding-top: 2px
    font-size: 14px
    transition: opacity 0.2s

    &.fade-out
      opacity: 0

  &-toggle
    padding-bottom: 20px
    position: absolute
    top: 0
    right: 0
    left: 0
    z-index: -2
    opacity: 0
    transform: translateY(20px)
    transition: opacity 0.2s, transform 0.2s
    &:hover
      z-index: 1
      opacity: 1
      transform: translateY(0)
    &.visible
      z-index: 1
      opacity: 1
      transform: translateY(0)
</style>
