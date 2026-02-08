<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { round } from '../../composables/helpers/common';
import Icon from '../Icon.vue';
import LineItem from './LineItem.vue';
import WeaponGroup from './WeaponGroup.vue';
import { getShotsAmount, simulateFiringCycle } from '../../stores/utils/unitDecorator/dps2';

const { unit, weapons } = defineProps(['unit', 'weapons'])

const categoriesMap = {
  'Direct Fire': 'Direct',
  'Direct Fire Naval': 'Direct',
  'Direct Fire Experimental': 'Direct',
  'Anti Air': 'Anti-Air'
}

const getWeaponCategory = (weapon) => {
  if (weapon.DamageType == "Overcharge") {
    let str = weapon.DisplayName
    if (weapon.Label == "AutoOverCharge" && !weapon.DisplayName.match('Auto'))
      str = str.replace('Overcharge', 'AutoOvercharge')
    return str.replace('Overcharge', 'OC')
  }
  if (weapon.WeaponCategory == 'Missile' && weapon.NukeInnerRingRadius) return 'Nuke'
  if (weapon.DisplayName == 'Sih Energy Rifle Sniper Mode') return 'Sniper mode'
  if (weapon.__unitID == 'XRL0302' && weapon.IgnoreIfDisabled) return 'Kamikaze'
  return categoriesMap[weapon.WeaponCategory] || weapon.WeaponCategory
}

const weaponGroups = computed(() => {
  const groups = weapons?.reduce((acc, weapon) => {
    if (!weapon.dps && !weapon.fullDamage && weapon.DamageType != "EMP") return acc
    const isWeirdBeetleWeapon = (weapon.WeaponCategory == "Kamikaze" && weapon.fullDamage == 1)
    if (isWeirdBeetleWeapon) return acc
    const category = getWeaponCategory(weapon)
    if (!acc[category]) acc[category] = []
    acc[category].push(weapon)
    /*
    if (!acc[category].rangeData[weapon.MaxRadius]) acc[category].rangeData[weapon.MaxRadius] = { dps: 0, alpha: 0, dotAlpha: 0, aoe: new Set(), dot: new Set() }
    acc[category].rangeData[weapon.MaxRadius].dps += weapon.dps
    if (weapon.DamageRadius) acc[category].rangeData[weapon.MaxRadius].aoe.add(weapon.DamageRadius)
    let multiplier = weapon.ProjectileFragmentMultiplier || 1
    if (category == 'Bomb') {
      multiplier *= weapon.MuzzleSalvoSize || 1
    }
    if (weapon.DoTTime) {
      acc[category].rangeData[weapon.MaxRadius].dot.add(round(weapon.DoTTime + 0.1, 2))
      acc[category].rangeData[weapon.MaxRadius].dotAlpha += multiplier * (weapon.DoTPulses - 1) * (weapon.Damage || 0)
    }
    multiplier *= getShotsAmount(weapon) || 1
    acc[category].rangeData[weapon.MaxRadius].alpha += multiplier * ((weapon.Damage || 0) + (weapon.InitialDamage || 0))
    */
    return acc
  }, {}) || []
  const sortedGroups = Object.entries(groups).sort((a, b) => b[1].reduce((acc, w) => acc + w.dps, 0) - a[1].reduce((acc, w) => acc + w.dps, 0))
  return Object.fromEntries(sortedGroups.map(([cat, ws]) => [cat, ws.sort((a, b) => b.dps - a.dps)]))
})

const COLUMN_ORDER = [
  'type', 'DPS', 'dps/mass', 'DPS to shields', 'DPS to shields / mass', 'range', 'AoE', 'DoT',
  'muzzleVel', 'firingTol', 'randomness', 'randomnessMove',
  'cycle', 'cycle to shields'
]

const weaponColumns = computed(() => {
  const present = new Set()
  for (let weapon of weapons) {
    present.add('type')
    if (weapon.DamageRadius || weapon.NukeInnerRingRadius) {
      present.add('AoE')
    }
    if (weapon.DoTTime) {
      present.add('DoT')
    }
    if (weapon.dpsShields !== undefined) {
      present.add('DPS to shields')
      present.add('DPS to shields / mass')
      present.add('cycle to shields')
    }
    if (weapon.MuzzleVelocity !== undefined || weapon.BeamLifetime !== undefined) {
      present.add('muzzleVel')
    }
    if (weapon.FiringRandomness) {
      present.add('randomness')
    }
    if (weapon.FiringRandomnessWhileMoving) {
      present.add('randomnessMove')
    }
    present.add('cycle')
  }
  if (weapons.some(w => w.dps != null)) {
    present.add('DPS')
    present.add('dps/mass')
  }
  if (weapons.some(w => w.MaxRadius != null)) {
    present.add('range')
  }
  if (weapons.some(w => w.FiringTolerance != null)) {
    present.add('firingTol')
  }
  return COLUMN_ORDER.filter(col => present.has(col))
})

const isCompact = computed(() => weaponColumns.value.length <= 3)

