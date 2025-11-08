<template>
  <tbody>
    <tr v-for="(row, idx) in intelRows" :key="idx" :class="{ 'unit-details__sec': idx === 0, 'unit-details__sec-end': idx === intelRows.length - 1 }">
      <td>{{!idx? 'Intel': ''}}</td>
      <td colspan="2">{{ row.label }}</td>
      <td>{{ row.value }}</td>
    </tr>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { useStatRows } from '../../composables/useStatRows.js'

const props = defineProps(['intel'])

const intelConfig = [
  { key: 'VisionRadius', label: 'Vision radius' },
  { key: 'WaterVisionRadius', label: 'Water vision radius' },
  { key: 'RadarRadius', label: 'Radar radius' },
  { key: 'SonarRadius', label: 'Sonar radius' }
]

const intelRows = useStatRows(computed(() => props.intel), intelConfig)
</script>
