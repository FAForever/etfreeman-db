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

const ABNORMAL_FAT_UNITS = ['XNS0205','XNS0302','XNS0303']

export function useCompareToggles(unitIDs) {
  const toggles = reactive({
    ...TOGGLE_DEFAULTS,
    minorWeaponStats: { ...MINOR_WEAPON_STATS_DEFAULTS }
  })

  const unitWidth = computed(() => {
    const { MuzzleVelocity, FiringTolerance, Yaw } = toggles.minorWeaponStats
    const count = +MuzzleVelocity + +FiringTolerance + +Yaw
    const veryFat = unitIDs.value.some(ID => ABNORMAL_FAT_UNITS.includes(ID))

    return [356, 370, 385, 400][count] + (veryFat ? 35 : 0)
  })

  return { toggles, unitWidth, gap: 8 }
}