const headReplacements = {
  'dps/mass': `<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>DPS</mi><mi>mass</mi> </mfrac></math>`,
  'DPS to shields': `<span data-tooltip="dps to shields">DPStS</span>`,
  'DPS to shields / mass': `<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>DPStS</mi><mi>mass</mi></mfrac></math>`,
  'cycle to shields': `cycle<br>to shields`,
  'muzzleVel': `<span data-tooltip="muzzle velocity">MV</span>`,
  'randomness': `<span data-tooltip="fire randomness">RNG</span>`,
  'randomnessMove': `fire<br>random.<br>while<br>moving`,
  'firingTol': `<span data-tooltip="firing tolerance">FT</span>`
}

const tableWrapRef = ref(null)
const tableRef = ref(null)
const currentShrinkLevel = ref(0)
const weaponsShrinkLevel = ref(null)
const noWeaponsShrinkLevel = ref(null)
const opacity = ref('0')
const weaponGroupRefs = ref([])

const anyGroupExpanded = computed(() => weaponGroupRefs.value.some(ref => ref?.isExpanded))

watch(anyGroupExpanded, (isExpanded) => {
  if (weaponsShrinkLevel.value === null || noWeaponsShrinkLevel.value === null) return
  currentShrinkLevel.value = isExpanded ? weaponsShrinkLevel.value : noWeaponsShrinkLevel.value
})

const findShrinkLevel = async (initial) => {
  const wrap = tableWrapRef.value
  const table = tableRef.value
  if (!wrap || !table) return

  for (let level = initial || 0; level <= 11; level++) {
    currentShrinkLevel.value = level
    await new Promise(r => requestAnimationFrame(r))
    if (table.offsetWidth <= wrap.offsetWidth + 2) {
      return level
    }
  }
  return 11
}

const optimizeFontSize = async () => {
  weaponsShrinkLevel.value = await findShrinkLevel()  
  const refs = weaponGroupRefs.value.filter(r => r)
  for (const groupRef of refs) {
    groupRef.toggleExpanded()
  }
  await nextTick()
  noWeaponsShrinkLevel.value = await findShrinkLevel(weaponsShrinkLevel.value - 3)
  opacity.value = '1'
}

onMounted(optimizeFontSize)

</script>

<template>
  <div class="u2offense uc__section" v-if="Object.keys(weaponGroups).length"
    :class="{ 'uc__section_compact': isCompact }">
    <h2 class="uc__section-title u2offense__header">
      <Icon class="u2offense__header-icon" :class="`u2offense__header-icon_${unit.faction}`" name="sword" width="18" />
      <span class="u2offense__header-text">Offense</span>
    </h2>
    <div class="u2offense__table-wrap" ref="tableWrapRef">
      <table class="u2offense__table" ref="tableRef" :data-shrink="currentShrinkLevel" :style="{ '--opacity': opacity }">
        <thead>
          <tr>
            <th v-for="col in weaponColumns" :key="col" v-html="headReplacements[col] || col" />
          </tr>
        </thead>
        <tbody>
          <WeaponGroup v-for="(weapons, category, index) in weaponGroups" :key="category" :ref="(el) => { if (el) weaponGroupRefs[index] = el }" :columns="weaponColumns"
            :category="category" :weapons="weapons" :mass="unit.Economy.BuildCostMass" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="sass">

.u2offense
  flex-grow: 1
  width: 100%
  .uc__section-title svg
    --color0: transparent
    margin-bottom: -2px
  &__table
    font-size: 15px
    opacity: var(--opacity, 0)
    border-collapse: collaps
    text-align: center
    &[data-shrink="1"]
      --cellpadding: 7px
    @for $level from 2 through 11
      &[data-shrink="#{$level}"]
        @if $level <= 4
          --cellpadding: #{8 - $level}px
        @if $level >= 5
          font-size: 14px
          --cellpadding: 4px
        @if $level >= 6
          font-size: 13px
        @if $level >= 7
          --cellpadding: 3px
        @if $level >= 8
          --cellpadding: 2.5px
        @if $level >= 9
          font-size: 12px
        @if $level >= 10
          --cellpadding: 2px
        @if $level >= 11
          font-size: 11.5px
        .shrinkable-param
          width: min-content
    &-wrap
      width: calc(100% + 6px)
      margin: 0 -3px
      &:has(.u2offense__table[data-shrink="9"],.u2offense__table[data-shrink="10"], .u2offense__table[data-shrink="11"])
        width: calc(100% + 16px)
        margin: 0 -8px
    tr.active td
      background: rgba(0,0,0,.3)
    td, th
      padding: 2px var(--cellpadding, 8px)
      transition: background 0.2s ease-out
    tbody tr td
      padding-top: 4px
    td:not(:last-child), th:not(:last-child)
      border-right: 1px solid rgba(255,255,255,.1)
    tr:not(:last-child), thead tr
      td, th
        border-bottom: 1px solid rgba(255,255,255,.1)
</style>