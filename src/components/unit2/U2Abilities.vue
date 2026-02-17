<script setup>
import { computed } from 'vue'
import Icon from '../Icon.vue'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const abilities = unit.Display?.Abilities || []

const isCompact = computed(() => abilities.length <= 3)
const isShown = computed(() => abilities.length > 0)
const expandScore = computed(() => abilities.length / 3)

defineExpose({ isCompact, isShown, expandScore })
</script>

<template>
  <div class="u2abilities uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">
        <Icon class="u2abilities__header-icon" name="abilities" width="20" />
        <span>Abilities</span>
      </h2>
      <ul :class="['uc__section-line']" style="justify-content: flex-start;">
        <li v-for="ability in abilities" :key="ability" class="uc__li" v-html="ability" />
      </ul>
    </div>
  </div>
</template>

<style lang="sass">
</style>
