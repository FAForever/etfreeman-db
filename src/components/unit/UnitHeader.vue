<template>
  <header class="unit-details__header">
    <span :class="['unit-details__thumb', 'thumb', 'pe-none', 'icon_units', `icon-${unit.id}`]" :title="unit.fullName">
      <span :class="['strategic', 'icon_strategic', `icon-${unit.faction}_${unit.strategicIcon}`]"></span>
    </span>
    <h1 class="unit-details__title">{{ unit.fullName }}</h1>
    <a class="calm sm w-fc" :href="blueprintUrl" target="_blank">
      {{ unit.id }}
    </a>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['unit'])

const blueprintUrl = computed(() => {
  const isNomads = props.unit.faction?.toLowerCase() === 'nomads'
  const repo = isNomads ? 'nomads' : 'fa'
  const branch = isNomads ? 'master' : 'deploy/fafdevelop'
  return `https://github.com/FAForever/${repo}/blob/${branch}/units/${props.unit.id}/${props.unit.id}_unit.bp`
})
</script>
