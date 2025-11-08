<template>
  <tbody>
    <tr class="unit-details__firstline">
      <td :title="`${defense?.Health} hp`">
        <span title="health" class="unit-details__ic icon_ui icon-health"></span>{{ shorten(defense?.Health) }}
        <br />
        <div v-if="defense?.RegenRate" class="sm ta-c w-100">(+{{ defense.RegenRate }}hp/s)</div>
      </td>
      <td :title="economy?.BuildCostMass">
        <span title="mass" class="unit-details__ic icon_ui icon-mass"></span>{{ shorten(economy?.BuildCostMass) }}
      </td>
      <td :title="economy?.BuildCostEnergy">
        <span title="energy" class="unit-details__ic icon_ui icon-energy"></span>{{ shorten(economy?.BuildCostEnergy) }}
      </td>
      <td :title="economy?.BuildTime">
        <span title="time" class="unit-details__ic icon_ui icon-time"></span>{{ shorten(economy?.BuildTime) }}
      </td>
    </tr>

    <template v-if="shieldRows.length">
      <tr v-for="(row, idx) in shieldRows" :key="idx"
        :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === shieldRows.length - 1 }">
        <td v-if="idx === 0">Shield</td>
        <td v-else></td>
        <td colspan="2">{{ row.label }}</td>
        <td>{{ row.value }}</td>
      </tr>
    </template>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { shorten } from '../../composables/helpers/common.js'
import { useStatRows } from '../../composables/useStatRows.js'

const props = defineProps(['defense', 'economy'])

const shieldConfig = [
  {
    key: 'ShieldMaxHealth',
    label: 'Health',
    formatter: (val) => shorten(val)
  },
  {
    key: 'ShieldRegenRate',
    label: 'Regen',
    formatter: (val) => `${val} hp/s`
  },
  { key: 'ShieldSize', label: 'Size' },
  {
    key: (data) => data.ShieldRechargeTime + data.ShieldRegenStartTime,
    label: 'Recharge time',
    formatter: (val) => `${val} s`
  }
]

const shieldRows = useStatRows(computed(() => props.defense?.Shield), shieldConfig)
</script>
