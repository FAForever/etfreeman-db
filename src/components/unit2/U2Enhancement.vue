<script setup>
import { computed } from 'vue'
import { shorten } from '../../composables/helpers/common.js'
import { useMods } from '../../composables/useMods.js'
import CostsList from '../ui/CostsList.vue'
import LineItem from './LineItem.vue'
import Icon from '../Icon.vue'

const props = defineProps(['enhancement', 'nextIsChained', 'type'])
const { mods } = useMods(props, 'u2enhancement', { type: null })

const stats = computed(() => {
  const e = props.enhancement
  const s = []
  if (e.NewMaxRadius) s.push({ label: 'new max radius', value: e.NewMaxRadius })
  if (e.NewRateOfFire) s.push({ label: 'new rate of fire', value: e.NewRateOfFire })
  if (e.MaintenanceConsumptionPerSecondEnergy) s.push({
    label: 'new energy drain',
    value: shorten(e.MaintenanceConsumptionPerSecondEnergy)
  })
  if (e.ProductionPerSecondMass) s.push({ label: 'new mass yield', value: shorten(e.ProductionPerSecondMass) })
  if (e.ProductionPerSecondEnergy) s.push({ label: 'new energy yield', value: shorten(e.ProductionPerSecondEnergy) })
  if (e.NewHealth) s.push({ label: 'new health', value: shorten(e.NewHealth) })
  if (e.NewRegenRate) s.push({ label: 'new regen rate', value: `+${e.NewRegenRate}/s` })
  if (e.NewOmniRadius) s.push({ label: 'new omni radius', value: e.NewOmniRadius })
  if (e.AdditionalDamage) s.push({ label: 'additional damage', value: e.AdditionalDamage })
  if (e.NewDamageRadius) s.push({ label: 'new damage radius', value: e.NewDamageRadius })
  if (e.NewBuildRate) s.push({ label: 'new build rate', value: e.NewBuildRate })
  if (e.ShieldMaxHealth) s.push({ label: 'health', value: shorten(e.ShieldMaxHealth) })
  if (e.ShieldRegenRate) s.push({ label: 'regen', value: e.ShieldRegenRate })
  if (e.ShieldSize) s.push({ label: 'size', value: e.ShieldSize })
  if (e.ShieldRechargeTime && e.ShieldRegenStartTime) s.push({
    label: 'recharge time',
    value: e.ShieldRechargeTime + e.ShieldRegenStartTime
  })
  return s
})

const hasStats = computed(() => stats.value.length > 0)
</script>

<template>
  <div class="u2enhancement" :class="[mods, { 'u2enhancement_chained': nextIsChained, 'u2enhancement_has-stats': hasStats }]">
    <div class="u2enhancement__heading">
      <span class="u2enhancement__title">{{ enhancement.Name }}</span>
      <CostsList :item="enhancement" :size="14" />
    </div>
    <div class="u2enhancement__body" v-if="hasStats">
      <div class="uc__section-line">
        <LineItem v-for="stat in stats" :key="stat.label" :text="stat.label + ':'" :value="stat.value" />
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.u2enhancement
  position: relative
  &__heading
    display: flex
    align-items: flex-start
    justify-content: space-between
    gap: 4px 8px
    background: var(--titlebg)
    border-top: 1px solid var(--factioncolor)
    padding: 5px var(--sectionpadding)
  &_chained + & &__heading
    border-top-color: var(--factioncolortrans)
  &:not(&_chained) + & &__heading
    border-top-color: var(--factioncolorsol)
  &__title
    font-family: var(--titlefont)
    font-weight: 500
    font-size: 14px
    align-self: center
  &_type-calm &__title
    font-weight: 400
  &__body
    padding: 5px var(--sectionpadding)
</style>
