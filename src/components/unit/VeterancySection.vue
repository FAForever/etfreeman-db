<template>
  <tbody v-if="veteran">
    <tr v-for="lv in [1, 2, 3, 4, 5]" :key="lv" :class="{ 'unit-details__sec': lv === 1, 'unit-details__sec-end': lv === 5 }">
      <td>{{ lv == 1? 'Veterancy':''}}</td>
      <td :title="'kills'"><span class="sm">{{ veteran[`Level${lv}`] }}</span></td>
      <td :title="`${roundVal(defense.Health * (1 + lv * 0.1))}hp health`">
        <span class="sm">{{ shorten(roundVal(defense.Health * (1 + lv * 0.1))) }} hp</span>
      </td>
      <td title="regeneration rate">
        <span class="sm">{{ (defense?.RegenRate || 0) + getVetRegen(lv) }} hp/s</span>
      </td>
    </tr>
  </tbody>
</template>

<script setup>
import { shorten, round } from '../../composables/helpers/common.js'

const props = defineProps(['veteran', 'defense', 'categories', 'tech'])

const veterancyRegenBuffs = {
  T1: [1, 2, 3, 4, 5],
  T2: [3, 6, 9, 12, 15],
  T3: [6, 12, 18, 24, 30],
  SACU: [9, 18, 27, 36, 45],
  EXP: [25, 50, 75, 100, 125]
}

const getVetRegen = (level) => {
  if (props.categories?.includes('SUBCOMMANDER')) return veterancyRegenBuffs.SACU[level - 1]
  if (props.categories?.includes('COMMAND')) return veterancyRegenBuffs.T3[level - 1]
  if (props.tech === 'EXP') return veterancyRegenBuffs.EXP[level - 1]
  const techLevel = props.tech || 'T1'
  return veterancyRegenBuffs[techLevel]?.[level - 1] || 0
}

const roundVal = (val, places = 0) => round(val, places)
</script>
