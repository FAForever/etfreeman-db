<script setup>
import { ref, watch, nextTick } from 'vue'
import { useCompareStore } from '@/stores/compare'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps(['open'])
const emit = defineEmits(['close'])

const store = useCompareStore()
const popupRef = ref(null)
const selectedId = ref(null)
const formulaInput = ref(null)
const labelInput = ref(null)

const AVAILABLE_VARS = [
  "Air.CombatTurnSpeed",
  "Air.MaxAirspeed",
  "Air.MinAirspeed",
  "Air.StartTurnDistance",
  "Air.TurnSpeed",
  "Defense.Health",
  "Defense.RegenRate",
  "Defense.Shield.PersonalBubble",
  "Defense.Shield.PersonalShield",
  "Defense.Shield.ShieldMaxHealth",
  "Defense.Shield.ShieldRechargeTime",
  "Defense.Shield.ShieldRegenRate",
  "Defense.Shield.ShieldRegenStartTime",
  "Defense.Shield.ShieldSize",
  "Defense.Shield.ShieldSpillOverDamageMod",
  "Economy.BuildCostEnergy",
  "Economy.BuildCostMass",
  "Economy.BuildRate",
  "Economy.BuildTime",
  "Economy.MaintenanceConsumptionPerSecondEnergy",
  "Economy.ProductionPerSecondEnergy",
  "Economy.ProductionPerSecondMass",
  "Economy.StorageEnergy",
  "Economy.StorageMass",
  "ID",
  "Intel.MaxVisionRadius",
  "Intel.MinVisionRadius",
  "Intel.OmniRadius",
  "Intel.RadarRadius",
  "Intel.RadarStealthFieldRadius",
  "Intel.ReactivateTime",
  "Intel.SonarRadius",
  "Intel.SonarStealthFieldRadius",
  "Intel.VisionRadius",
  "Intel.WaterVisionRadius",
  "Physics.BackUpDistance",
  "Physics.Elevation",
  "Physics.FuelRechargeRate",
  "Physics.FuelUseTime",
  "Physics.LandSpeedMultiplier",
  "Physics.MaxSpeed",
  "Physics.SniperModeSpeedMultiplier",
  "Physics.SubSpeedMultiplier",
  "Physics.TurnRate",
  "Physics.WaterSpeedMultiplier",
  "Transport.Class1Capacity",
  "Transport.Class2AttachSize",
  "Transport.Class3AttachSize",
  "Transport.SlotsLarge",
  "Transport.SlotsMedium",
  "Transport.SlotsSmall",
  "VeteranMassMult",
  "Weapons['ALL'].DPS",
  "Weapons['ALL'].FullCycleDamage",
  "Weapons['ALL'].MaxDamageRadius",
  "Weapons['ALL'].MaxMaxRadius",
  "Weapons['ALL'].MinDamageRadius",
  "Weapons['ALL'].MinMaxRadius",
  "Wreckage.HealthMult",
  "Wreckage.MassMult",
]

const selectedStat = ref({ label: '', formula: '', fullLine: false })

watch(selectedId, (id) => {
  const stat = store.customStats.stats.find(s => s.id === id)
  if (stat) {
    selectedStat.value = { label: stat.label, formula: stat.formula, fullLine: stat.fullLine || false }
  } else {
    selectedStat.value = { label: '', formula: '', fullLine: false }
  }
})

const selectStat = (id) => {
  selectedId.value = id
}

const addStat = () => {
  store.addStat()
  const newStat = store.customStats.stats[store.customStats.stats.length - 1]
  selectedId.value = newStat.id
  nextTick(() => labelInput.value?.focus())
}

const removeStat = (id) => {
  store.removeStat(id)
  if (selectedId.value === id) {
    selectedId.value = store.customStats.stats[0]?.id || null
  }
}

const updateSelectedStat = (field, value) => {
  if (!selectedId.value) return
  selectedStat.value[field] = value
  store.updateStat(selectedId.value, { [field]: value })
}

const insertVariable = (varPath) => {
  if (!formulaInput.value) return
  const input = formulaInput.value
  const start = input.selectionStart || 0
  const end = input.selectionEnd || 0
  const text = selectedStat.value.formula || ''
  const toInsert = `unit.${varPath}`
  const newFormula = text.slice(0, start) + toInsert + text.slice(end)
  updateSelectedStat('formula', newFormula)
  nextTick(() => {
    input.focus()
    const newPos = start + toInsert.length
    input.setSelectionRange(newPos, newPos)
  })
}

