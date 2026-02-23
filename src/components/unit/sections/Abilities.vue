<script setup>
import { computed } from 'vue'
import { useCompareStore } from '@/stores/compare'

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { showedSections } = useCompareStore()

const abilities = unit.Display?.Abilities || []

const isCompact = computed(() => abilities.length <= 3)
const isShown = computed(() => showedSections['Abilities'] && abilities.length > 0)
const expandScore = computed(() => abilities.length / 3)

defineExpose({ name: 'Abilities', isCompact, isShown, expandScore })
</script>

<template>
  <div class="uabilities uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Abilities</h2>
      <ul :class="['uc__section-line']" style="justify-content: flex-start;">
        <li v-for="ability in abilities" :key="ability" class="uc__li" v-html="ability" />
      </ul>
    </div>
  </div>
</template>

<style lang="sass">
</style>
