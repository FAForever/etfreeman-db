<template>
  <tbody v-if="wreckageRows.length">
    <tr v-for="(row, idx) in wreckageRows" :key="idx"
      :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === wreckageRows.length - 1 }">
      <td>{{ !idx ? 'Wreckage' : '' }}</td>
      <td colspan="2">{{ row.label }}</td>
      <td :title="row.fullValue">{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { shorten, round } from '../../composables/helpers/common.js'

const props = defineProps(['wreckage', 'defense', 'economy', 'tech'])

const wreckageRows = computed(() => {
  const rows = []
  const w = props.wreckage
  const def = props.defense
  const eco = props.economy
  const tech = props.tech
  if (!w?.HealthMult) return []

  if (w.MassMult) {
    let massTechMult = 1.0;
    switch (tech) {
      case 'T1':
        massTechMult = 0.9;
        break;
      case 'T2':
        massTechMult = 0.8;
        break;
      case 'T3':
        massTechMult = 0.7;
        break;
      case 'EXP':
        massTechMult = 0.6;
        break;
    }
    const massValue = eco.BuildCostMass * w.MassMult * massTechMult;
    const waterMassValue = massValue * 0.6;

    rows.push({
      label: 'Mass',
      value: shorten(round(massValue)),
      fullValue: round(massValue)
    })

    rows.push({
      label: 'Mass (in water)',
      value: shorten(round(waterMassValue)),
      fullValue: round(waterMassValue)
    })
  }

  rows.push({
    label: 'Health',
    value: shorten(round(w.HealthMult * def.Health)),
    fullValue: round(w.HealthMult * def.Health)
  })

  return rows
})
</script>
