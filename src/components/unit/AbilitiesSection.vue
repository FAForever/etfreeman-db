<template>
  <tbody v-if="abilities">
    <tr class="unit-details__sec unit-details__sec-end">
      <td>Abilities</td>
      <td colspan="3" v-html="abilities.join('<br>')"></td>
    </tr>
  </tbody>
</template>

<script setup>
defineProps(['abilities'])
</script>
