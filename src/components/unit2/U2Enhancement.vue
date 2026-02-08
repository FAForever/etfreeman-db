<script setup>
import { computed } from 'vue'
import { shorten } from '../../composables/helpers/common.js'
import MassIcon from '../ui/MassIcon.vue'
import EnergyIcon from '../ui/EnergyIcon.vue'
import BuildtimeIcon from '../ui/BuildtimeIcon.vue'
import LineItem from './LineItem.vue'
import Icon from '../Icon.vue'

const props = defineProps(['enhancement', 'nextIsChained'])

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
  <div class="u2enhancement" :class="{ 'u2enhancement_chained': nextIsChained, 'u2enhancement_has-stats': hasStats }">
    <div class="u2enhancement__heading">
      <span class="u2enhancement__title">{{ enhancement.Name }}</span>
      <div class="u2enhancement__costs">
        <div class="u2enhancement__cost">
          <MassIcon />
          <span class="u2enhancement__cost-value">{{ shorten(enhancement.BuildCostMass) }}</span>
        </div>
        <div class="u2enhancement__cost">
          <EnergyIcon />
          <span class="u2enhancement__cost-value">{{ shorten(enhancement.BuildCostEnergy) }}</span>
        </div>
        <div class="u2enhancement__cost">
          <BuildtimeIcon />
          <span class="u2enhancement__cost-value">{{ shorten(enhancement.BuildTime) }}</span>
        </div>
      </div>
    </div>
    <div class="u2enhancement__body" v-if="hasStats">
      <div class="uc__section-line">
        <LineItem v-for="stat in stats" :key="stat.label" :text="stat.label + ':'" :value="stat.value" />
      </div>
    </div>
    <div class="u2enhancement__arrow" v-if="nextIsChained">
      <Icon name="arrow_down" class="u2enhancement__arrow-icon" />
    </div>
  </div>
</template>

<style lang="sass">
.u2enhancement
  position: relative
  &__arrow
    position: absolute
    color: white
    top: 100%
    left: 50%
    transform: translate(-50%, -50%)
    display: flex
    align-items: center
    justify-content: center
    padding: 3px
    z-index: 1
    display: none
    //background: var(--factioncolorsoliddark)
    border-radius: 5px
    &-icon
      stroke-linecap: round
      width: 12px
      stroke: white
      stroke-width: 2
  &__heading
    padding: 5px 10px 5px
    display: flex
    justify-content: space-between
    align-items: flex-start
    gap: 10px
    border-top: 1px solid var(--factioncolor)
    background: var(--titlebg)
  &__title
    font-family: var(--titlefont)
    font-weight: 600
    font-size: 14px
  &__costs
    display: flex
    gap: 10px
  &__cost
    display: flex
    align-items: center
    gap: 3px
  &__cost-value
    font-weight: 600
    font-size: 14px
  &__body
    padding: 5px 10px
</style>
