<script setup>
import { computed } from 'vue'
import Icon from '../Icon.vue'

const { unit } = defineProps(['unit'])

const abilities = unit.Display?.Abilities || []

const isCompact = computed(() => abilities.length <= 3)
</script>

<template>
  <div class="u2abilities uc__section" v-if="abilities.length" :class="{ 'uc__section_compact': isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <Icon class="u2abilities__header-icon" name="abilities" width="20" />
        <span>Abilities</span>
      </h2>
      <ul :class="['uc__section-line', abilities.length > 2 ? 'uc__section-line_flex' : '']" style="justify-content: flex-start;">
        <li v-for="ability in abilities" :key="ability" class="uc__li" v-html="ability" />
      </ul>
    </div>
  </div>
</template>

<style lang="sass">
</style>
