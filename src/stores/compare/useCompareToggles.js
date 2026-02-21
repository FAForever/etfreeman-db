import { reactive, computed } from 'vue'

const isMobile = window.innerWidth < 700

const TOGGLE_DEFAULTS = {
  showUnitId: false,
  enhancementsTabs: true,
  highlightGroupedWeapons: true,
  compactSections: true,
  linedUpSections: !isMobile
}

const MINOR_WEAPON_STATS_DEFAULTS = {
  MuzzleVelocity: !isMobile,
  FiringTolerance: false,
  Yaw: false
}

export function useCompareToggles() {
  const toggles = reactive({
    ...TOGGLE_DEFAULTS,
    minorWeaponStats: { ...MINOR_WEAPON_STATS_DEFAULTS }
  })

  const unitWidth = computed(() => {
    const { MuzzleVelocity, FiringTolerance, Yaw } = toggles.minorWeaponStats
    const count = +MuzzleVelocity + +FiringTolerance + +Yaw
    return [356, 370, 385, 400][count]
  })

  return { toggles, unitWidth, gap: 8 }
}
