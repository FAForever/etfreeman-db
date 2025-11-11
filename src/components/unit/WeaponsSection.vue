<template>
  <tbody v-if="weapons">
    <template v-for="(w, wIdx) in groupedWeapons" :key="wIdx">
      <tr class="unit-details__sec">
        <td>{{!wIdx?'Weapons':''}}</td>
        <td colspan="3" class="unit-details__minititle">
          {{ w.DisplayName }}
          <span v-if="w.count > 1" class="sm">(&times;{{ w.count }})</span>
        </td>
      </tr>
      <tr v-if="w.dps || w.Damage">
        <td></td>
        <td title="category (damage type)" colspan="2">
          <span class="sm">{{ w.WeaponCategory }} ({{ w.DamageType }})</span>
        </td>
        <td>
          <span v-if="w.dps" title="damage per second" class="sm">{{ roundVal(w.dps, 2) }}dps<br /></span>
          <span title="damage per shot" class="sm">{{ roundVal(w.Damage) }}dmg</span>
        </td>
      </tr>
      <tr v-for="stat, wsIdx in weaponStats(w)" :key="stat.label"
        :class="{ 'unit-details__sec-end': wsIdx === weaponStats(w).length - 1 }">
        <td></td>
        <td :colspan="stat.colspan || 2"><span class="sm">{{ stat.label }}</span></td>
        <td :title="stat.title"><span class="sm" v-html="stat.value"></span></td>
      </tr>
    </template>
  </tbody>
</template>

<script setup>
import { computed } from 'vue'
import { shorten, round } from '../../composables/helpers/common.js'

const props = defineProps(['weapons', 'unit'])

const roundVal = (val, places = 0) => round(val, places)

const DISPLAYED_PROPS = [
  'DisplayName', 'WeaponCategory', 'DamageType', 'dps', 'Damage',
  'MaxRadius', 'MinRadius', 'DamageRadius', 'MuzzleVelocity', 'ProjectileLifetime',
  'NukeInnerRingRadius', 'NukeOuterRingRadius', 'NukeInnerRingDamage', 'NukeOuterRingDamage',
  'BeamLifetime', 'RackFireTogether', 'ManualFire', 'MuzzleSalvoSize', 'ProjectilesPerOnFire', 'isTML',
  'TurretPitchRange', 'TurretPitch', 'TurretPitchSpeed',
  'TurretYawRange', 'TurretYaw', 'TurretYawSpeed',
  'FiringTolerance', 'FiringRandomness'
]

const weaponKey = (w) => {
  const key = {}
  DISPLAYED_PROPS.forEach(prop => key[prop] = w[prop])
  return JSON.stringify(key)
}

const groupedWeapons = computed(() => {
  if (!props.weapons) return []

  const groups = []
  const seen = new Map()

  props.weapons.forEach(weapon => {
    const key = weaponKey(weapon)
    if (seen.has(key)) {
      seen.get(key).count++
    } else {
      const w = { ...weapon, count: 1 }
      seen.set(key, w)
      groups.push(w)
    }
  })

  return groups
})

const weaponStats = (w) => {
  const stats = []
  if (w.MaxRadius) stats.push({
    label: 'Range',
    value: `${w.MinRadius || 0} - ${shorten(w.MaxRadius)}`,
    title: 'min - max'
  })
  if (w.DamageRadius) stats.push({ label: 'Damage radius', value: w.DamageRadius, title: 'damage radius' })
  if (w.MuzzleVelocity) stats.push({ label: 'Muzzle velocity', value: w.MuzzleVelocity, title: 'muzzle velocity' })
  if (w.ProjectileLifetime) stats.push({ label: 'Lifetime', value: w.ProjectileLifetime, title: 'muzzle lifetime' })
  if (w.ProjectilesPerOnFire && w.ProjectilesPerOnFire > 1) stats.push({ label: 'Projectiles/shot', value: w.ProjectilesPerOnFire, title: 'projectiles per shot' })
  if (w.NukeInnerRingRadius && w.NukeOuterRingRadius) stats.push({
    label: 'Ring radius',
    value: `${w.NukeInnerRingRadius} | ${w.NukeOuterRingRadius}`,
    title: 'inner ring radius | outer ring radius'
  })
  if (w.NukeInnerRingDamage && w.NukeOuterRingDamage) stats.push({
    label: 'Ring damage',
    value: `${shorten(w.NukeInnerRingDamage)} | ${shorten(w.NukeOuterRingDamage)}`,
    title: 'inner ring damage | outer ring damage'
  })
  if (w.BeamLifetime) {
    stats.push({ label: 'Beam cycle', value: props.unit.beamCycle(w) })
    stats.push({ label: 'Beam lifetime', value: w.BeamLifetime })
  }
  if (w.RackFireTogether) stats.push({ label: 'RackFireTogether', value: w.RackFireTogether })
  if ((w.ManualFire || w.MuzzleSalvoSize) && !w.isTML) stats.push({
    label: `Fire cycle${w.ManualFire ? ' ⦿' : ''}`,
    value: props.unit.fireCycle(w),
    title: w.ManualFire ? 'manual fire' : ''
  })
  if (w.TurretPitchRange) stats.push({
    label: 'Turret pitch',
    value: `${w.TurretPitch}~${w.TurretPitchRange}° |&nbsp;${w.TurretPitchSpeed}°/s`,
    title: 'min ~ max | speed'
  })
  if (w.TurretYawRange) stats.push({
    label: 'Turret yaw',
    value: `${w.TurretYaw}~${w.TurretYawRange}° |&nbsp;${w.TurretYawSpeed}°/s`,
    title: 'min ~ max | speed'
  })
  if (w.FiringTolerance) stats.push({ label: 'Firing Tolerance', value: w.FiringTolerance })
  if (w.FiringRandomness) stats.push({ label: 'Firing Randomness', value: w.FiringRandomness })
  return stats
}
</script>
