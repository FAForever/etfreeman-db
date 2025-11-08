<template>
  <tbody v-if="economyRows?.length">
    <tr v-for="(row, idx) in economyRows" :key="idx"
      :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === economyRows.length - 1 }">
      <td>{{!idx?'Economy':''}}</td>
      <td colspan="2">{{ row.label }}</td>
      <td>{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { useStatRows } from '../../composables/useStatRows.js'

const props = defineProps(['economy'])

const economyConfig = [
  { key: 'BuildRate', label: 'Build rate' },
  { key: 'StorageMass', label: 'Mass storage' },
  { key: 'StorageEnergy', label: 'Energy storage' },
  { key: 'ProductionPerSecondMass', label: 'Mass yield' },
  { key: 'ProductionPerSecondEnergy', label: 'Energy yield' },
  { key: 'MaintenanceConsumptionPerSecondEnergy', label: 'Energy drain' }
]

const economyRows = useStatRows(computed(() => props.economy), economyConfig)
</script>
