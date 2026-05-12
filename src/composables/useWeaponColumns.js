import { computed } from 'vue'
import { useCompareStore } from '@/stores/compare'

export const Column = Object.freeze({
  TYPE: 'type', DPS: 'DPS', DPS_PER_MASS: 'dps/mass',
  HP: 'HP', DPS_TO_SHIELDS: 'DPS to shields',
  DPS_TO_SHIELDS_PER_MASS: 'DPS to shields / mass',
  RANGE: 'range', AOE: 'AoE', DOT: 'DoT',
  MUZZLE_VELOCITY: 'muzzleVelocity',
  FIRING_TOLERANCE: 'firingTolerance', YAW: 'yaw',
  RANDOMNESS: 'randomness', RANDOMNESS_MOVE: 'randomnessMove',
  CYCLE: 'cycle', CYCLE_TO_SHIELDS: 'cycle to shields'
})

const COLUMN_ORDER = [
  Column.TYPE, Column.DPS, Column.DPS_PER_MASS,
  Column.HP, Column.DPS_TO_SHIELDS, Column.DPS_TO_SHIELDS_PER_MASS,
  Column.RANGE, Column.AOE, Column.DOT, Column.MUZZLE_VELOCITY,
  Column.FIRING_TOLERANCE, Column.YAW, Column.RANDOMNESS,
  Column.RANDOMNESS_MOVE, Column.CYCLE, Column.CYCLE_TO_SHIELDS
]

export function useWeaponColumns(visibleWeapons, getFractionHTML) {
  const compareStore = useCompareStore()

  const columnHeaders = computed(() => ({
    [Column.DPS_PER_MASS]: getFractionHTML(),
    [Column.DPS_TO_SHIELDS]: `<span data-tooltip-params="top-center-humble" data-tooltip="dps to shields">DPStS</span>`,
    [Column.DPS_TO_SHIELDS_PER_MASS]: getFractionHTML(true),
    [Column.CYCLE_TO_SHIELDS]: `cycle<br>to shields`,
    [Column.MUZZLE_VELOCITY]: `<span data-tooltip-params="top-center-humble" data-tooltip="muzzle velocity">MV</span>`,
    [Column.RANDOMNESS]: `<span data-tooltip-params="top-center-humble" data-tooltip="fire randomness">RNG</span>`,
    [Column.RANDOMNESS_MOVE]: `fire<br>random.<br>while<br>moving`,
    [Column.FIRING_TOLERANCE]: `<span data-tooltip-params="top-center-humble" data-tooltip="firing tolerance">FT</span>`,
    [Column.YAW]: 'angle'
  }))

  const weaponColumns = computed(() => {
    const present = new Set([Column.TYPE, Column.CYCLE])
    const { MuzzleVelocity: showMuzzleVelocity, FiringTolerance: showFiringTolerance, Yaw: showYaw } = compareStore.toggles.minorWeaponStats

    for (const weapon of visibleWeapons.value) {
      if (weapon.DamageRadius || weapon.NukeInnerRingRadius) present.add(Column.AOE)
      if (weapon.DoTTime) present.add(Column.DOT)
      if (weapon.dpsShields !== undefined) {
        present.add(Column.DPS_TO_SHIELDS)
        present.add(Column.DPS_TO_SHIELDS_PER_MASS)
        present.add(Column.CYCLE_TO_SHIELDS)
      }
      if (weapon.FiringRandomness) present.add(Column.RANDOMNESS)
      if (weapon.FiringRandomnessWhileMoving) present.add(Column.RANDOMNESS_MOVE)
    }

    if (visibleWeapons.value.some(w => w.dps != null)) {
      present.add(Column.DPS)
      present.add(Column.DPS_PER_MASS)
    }
    if (visibleWeapons.value.some(w => w.MaxRadius != null)) present.add(Column.RANGE)
    if (visibleWeapons.value.some(w => w.Projectile?.Health > 0 && !['Defense', 'Torpedoes', 'Depth Charges'].includes(w.WeaponCategory))) {
      present.add(Column.HP)
    }

    if (showMuzzleVelocity && visibleWeapons.value.some(w => w.MuzzleVelocity != null || w.BeamLifetime !== undefined)) {
      present.add(Column.MUZZLE_VELOCITY)
    }
    if (showFiringTolerance && visibleWeapons.value.some(w => w.FiringTolerance != null)) {
      present.add(Column.FIRING_TOLERANCE)
    }
    if (showYaw && visibleWeapons.value.some(w => w.TurretYawRange != null)) {
      present.add(Column.YAW)
    }

    return COLUMN_ORDER.filter(col => present.has(col))
  })

  return { weaponColumns, columnHeaders }
}
