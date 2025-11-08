<template>
  <div class="compare">
    <aside class="compare__tools">
      <a class="compare__tools-back icon_ui icon-back" @click="router.push(lastListViewRoute)" title="back to unit list"></a>
      <ul class="compare__tools-list">
        <li v-for="(isShown, section) in showedSections" :key="section">
          <button
            :class="['compare__tools-list-btn', 'sm', { active: isShown }]"
            @click="toggleSection(section)"
          >
            {{ sectionLabels[section] || section }}
          </button>
        </li>
      </ul>
    </aside>
    <section class="compare__unitlist">
      <UnitComponent
        v-for="u in contenders"
        :key="u.id"
        :unit="u"
        :showedSections="showedSections"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useUnitData } from '../composables/useUnitData.js'
import { useUnitDataStore } from '../stores/unitData.js'
import UnitComponent from '../components/UnitComponent.vue'

const route = useRoute()
const router = useRouter()
const { units } = useUnitData()
const store = useUnitDataStore()
const { lastListViewRoute } = storeToRefs(store)

const STORAGE_KEY = 'faf-compare-sections'
const showedSections = ref({
  Defense: true,
  Economy: true,
  Abilities: true,
  Intel: true,
  Physics: true,
  AirPhysics: true,
  Wreckage: true,
  Veterancy: true,
  Weapons: true,
  Upgrades: true
})

const sectionLabels = { Defense: "HP & cost" }

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

const contenders = computed(() => ids.value
    .map(id => units.value.find(u => u.id === id))
    .filter(u => u !== undefined))

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
    &-back
      margin-bottom: 10px

    &-list
      display: grid
      gap: 5px
      &-btn
        background: rgba(255, 255, 255, 0.1)
        border: 1px solid rgba(255, 255, 255, 0.2)
        color: #fff
        padding: 0.25em 0.5em
        cursor: pointer
        font-size: 0.85em
        font-weight: 500
        width: 100%
        text-align: left
        transition: opacity 0.2s

        &:not(.active)
          opacity: 0.4

        &:hover
          background: rgba(255, 255, 255, 0.15)

  &__unitlist
    padding-bottom: 0.67em
    display: flex
    align-items: flex-start
    flex-wrap: wrap
    padding-top: 5px
    gap: 5px

</style>