useClickOutside(popupRef, () => {
  if (props.open) emit('close')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="custom-stats-popup-overlay">
      <div ref="popupRef" class="custom-stats-popup" @click.stop>
        <div class="csp__left">
          <div class="csp__section-title">Stats</div>
          <div class="csp__stats-list">
            <div v-for="stat in store.customStats.stats" :key="stat.id" class="csp__stat-item"
              :class="{ selected: selectedId === stat.id }" @click="selectStat(stat.id)">
              <span class="csp__stat-label">{{ stat.label || '(unnamed)' }}</span>
              <button class="csp__stat-delete" @click.stop="removeStat(stat.id)">×</button>
            </div>
          </div>
          <button class="csp__add-btn" @click="addStat">+ Add</button>
        </div>

        <div class="csp__center">
          <div class="csp__section-title">Edit</div>
          <div v-if="selectedId" class="csp__edit-form">
            <label class="csp__field">
              <span>Label</span>
              <input ref="labelInput" :value="selectedStat.label" @input="updateSelectedStat('label', $event.target.value)"
                placeholder="e.g., HP/Mass" />
            </label>
            <div v-if="selectedStat.formula?.match(/Weapons\['ALL'\]/)" class="csp__hint">
              You can use any weapon category instead of 'ALL', f.e. 'Direct'
            </div>
            <label class="csp__field csp__field_formula">
              <span>Formula (JS function)</span>
              <textarea ref="formulaInput" :value="selectedStat.formula"
                @input="updateSelectedStat('formula', $event.target.value)"
                placeholder="e.g., unit.Defense.Health / unit.Economy.BuildCostMass" />
            </label>
            <label class="csp__field csp__field_checkbox">
              <input type="checkbox" :checked="selectedStat.fullLine"
                @change="updateSelectedStat('fullLine', $event.target.checked)" />
              <span>Takes full line</span>
            </label>
          </div>
          <div v-else class="csp__no-selection">
            Select a stat to edit
          </div>
        </div>

        <div class="csp__right">
          <div class="csp__section-title">Variables</div>
          <div class="csp__vars-list">
            <button v-for="v in AVAILABLE_VARS" :key="v" class="csp__var-item" @click="insertVariable(v)">
              {{ v }}
            </button>
          </div>
        </div>

        <button class="csp__close" @click="emit('close')">×</button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="sass" scoped>
@use '@/sass/abstracts/specials.sass'
.custom-stats-popup-overlay
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.7)
  display: flex
  align-items: center
  justify-content: center
  z-index: 1000

.custom-stats-popup
  display: flex
  gap: 16px
  background: linear-gradient(rgba(40,40,40,.95), rgba(20,20,20,.98))
  border: 1px solid rgba(255, 255, 255, .3)
  border-radius: 8px
  padding: 20px
  min-width: 700px
  max-width: 900px
  max-height: 80vh
  position: relative

.csp
  &__section-title
    font-weight: 600
    font-size: 13px
    color: rgba(255,255,255,.7)
    margin-bottom: 10px
    text-transform: uppercase
    letter-spacing: 0.5px

  &__left
    width: 180px
    display: flex
    flex-direction: column
    flex-shrink: 0

  &__stats-list
    flex: 1
    overflow-y: auto
    margin-bottom: 10px

  &__stat-item
    display: flex
    align-items: center
    padding: 6px 8px
    border-radius: 4px
    cursor: pointer
    margin-bottom: 2px
    &:hover
      background: rgba(255,255,255,.1)
    &.selected
      background: rgba(100,150,255,.2)
    &:hover .csp__stat-delete
      opacity: 1

  &__stat-label
    flex: 1
    font-size: 13px
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  &__stat-delete
    opacity: 0.2
    background: none
    border: none
    color: #f66
    font-size: 18px
    cursor: pointer
    padding: 0 4px
    line-height: 1
    transition: opacity 0.15s
    &:hover
      color: #f00

  &__add-btn
    background: rgba(100,150,255,.3)
    border: 1px solid rgba(100,150,255,.5)
    color: white
    padding: 8px
    border-radius: 4px
    cursor: pointer
    font-size: 13px
    &:hover
      background: rgba(100,150,255,.5)

  &__center
    flex: 1
    min-width: 350px
    display: flex
    flex-direction: column

  &__edit-form
    display: flex
    flex-direction: column
    gap: 12px

  &__hint
    font-size: 12px
    color: rgba(255,200,100,.8)
    background: rgba(255,200,100,.1)
    padding: 6px 10px
    border-radius: 4px

  &__field
    display: flex
    flex-direction: column
    gap: 4px
    font-size: 13px
    color: rgba(255,255,255,.6)
    input, textarea
      background: #111
      border: 1px solid #333
      border-radius: 4px
      padding: 8px 10px
      color: white
      font-size: 14px
      font-family: inherit
      &:focus
        border-color: rgba(100,150,255,.7)
        outline: none
    &_formula
      flex: 1
      textarea
        height: 100%
        min-height: 80px
        resize: none
    &_checkbox
      flex-direction: row
      align-items: center
      gap: 8px
      input
        width: 16px
        height: 16px
        cursor: pointer

  &__no-selection
    color: rgba(255,255,255,.4)
    font-style: italic
    padding: 20px

  &__right
    width: max-content
    flex-shrink: 0

  &__vars-list
    display: flex
    flex-direction: column
    gap: 2px
    max-height: 400px
    overflow-y: auto
    --scrollbarbg: #111
    @include specials.thinScrollbar

  &__var-item
    background: rgba(255,255,255,.05)
    border: none
    color: rgba(255,255,255,.8)
    padding: 5px 8px
    text-align: left
    font-size: 11px
    font-family: monospace
    cursor: pointer
    border-radius: 3px
    overflow-wrap: anywhere
    &:hover
      background: rgba(100,150,255,.3)

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
