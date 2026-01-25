<template>
  <tbody>
    <tr class="unit-details__firstline">
      <td :title="`${defense?.Health} hp`">
        <img src="/img/icons/health.png" class="unit-details__ic" alt="">{{ shorten(defense?.Health) }}
        <br>
        <div v-if="defense?.RegenRate" class="sm indented w-100">(+{{ defense.RegenRate }}hp/s)</div>
        <div v-if="economy?.BuildCostMass" class="sm indented w-100">({{ round(defense?.Health / economy?.BuildCostMass, 2) }}hp/mass)</div>
      </td>
      <td :title="economy?.BuildCostMass">
        <img src="/img/icons/mass.png" class="unit-details__ic" alt="">{{ shorten(economy?.BuildCostMass) }}
      </td>
      <td :title="economy?.BuildCostEnergy">
        <img src="/img/icons/energy.png" class="unit-details__ic" alt="">{{ shorten(economy?.BuildCostEnergy) }}
      </td>
      <td :title="economy?.BuildTime">
        <img src="/img/icons/time.png" class="unit-details__ic" alt="">{{ shorten(economy?.BuildTime) }}
      </td>
    </tr>

    <template v-if="shieldRows.length">
      <tr v-for="(row, idx) in shieldRows" :key="idx"
        :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === shieldRows.length - 1 }">
        <td v-if="idx === 0">Shield</td>
        <td v-else></td>
        <td colspan="2">{{ row.label }}</td>
        <td>{{ row.value }} <span class="sm" v-if="row.label == 'Health'"> ({{ round(defense.Shield?.ShieldMaxHealth / economy?.BuildCostMass, 2) }} hp/mass)</span></td>
      </tr>
    </template>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { round, shorten } from '../../composables/helpers/common.js'
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
