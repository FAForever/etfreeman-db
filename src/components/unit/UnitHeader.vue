<template>
  <header class="unit-details__header">
    <span :class="['unit-details__thumb', 'thumb', 'pe-none', 'icon_units', `icon-${unit.id}`]" :title="unit.fullName">
      <span :class="['strategic', 'icon_strategic', `icon-${unit.faction}_${unit.strategicIcon}`]"></span>
    </span>
    <h1 class="unit-details__title">{{ unit.fullName }}</h1>
    <a class="calm sm w-fc" :href="`https://github.com/FAForever/fa/blob/deploy/fafdevelop/units/${unit.id}/${unit.id}_unit.bp`" target="_blank">
      {{ unit.id }}
    </a>
  </header>
</template>

<script setup>
defineProps(['unit'])
</script>
