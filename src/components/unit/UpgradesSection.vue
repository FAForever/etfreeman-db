<template>
  <tbody v-if="filteredEnhancements.length">
    <template v-for="(u, uIdx) in filteredEnhancements" :key="uIdx">
      <tr class="unit-details__sec unit-details__sec_spaced">
        <td>{{ !uIdx? 'Upgrades': '' }}</td>
        <td colspan="3" class="unit-details__minititle unit-details__minititle_spaced">{{ u.Name }}</td>
      </tr>
      <tr :class="{ 'unit-details__sec-end': upgradeStats(u).length == 0 }">
        <td class="sm">{{ u.Slot }}</td>
        <td :title="u.BuildCostMass">
          <span title="mass" class="unit-details__ic icon_ui icon-mass"></span>{{ shorten(u.BuildCostMass) }}
        </td>
        <td :title="u.BuildCostEnergy">
          <span title="energy" class="unit-details__ic icon_ui icon-energy"></span>{{ shorten(u.BuildCostEnergy) }}
        </td>
        <td :title="u.BuildTime">
          <span title="time" class="unit-details__ic icon_ui icon-time"></span>{{ shorten(u.BuildTime) }}
        </td>
      </tr>
      <tr v-for="stat, usIdx in upgradeStats(u)" :key="stat.label"
        :class="{ 'unit-details__sec-end': usIdx === upgradeStats(u).length - 1 }">
        <td></td>
        <td colspan="2"><span class="sm">{{ stat.label }}</span></td>
        <td><span class="sm">{{ stat.value }}</span></td>
      </tr>
    </template>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { shorten } from '../../composables/helpers/common.js'

const props = defineProps(['enhancements'])

const filteredEnhancements = computed(() => {
  if (!props.enhancements) return []
  const enhancementsArray = Array.isArray(props.enhancements)
    ? props.enhancements
    : Object.values(props.enhancements)
  return enhancementsArray
    .filter(e => !e.RemoveEnhancements && e.Name)
    .sort((a, b) => (a.Slot || '').localeCompare(b.Slot || ''))
})

const upgradeStats = (u) => {
  const stats = []
  if (u.NewMaxRadius) stats.push({ label: 'new max radius', value: u.NewMaxRadius })
  if (u.NewRateOfFire) stats.push({ label: 'new rate of fire', value: u.NewRateOfFire })
  if (u.MaintenanceConsumptionPerSecondEnergy) stats.push({
    label: 'new energy drain',
    value: shorten(u.MaintenanceConsumptionPerSecondEnergy)
  })
  if (u.ProductionPerSecondMass) stats.push({ label: 'new mass yield', value: shorten(u.ProductionPerSecondMass) })
  if (u.ProductionPerSecondEnergy) stats.push({ label: 'new energy yield', value: shorten(u.ProductionPerSecondEnergy) })
  if (u.NewHealth) stats.push({ label: 'new health', value: shorten(u.NewHealth) })
  if (u.NewRegenRate) stats.push({ label: 'new regen rate', value: `${u.NewRegenRate}hp/s` })
  if (u.NewOmniRadius) stats.push({ label: 'new omni radius', value: u.NewOmniRadius })
  if (u.AdditionalDamage) stats.push({ label: 'additional damage', value: u.AdditionalDamage })
  if (u.NewDamageRadius) stats.push({ label: 'new damage radius', value: u.NewDamageRadius })
  if (u.NewBuildRate) stats.push({ label: 'new build rate', value: u.NewBuildRate })
  if (u.ShieldMaxHealth) stats.push({ label: 'health', value: shorten(u.ShieldMaxHealth) })
  if (u.ShieldRegenRate) stats.push({ label: 'regen', value: u.ShieldRegenRate })
  if (u.ShieldSize) stats.push({ label: 'size', value: u.ShieldSize })
  if (u.ShieldRechargeTime && u.ShieldRegenStartTime) stats.push({
    label: 'recharge time',
    value: u.ShieldRechargeTime + u.ShieldRegenStartTime
  })
  return stats
}
</script>
