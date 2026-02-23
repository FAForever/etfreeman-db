<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useCompareStore } from '@/stores/compare'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency';
import WeaponGroup from '../helpers/WeaponGroup.vue';

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const weapons = unit.Weapon
const compareStore = useCompareStore()
const { getFractionHTML } = useCalcEfficiency('weapon')

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
  if (weapon.WeaponCategory == 'Defense') {
    if (weapon.TargetRestrictOnlyAllow.toLowerCase().match('missile')) return 'Anti-Missile'
    if (weapon.TargetRestrictOnlyAllow.toLowerCase().match('torpedo')) return 'Anti-Torpedo'
  }
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
    return acc
  }, {}) || []
  const sortedGroups = Object.entries(groups).sort((a, b) => b[1].reduce((acc, w) => acc + w.dps, 0) - a[1].reduce((acc, w) => acc + w.dps, 0))
  return Object.fromEntries(sortedGroups.map(([cat, ws]) => [cat, ws.sort((a, b) => b.dps - a.dps)]))
})

const COLUMN_ORDER = [
  'type', 'DPS', 'dps/mass', 'HP', 'DPS to shields', 'DPS to shields / mass', 'range', 'AoE', 'DoT',
  'muzzleVel', 'firingTol', 'yaw', 'randomness', 'randomnessMove',
  'cycle', 'cycle to shields'
]

const visibleWeapons = computed(() => Object.values(weaponGroups.value).flat())

const weaponColumns = computed(() => {
  const present = new Set()
  for (let weapon of visibleWeapons.value) {
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
    if (compareStore.toggles.minorWeaponStats.MuzzleVelocity && (weapon.MuzzleVelocity != null || weapon.BeamLifetime !== undefined)) {
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
  if (visibleWeapons.value.some(w => w.dps != null)) {
    present.add('DPS')
    present.add('dps/mass')
  }
  if (visibleWeapons.value.some(w => w.MaxRadius != null)) {
    present.add('range')
  }
  if (compareStore.toggles.minorWeaponStats.FiringTolerance && visibleWeapons.value.some(w => w.FiringTolerance != null)) {
    present.add('firingTol')
  }
  if (compareStore.toggles.minorWeaponStats.Yaw && visibleWeapons.value.some(w => w.TurretYawRange != null)) {
    present.add('yaw')
  }
  if (visibleWeapons.value.some(w => w.Projectile?.Health > 0 && !['Defense','Anti-Navy'].includes(w.WeaponCategory))) {
    present.add('HP')
  }
  return COLUMN_ORDER.filter(col => present.has(col))
})

const isCompact = computed(() => weaponColumns.value.length <= 3)
const isShown = computed(() => compareStore.showedSections['Offense'] && Object.keys(weaponGroups.value).length > 0)
const expandScore = computed(() => weaponColumns.value.length / 3 * 1.9)

defineExpose({ name: 'Offense', isCompact, isShown, expandScore })

const headReplacements = computed(() => ({
  'dps/mass': getFractionHTML(),
  'DPS to shields': `<span data-tooltip-params="top-center" data-tooltip="dps to shields">DPStS</span>`,
  'DPS to shields / mass': getFractionHTML(true),
  'cycle to shields': `cycle<br>to shields`,
  'muzzleVel': `<span data-tooltip-params="top-center" data-tooltip="muzzle velocity">MV</span>`,
  'randomness': `<span data-tooltip-params="top-center" data-tooltip="fire randomness">RNG</span>`,
  'randomnessMove': `fire<br>random.<br>while<br>moving`,
  'firingTol': `<span data-tooltip-params="top-center" data-tooltip="firing tolerance">FT</span>`,
  'yaw': 'angle'
}))

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
  await document.fonts.ready
  opacity.value = '0'
  const notExpanded = weaponGroupRefs.value.filter(r => !r.isExpanded)
  for (const groupRef of notExpanded) {
    groupRef.toggleExpanded()
  }
  if (notExpanded.length) {
    await nextTick()
  }
  weaponsShrinkLevel.value = await findShrinkLevel()
  const refs = weaponGroupRefs.value
  for (const groupRef of refs) {
    groupRef.toggleExpanded()
  }
  await nextTick()
  noWeaponsShrinkLevel.value = await findShrinkLevel(weaponsShrinkLevel.value - 3)
  opacity.value = '1'
}

onMounted(optimizeFontSize)
watch(weaponColumns, optimizeFontSize)

</script>

<template>
  <div class="uoffense uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <h2 class="uc__section-title uoffense__header">Offense</h2>
    <div class="uoffense__table-wrap" ref="tableWrapRef">
      <table class="uoffense__table" ref="tableRef" :data-shrink="currentShrinkLevel" :style="{ '--opacity': opacity }">
        <thead>
          <tr>
            <th v-for="col in weaponColumns" :key="col" v-html="headReplacements[col] || col" />
          </tr>
        </thead>
        <tbody>
          <WeaponGroup v-for="(weapons, category, index) in weaponGroups" :key="category" :ref="(el) => { if (el) weaponGroupRefs[index] = el }" :columns="weaponColumns"
            :category="category" :weapons="weapons" :economy="unit.Economy" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="sass">

.uoffense
  --tooltipfontsize: 14.5px
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
          --customspacing: -0.01em
        @if $level >= 10
          --cellpadding: 2px
          --customspacing: -0.015em
        @if $level >= 11
          font-size: 11.5px
          --customspacing: -0.02em
        .shrinkable-param
          width: min-content
    &-wrap
      width: calc(100% + 16px)
      margin: 0 -8px
    td:not(:first-child,:last-child)
      letter-spacing: var(--customspacing)
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