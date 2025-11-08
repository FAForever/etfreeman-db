<template>
  <tbody v-if="physicsRows.length">
    <tr v-for="(row, idx) in physicsRows" :key="idx" :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === physicsRows.length - 1 }">
      <td>{{!idx? 'Physics': ''}}</td>
      <td colspan="2">{{ row.label }}</td>
      <td>{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { useStatRows } from '../../composables/useStatRows.js'
import { formatTime as time } from '../../composables/helpers/common.js'

const props = defineProps(['physics'])

const physicsConfig = [
  { key: 'MaxSpeed', label: 'Max speed' },
  { key: 'TurnRate', label: 'Turn rate' },
  {
    key: 'FuelUseTime',
    label: 'Fuel use time',
    formatter: (val) => time(val)
  },
  {
    key: (data) => data.FuelRechargeRate ? 10 * data.FuelUseTime / data.FuelRechargeRate : null,
    label: 'Fuel recharge time',
    formatter: (val) => time(val)
  }
]

const physicsRows = useStatRows(computed(() => props.physics), physicsConfig)
</script>
