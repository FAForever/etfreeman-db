<script setup>
import { useCompareStore } from '../stores/compare.js'
import ToggleSwitch from './ui/ToggleSwitch.vue'
import Select from './ui/Select.vue'

const store = useCompareStore()

const unitModeOptions = [
  { value: 'hp/mass', label: 'HP / mass' },
  { value: 'hp/energy', label: 'HP / energy' },
  { value: 'hp/BT', label: 'HP / BuildTime' }
]

const weaponModeOptions = [
  { value: 'DPS/mass', label: 'DPS / mass' },
  { value: 'DPM/mass', label: 'DPM / mass' },
  { value: 'DPS/energy', label: 'DPS / energy' },
  { value: 'DPM/energy', label: 'DPM / energy' },
  { value: 'DPS/BT', label: 'DPS / BuildTime' },
  { value: 'DPM/BT', label: 'DPM / BuildTime' }
]
</script>

<template>
  <div class="settings-panel">
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">General</div>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.showUnitId" />
        <span class="panel__toggle-text">Show unit ID</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.linedUpSections" />
        <span class="panel__toggle-text">Line up sections</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.compactSections" />
        <span class="panel__toggle-text">Compact sections</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.enhancementsTabs" />
        <span class="panel__toggle-text">Enhancements: tabs</span>
      </label>
    </div>
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">Offense</div>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.highlightGroupedWeapons" />
        <span class="panel__toggle-text">Highlight grouped weapons</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.minorWeaponStats.MuzzleVelocity" />
        <span class="panel__toggle-text">Show muzzle velocity</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.minorWeaponStats.FiringTolerance" />
        <span class="panel__toggle-text">Show firing tolerance</span>
      </label>
      <label class="panel__toggle">
        <ToggleSwitch v-model="store.minorWeaponStats.Yaw" />
        <span class="panel__toggle-text">Show turret yaw (angle)</span>
      </label>
    </div>
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">Calculations</div>
      <label class="panel__select">
        <span class="panel__select-label">Health:</span>
        <Select v-model="store.calcUnitMode" :options="unitModeOptions" />
      </label>
      <label class="panel__select">
        <span class="panel__select-label">Damage:</span>
        <Select v-model="store.calcWeaponMode" :options="weaponModeOptions" />
      </label>
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
    gap: 8px

  &__group-title
    font-weight: 600
    font-size: 13px
    color: rgba(255,255,255,.7)
    margin-bottom: 2px

.panel__toggle
  width: fit-content
  user-select: none
  display: flex
  align-items: center
  gap: 8px
  cursor: pointer

.panel__select
  display: flex
  flex-direction: column
  gap: 2px
  cursor: pointer

  &-label
    font-size: 12px
    color: rgba(255,255,255,.7)
</style>
