<template>
  <div class="home">
    <HomeTop />
    <MasonryWall class="home__bytype" :items="sections" :column-width="350" :gap="10" :padding="10">
      <template #default="{ item: section }">
        <ByTypeSection :section="section" />
      </template>
    </MasonryWall>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUnitData } from '../composables/useUnitData.js'
import MasonryWall from '@yeger/vue-masonry-wall'
import HomeTop from '../components/HomeTop.vue'
import ByTypeSection from '../components/bytypeview/ByTypeSection.vue'

const { typeTree } = useUnitData()
const sections = computed(() => Object.entries(typeTree.value).map(([name, types]) => ({ name, types })))
</script>

<style lang="sass">
.home
  &__bytype
    width: 100%
    padding: 0 5px 5px
</style>
