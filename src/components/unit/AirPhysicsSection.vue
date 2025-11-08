<template>
  <tbody v-if="airPhysicsRows.length">
    <tr  v-for="(row, idx) in airPhysicsRows" :key="idx" :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === airPhysicsRows.length - 1 }">
      <td>{{!idx? 'Air Physics': ''}}</td>
      <td colspan="2">{{ row.label }}</td>
      <td>{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { useStatRows } from '../../composables/useStatRows.js'

const props = defineProps(['air', 'physics'])

const airPhysicsConfig = [
  {
    key: (data) => data.MaxAirspeed,
    label: 'Speed',
    formatter: (val, data) => `${data.MinAirspeed || 0}-${val}`
  },
  {
    key: () => props.physics?.Elevation,
    label: 'Elevation'
  },
  { key: 'EngageDistance', label: 'Engage distance' },
  { key: 'TurnSpeed', label: 'Turn speed' },
  { key: 'CombatTurnSpeed', label: 'Combat turn speed' }
]

const airPhysicsRows = useStatRows(computed(() => props.air), airPhysicsConfig)
</script>
