<script setup>
import { computed } from 'vue'
import { round, formatNum } from '../../composables/helpers/common'
import LineItem from './LineItem.vue'
import { useUnitData } from '../../composables/useUnitData'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { unitDefauls } = useUnitData()

const isACU = computed(() => unit.Categories?.includes('COMMAND'))
const isSACU = computed(() => unit.Categories?.includes('SUBCOMMANDER'))

const vetMultiplier = computed(() => {
  if (isACU.value) return unit?.VeteranMassMult || unitDefauls.value.techToVetMultipliers?.COMMAND || 2
  if (isSACU.value) return unit?.VeteranMassMult || unitDefauls.value.techToVetMultipliers?.SUBCOMMANDER || 2
  if (unit.tech === 'EXP') return unit?.VeteranMassMult || unitDefauls.value.techToVetMultipliers?.EXPERIMENTAL || 2

  const techKey = 'TECH' + unit.tech?.charAt(1)
  return unit?.VeteranMassMult || unitDefauls.value.techToVetMultipliers?.[techKey] || 2
})

const regenBuffIndex = computed(() => {
  if (isSACU.value) return 3
  if (isACU.value) return 2
  if (unit.tech === 'EXP') return 4
  if (unit.tech === 'T3') return 2
  if (unit.tech === 'T2') return 1
  return 0
})

const regenPerLevel = computed(() => {
  const buffs = unitDefauls.value.veterancyRegenBuffs?.[regenBuffIndex.value]
  return buffs?.[0] || 0
})

const hpPerLevel = computed(() => round(unit.Defense.Health * 0.1))
const standardMassPerLevel = computed(() => {
  if (unit.VeteranMass) return null
  return vetMultiplier.value * (unit.Economy?.BuildCostMass || 1)
})

const showMassLine = computed(() => {
  return !unit.VeteranMass && standardMassPerLevel.value > 0
})

const isCompact = computed(() => !unit.VeteranMass)
const expandScore = computed(() => unit.VeteranMass ? 5 : 1)

const canGetVeterancy = computed(() =>
  unit.Weapon?.some(w =>
    !w.FireOnDeath && !['Teleport', 'Kamikaze', 'Death'].includes(w.WeaponCategory) && !(w.Label == "DeathWeapon") && (w.Damage || w.NukeInnerRingDamage)
  )
)
const isShown = computed(() => canGetVeterancy.value && !!unit.Defense)

defineExpose({ isCompact, isShown, expandScore })

const romanNumerals = ['I', 'II', 'III', 'IV', 'V']
</script>

<template>
  <div class="u2veterancy uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <h2 class="uc__section-title u2veterancy__header">Veterancy</h2>
    <template v-if="!unit.VeteranMass">
      <div class="uc__section-line">
        <LineItem text="HP / lvl:" :value="formatNum(hpPerLevel)" />
        <LineItem text="Regen / lvl:" :value="'+' +regenPerLevel + '/s'" v-if="regenPerLevel" />
        <LineItem text="Mass to kill / lvl:" :value="formatNum(standardMassPerLevel)" v-if="showMassLine" />
      </div>
    </template>

    <template v-else>
      <div class="uc__section-line">
        <LineItem text="HP / lvl:" :value="formatNum(hpPerLevel)" />
        <LineItem text="Regen / lvl:" :value="'+' + regenPerLevel + '/s'" v-if="regenPerLevel" />
      </div>
      <div class="u2veterancy__table-wrap">
        <table class="u2veterancy__table">
          <thead>
            <tr>
              <th></th>
              <th v-for="n in 5" :key="n">{{ romanNumerals[n - 1] }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mass to<br> kill / lvl</td>
              <td v-for="(mass, i) in unit.VeteranMass" :key="i">{{ formatNum(mass) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style lang="sass">
.u2veterancy
  &__header-icon
    fill: transparent
    margin-right: 1px
    margin-left: 1px
  &__table
    font-size: 15px
    border-collapse: collapse
    text-align: center
    &-wrap
      width: calc(100% + 6px)
      margin: 5px -3px 0
    td, th
      padding: 4px 8px
      border: 1px solid rgba(255,255,255,.1)
      @container (max-width: 338px)
        padding: 4px 6px
      &:first-child
        border-left: none
      &:last-child
        border-right: none
    th
      border-top: none
      font-weight: 700
    td
      border-bottom: none 
</style>
