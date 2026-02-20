<script setup>
import { ref, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useOptimalLayout } from '../composables/useOptimalLayout.js'
import { useContainerWidth } from '../composables/useContainerWidth.js'
import { sectionSortScores } from '../components/homeview/config.js'
import HomeTop from '../components/HomeTop.vue'
import HomeSection from '../components/homeview/HomeSection.vue'

const router = useRouter()
const { tierTree } = useUnitData()

const isMobile = inject('isMobile')
watch(isMobile, (notEnoughWidth) => !notEnoughWidth || router.push('/by-type'), { immediate: true })

const containerRef = ref(null)
const { containerWidth } = useContainerWidth(containerRef)
const { optimalOrder } = useOptimalLayout(tierTree, containerWidth, { sectionSortScores })
</script>

<template>
  <div class="home">
    <HomeTop />
    <div class="home__units" ref="containerRef">
      <HomeSection v-for="section in optimalOrder" :key="section.name" :section="section" />
    </div>
  </div>
</template>

<style lang="sass">
.home
  width: 100%
  display: flex
  flex-direction: column
  align-items: flex-start

  &__units
    display: flex
    flex-wrap: wrap
    gap: 10px
    align-content: flex-start
    flex-grow: 1
    width: 100%
    padding-bottom: 5px
</style>
