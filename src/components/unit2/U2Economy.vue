<script setup>
import { computed } from 'vue'
import { formatNum } from '../../composables/helpers/common'
import Icon from '../Icon.vue'
import LineItem from './LineItem.vue'
import U2Projectile from './U2Projectile.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const economy = unit.Economy || {}

const economyConfig = [
  { key: 'BuildRate', label: 'Build rate' },
  { key: 'ProductionPerSecondMass', label: 'Mass yield' },
  { key: 'ProductionPerSecondEnergy', label: 'Energy yield' },
  { key: 'MaintenanceConsumptionPerSecondEnergy', label: 'Energy drain' },
  { key: 'StorageMass', label: 'Mass storage' },
  { key: 'StorageEnergy', label: 'Energy storage' },
]

const economyItems = economyConfig
  .filter(item => economy[item.key])
  .map(item => ({ text: item.label, value: economy[item.key] }))

const projectiles = computed(() => {
  if (!unit.Weapon) return []
  return unit.Weapon
    .filter(w => w.Projectile?.BuildCostMass > 0 || w.Projectile?.BuildCostEnergy > 0 || w.Projectile?.BuildTime > 0)
    .map(w => w.Projectile)
})

const isCompact = computed(() => economyItems.length <= 3 && !projectiles.value.length)
const isShown = computed(() => economyItems.length > 0 || projectiles.value.length > 0)
const expandScore = computed(() => economyItems.length / 3 + 5 * projectiles.value.length)

defineExpose({ isCompact, isShown, expandScore })
</script>

<template>
  <div class="u2economy uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact, 'u2economy_withweapons': projectiles.length }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <Icon class="u2economy__header-icon" name="growth" width="18" />
        <span>Economy</span>
      </h2>
      <div class="uc__section-line">
        <LineItem v-for="item in economyItems" :key="item.text" :text="item.text + ':'" :value="formatNum(item.value)" />
      </div>
      <U2Projectile v-for="(proj, i) in projectiles" :key="i" :projectile="proj" />
    </div>
  </div>
</template>

<style lang="sass">
.u2economy
  .uc__section-query
    display: flex
    flex-direction: column
    height: 100%
  .uc__section-line
    margin-bottom: auto
  @container (max-width: 300px)
    .uc__section-line
      --columncount: 6
  &__header-icon
    color: #eee
  &_withweapons
    padding-bottom: 0 !important
.uc:has(.u2economy_withweapons.last)
  padding-bottom: 0 !important
</style>
