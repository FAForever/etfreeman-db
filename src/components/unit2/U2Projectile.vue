<script setup>
import CostsList from '../ui/CostsList.vue'

const props = defineProps(['projectile'])
</script>

<template>
  <div class="u2projectile">
    <span class="u2projectile__title">{{ projectile.Description }}</span>
    <CostsList :item="projectile" :size="16" />
  </div>
</template>

<style lang="sass">
.u2projectile
  width: calc(100% + var(--sectionpadding) * 2)
  margin: 0 calc(var(--sectionpadding) * (-1))
  padding: 5px var(--sectionpadding)
  display: flex
  flex-wrap: wrap
  justify-content: space-between
  align-items: center
  gap: 4px 8px
  border-top: 1px solid var(--factioncolor)
  border-bottom: 1px solid var(--factioncolor)
  background: var(--titlebg)
  & + &
    border-top: none
  &:last-child
    border-bottom: none
  &__title
    font-family: var(--titlefont)
    font-weight: 600
    font-size: 14px
</style>
