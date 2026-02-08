<template>
  <div class="compare">
    <aside class="compare__tools">
      <button class="compare__tools-back" @click="router.push(lastListViewRoute)" title="back to unit list">
        <svg viewBox="0 0 1228.8 1024" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M267.5 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L268.9 443.784h876.6c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H267.5z"></path></g></svg>
        back
      </button>
      <ul class="compare__tools-list">
        <li v-for="(isShown, section) in showedSections" :key="section">
          <button :class="['compare__tools-list-btn', 'sm', { active: isShown }]" @click="toggleSection(section)">
            {{ sectionLabels[section] || section }}
          </button>
        </li>
      </ul>
    </aside>
    <MasonryWall class="compare__unitlist" :items="comparedUnits" :column-width="380" :gap="10" :padding="10">
      <template #default="{ item: u, index }">
        <UnitComponent v-if="false" :unit="u" :showedSections="showedSections" />
        <UnitComponent2 v-else :unit="u" :showedSections="showedSections" />
      </template>
    </MasonryWall>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitDataStore } from '../stores/unitData.js'
import UnitComponent from '../components/UnitComponent.vue'
import UnitComponent2 from '../components/UnitComponent2.vue'
import MasonryWall from '@yeger/vue-masonry-wall'

const route = useRoute()
const router = useRouter()
const { unitsMap } = useUnitData()
const store = useUnitDataStore()
const { lastListViewRoute } = storeToRefs(store)

const STORAGE_KEY = 'faf-compare-sections-v2'
const showedSections = ref({
  Defense: true,
  Economy: true,
  Offense: true,
  Physics: true,
  Abilities: true,
  Intel: true,
  Transport: true,
  Veterancy: true,
  Wreckage: true,
  Enhancements: true
})

const sectionLabels = { Enhancements: 'Enhan-nts' }

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return

  try {
    Object.assign(showedSections.value, JSON.parse(stored))
  } catch (e) {
    console.error('Failed to parse section visibility', e)
  }
})

function toggleSection(section) {
  showedSections.value[section] = !showedSections.value[section]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(showedSections.value))
}

const ids = computed(() => route.params.ids ? route.params.ids.split(',') : [])

const rawUnits = computed(() => ids.value
  .map(id => unitsMap.value[id])
  .filter(Boolean))

const comparedUnits = computed(() => {
  const items = []
  for (const u of rawUnits.value) {
    items.push(u)
  }
  return items
})

watch(comparedUnits, () => comparedUnits.value.length || router.push(lastListViewRoute.value))

</script>

<style lang="sass">
.compare
  display: flex
  align-items: flex-start
  gap: 3px
  &__tools
    position: sticky
    top: 0
    min-height: 100vh
    min-height: 100dvh
    padding: 10px 5px
    font-family: var(--titlefont)
    font-size: 16px
    &-back
      display: flex
      align-items: center
      margin-bottom: 5px
      width: 100%
      background: rgba(255, 255, 255, 0.05)
      border: 1px solid rgba(255, 255, 255, .5)
      border-radius: 2px
      color: #fff
      padding: 3px 5px
      cursor: pointer
      font-size: 0.85em
      font-weight: 500
      width: 100%
      transition: opacity 0.2s
      gap: 3px
      svg
        transform-origin: left center
        fill: white
        stroke: white
        stroke-width: 20
        height: 12px
      &:hover
        background: rgba(255, 255, 255, 0.15)

    &-list
      display: grid
      gap: 3px
      &-btn
        background: rgba(255, 255, 255, 0.05)
        border: 1px solid rgba(255, 255, 255, 0.1)
        border-radius: 2px
        color: #eee
        padding: 3px 4px
        cursor: pointer
        font-size: 12px
        font-weight: 500
        width: 100%
        text-align: left
        transition: opacity 0.2s
        letter-spacing: -0.03em
        &:not(.active)
          opacity: 0.4

        &:hover
          background: rgba(255, 255, 255, 0.15)

  &__unitlist
    padding: 10px 0
    flex-grow: 1
    >*
      flex-grow: 0 !important

</style>
