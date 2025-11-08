<template>
  <tbody v-if="wreckageRows.length">
    <tr v-for="(row, idx) in wreckageRows" :key="idx" :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === wreckageRows.length - 1 }">
      <td>{{!idx?'Wreckage':''}}</td>
      <td colspan="2">{{ row.label }}</td>
      <td :title="row.fullValue">{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { shorten, round } from '../../composables/helpers/common.js'

const props = defineProps(['wreckage', 'defense', 'economy'])

const wreckageRows = computed(() => {
  const w = props.wreckage
  const def = props.defense
  const eco = props.economy
  if (!w?.HealthMult) return []

  const rows = [{
    label: 'Health',
    value: shorten(round(w.HealthMult * def.Health)),
    fullValue: round(w.HealthMult * def.Health)
  }]

  if (w.MassMult) {
    rows.push({
      label: 'Mass',
      value: shorten(round(w.HealthMult * w.MassMult * eco.BuildCostMass)),
      fullValue: round(w.HealthMult * w.MassMult * eco.BuildCostMass)
    })
  }

  return rows
})
</script>
