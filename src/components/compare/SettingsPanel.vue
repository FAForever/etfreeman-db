<script setup>
import { ref, computed, toRef } from 'vue'
import { useCompareStore } from '../../stores/compare'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import CalculationSelect from './CalculationSelect.vue'
import CustomStatsPopup from './CustomStatsPopup.vue'

const store = useCompareStore()
const customStatsPopupOpen = ref(false)

const flipFraction = (label) => {
  const [numerator, denominator] = label.split('/')
  const displayDenom = denominator === 'BuildTime' ? 'BT' : denominator
  return `${displayDenom} / ${numerator}`
}

const unitModeBase = [
  { value: 'hp/mass', label: 'HP / mass' },
  { value: 'hp/energy', label: 'HP / energy' },
  { value: 'hp/BT', label: 'HP / BuildTime' }
]

const weaponModeBase = [
  { value: 'DPS/mass', label: 'DPS / mass' },
  { value: 'DPM/mass', label: 'DPM / mass' },
  { value: 'DPS/energy', label: 'DPS / energy' },
  { value: 'DPM/energy', label: 'DPM / energy' },
  { value: 'DPS/BT', label: 'DPS / BuildTime' },
  { value: 'DPM/BT', label: 'DPM / BuildTime' }
]

const unitModeOptions = computed(() =>
  unitModeBase.map(opt => ({
    value: opt.value,
    label: store.efficiencySettings.unitInvert ? flipFraction(opt.label) : opt.label
  }))
)

const weaponModeOptions = computed(() =>
  weaponModeBase.map(opt => ({
    value: opt.value,
    label: store.efficiencySettings.weaponInvert ? flipFraction(opt.label) : opt.label
  }))
)

const toggleGroups = [
  {
    title: 'General',
    toggles: [
      { model: toRef(store.toggles, 'showUnitId'), label: 'Show unit ID' },
      { model: toRef(store.toggles, 'linedUpSections'), label: 'Line up sections' },
      { model: toRef(store.toggles, 'compactSections'), label: 'Compact sections' },
      { model: toRef(store.toggles, 'enhancementsTabs'), label: 'Enhancements: tabs' }
    ]
  },
  {
    title: 'Offense',
    toggles: [
      { model: toRef(store.toggles, 'highlightGroupedWeapons'), label: 'Highlight grouped weapons' },
      { model: toRef(store.toggles.minorWeaponStats, 'MuzzleVelocity'), label: 'Show muzzle velocity' },
      { model: toRef(store.toggles.minorWeaponStats, 'FiringTolerance'), label: 'Show firing tolerance' },
      { model: toRef(store.toggles.minorWeaponStats, 'Yaw'), label: 'Show turret yaw (angle)' }
    ]
  }
]

</script>

<template>
  <div class="settings-panel">
    <div class="settings-panel__group" v-for="{ title, toggles } in toggleGroups" :key="title">
      <div class="settings-panel__group-title">{{ title }}</div>
      <div class="settings-panel__group-body">
        <label v-for="toggle in toggles" :key="toggle.label" class="panel__toggle">
          <ToggleSwitch v-model="toggle.model.value" />
          <span class="panel__toggle-text">{{ toggle.label }}</span>
        </label>
      </div>
    </div>
    <div class="settings-panel__group">
      <div class="settings-panel__group-title">Calculations</div>
      <div class="settings-panel__group-body">
        <CalculationSelect
          label="Health:"
          v-model="store.efficiencySettings.unitMode"
          v-model:inverted="store.efficiencySettings.unitInvert"
          :options="unitModeOptions"
        />
        <CalculationSelect
          label="Damage:"
          v-model="store.efficiencySettings.weaponMode"
          v-model:inverted="store.efficiencySettings.weaponInvert"
          :options="weaponModeOptions"
        />
      </div>
    </div>
    <div class="settings-panel__group settings-panel__group_customstats">
      <div class="settings-panel__group-title">Custom Stats</div>
      <div class="settings-panel__group-body">
        <button class="panel__button" @click.stop="customStatsPopupOpen = true">Manage stats</button>
      </div>
    </div>
  </div>
  <CustomStatsPopup :open="customStatsPopupOpen" @close="customStatsPopupOpen = false" />
</template>

<style lang="sass">
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

    &_customstats
      @include from(910px)
        display: none

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

.panel__button
  display: inline-flex
  align-items: center
  justify-content: center
  border-radius: 5px
  padding: 2px 10px
  background: #111
  color: white
  border: 1px solid #333
  cursor: pointer
  font-size: 14px
  font-family: inherit
  transition: all 0.2s
  height: 22px
  &:hover
    border-color: white
</style>
