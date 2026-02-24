<script setup>
import { computed, ref } from 'vue';
import { useCompareStore } from '@/stores/compare'
import { useCalcEfficiency } from '@/composables/useCalcEfficiency';
import { addBr, round, roundIfPossible, shorten } from '@/composables/helpers/common';
import { getDetailedCycle, getDoTBreakdown } from '@/stores/utils/unitDecorator/dps/index.js';
import { Column } from '@/composables/useWeaponColumns';

const { weapons, category, columns, economy } = defineProps(['weapons', 'category', 'columns', 'economy'])
const compareStore = useCompareStore()
const { getDivisor, calculate, mode } = useCalcEfficiency('weapon')

const isExpanded = ref(true)
const toggleExpanded = () => { isExpanded.value = !isExpanded.value }
defineExpose({ toggleExpanded, isExpanded })

const getEfficiencyValue = (dpsValue) => {
  if (dpsValue == null) return null
  const [rate] = mode.value.split('/')
  const isPerMinute = rate === 'DPM'
  const divisor = getDivisor(economy)
  const adjustedDps = dpsValue * (isPerMinute ? 60 : 1)
  return calculate(adjustedDps, divisor)
}

const getStat = (weapon, stat) => {
  if (!weapon)
    return null
  switch (stat) {
    case Column.TYPE:
      return category
    case Column.RANGE:
      if (weapon?.MinRadius) return [weapon.MinRadius, weapon.MaxRadius]
      return weapon?.MaxRadius || null
    case Column.AOE:
      return weapon.DamageRadius || (weapon.NukeInnerRingRadius ? [weapon.NukeInnerRingRadius, weapon.NukeOuterRingRadius] : undefined)
    case Column.DPS:
      return weapon.dps
    case Column.DPS_PER_MASS:
      return getEfficiencyValue(weapon.dps)
    case Column.DPS_TO_SHIELDS:
      return weapon.dpsShields
    case Column.DPS_TO_SHIELDS_PER_MASS:
      return getEfficiencyValue(weapon.dpsShields)
    case Column.DOT:
      return weapon.DoTTime || null
    case Column.MUZZLE_VELOCITY:
      if (weapon.BeamLifetime !== undefined) return '∞'
      return weapon.MuzzleVelocity
    case Column.RANDOMNESS:
      return weapon.FiringRandomness
    case Column.RANDOMNESS_MOVE:
      return weapon.FiringRandomnessWhileMoving
    case Column.FIRING_TOLERANCE:
      return weapon.FiringTolerance
    case Column.YAW:
      return weapon.TurretYawRange
    case Column.HP:
      return weapon.Projectile?.Health || null
    case Column.CYCLE:
      return [(category == 'Defense'? 1 : weapon.fullDamage) * weapon.firingCycle.cycleProjs, weapon.FireOnDeath ? null : weapon.firingCycle.cycleTime]
    case Column.CYCLE_TO_SHIELDS:
      if (!weapon.DamageToShields) return null
      return [(category == 'Defense' ? 1 : (weapon.Damage + weapon.DamageToShields)) * weapon.firingCycle.cycleProjs, weapon.FireOnDeath ? null : weapon.firingCycle.cycleTime]
    default:
      console.error(`Unknown stat: ${stat}`)
      return null
  }
}

const getCycleTextFromVal = (val, weapon) => {
  const isNukeWithNullCycle = weapon?.NukeInnerRingDamage && val[1] === null
  const hasDoT = (weapon?.DoTPulses || 1) > 1
  const isSpecialCategory = ['Kamikaze', 'Death', 'Teleport'].includes(category)
  const isDoTNeedingTooltip = hasDoT && (weapon?.FireOnDeath || isSpecialCategory || val[1] === null)
  const dmgPart = shorten(val[0], false).toUpperCase() + (["Defense"].includes(category) ? '&nbsp;proj.' : `&nbsp;dmg`)

  if (isNukeWithNullCycle || isDoTNeedingTooltip) {
    return `<div data-tooltip-target>${dmgPart}</div>`
  }
  return dmgPart + (!isSpecialCategory && (val[1] !== null) ? `<br><div data-tooltip-target> every&nbsp;${round(val[1], 1)}s</div>` : '')
}

const getStatText = (weapon, stat, value) => {
  let val = value ?? getStat(weapon, stat)
  if (val == null) {
    val = '-'
  }
  if (stat == Column.DOT)
    return (val && !isNaN(val)) ? round(val, 1) + 's' : val
  if (stat == Column.CYCLE || stat == Column.CYCLE_TO_SHIELDS)
    return getCycleTextFromVal(val, weapon)
  if (stat == Column.HP)
    return shorten(val)
  if ([Column.RANGE, Column.AOE].includes(stat) && Array.isArray(val))
    return `${val[0]}&#8209;${shorten(val[1])}`
  if (typeof (val) == 'number') {
    const decimals = val >= 1000 ? 0 : (val >= 100 ? 1 : 2)
    return round(val, decimals)
  }
  return val
}

const getCycleTooltip = (weapon, stat) => {
  if (stat === Column.CYCLE_TO_SHIELDS) {
    return getDetailedCycle(weapon, true)
  }

  if (weapon.NukeInnerRingDamage) {
    const innerTotal = weapon.NukeInnerRingDamage + weapon.NukeOuterRingDamage
    return `${shorten(innerTotal)} damage in ${weapon.NukeInnerRingRadius} radius,\n${shorten(weapon.NukeOuterRingDamage)} damage in ${weapon.NukeOuterRingRadius} radius`
  }

  const detailed = getDetailedCycle(weapon, false)
  if (detailed) return detailed

  const dot = getDoTBreakdown(weapon)
  if (dot.hasDoT) {
    const { cycleProjs } = weapon.firingCycle
    const instant = Math.round(dot.instant * cycleProjs)
    const dotDmg = Math.round(dot.dotTotal * cycleProjs)

    // No cycle time to show - just damage breakdown
    if (weapon.FireOnDeath || ['Kamikaze', 'Death', 'Teleport'].includes(category)) {
      return `${instant}dmg + ${dotDmg} DoT`
    }

    const plural = cycleProjs > 1 ? 's' : ''
    const cycleTime = weapon.firingCycle.cycleTime
    const cycleTimeText = cycleTime === 1 ? '' : cycleTime?.toFixed(1)
    return `${instant}dmg + ${dotDmg} DoT\n${cycleProjs} shot${plural} / ${cycleTimeText}s`
  }

  return null
}

const getDoTTooltip = (weapon) => {
  const dot = getDoTBreakdown(weapon)
  if (!dot.hasDoT) return undefined

  const { cycleProjs } = weapon.firingCycle
  if (cycleProjs > 1) {
    const totalDot = dot.dotTotal * cycleProjs
    return `Each of ${cycleProjs} projectiles:\n${dot.ticks} tick${dot.ticks > 1 ? 's' : ''} of ${weapon.Damage}dmg / ${dot.interval.toFixed(1)}s\nTotal DoT: ${cycleProjs} × ${dot.dotTotal} = ${totalDot}dmg`
  }

  return `${dot.ticks} tick${dot.ticks > 1 ? 's' : ''} of ${weapon.Damage}dmg / ${dot.interval.toFixed(1)}s\nTotal DoT: ${dot.dotTotal}dmg`
}

const EFF_COLUMNS = [Column.DPS, Column.DPS_PER_MASS, Column.DPS_TO_SHIELDS, Column.DPS_TO_SHIELDS_PER_MASS, Column.CYCLE, Column.CYCLE_TO_SHIELDS]

const getGroupStatText = computed(() => {
  const stats = Object.fromEntries(columns.map(col => [col, EFF_COLUMNS.includes(col) ? [] : new Set()]))
  for (const weapon of weapons)
    for (const stat of columns) {
      if (stat === Column.DPS_PER_MASS)
        stats[stat].push(weapon.dps)
      else if (stat === Column.DPS_TO_SHIELDS_PER_MASS)
        stats[stat].push(weapon.dpsShields)
      else if ([Column.DPS, Column.DPS_TO_SHIELDS, Column.CYCLE, Column.CYCLE_TO_SHIELDS].includes(stat))
        stats[stat].push(getStat(weapon, stat))
      else if (stat == Column.RANGE)
        stats[stat].add(JSON.stringify(getStat(weapon, stat)))
      else
        stats[stat].add(getStat(weapon, stat))
    }
  for (const key in stats) {
    if (!Array.isArray(stats[key]))
      stats[key] = Array.from(stats[key])
    switch (key) {
      case Column.DPS:
      case Column.DPS_TO_SHIELDS: {
        const total = stats[key].reduce((acc, val) => acc + (val ?? 0), 0)
        const decimals = total >= 1000 ? 0 : (total >= 100 ? 1 : 2)
        stats[key] = round(total, decimals)
        break
      }
      case Column.DPS_PER_MASS:
      case Column.DPS_TO_SHIELDS_PER_MASS: {
        const totalDps = stats[key].reduce((acc, val) => acc + (val ?? 0), 0)
        const efficiency = getEfficiencyValue(totalDps)
        const effDecimals = efficiency >= 1000 ? 0 : (efficiency >= 100 ? 1 : 2)
        stats[key] = round(efficiency, effDecimals)
        break
      }
      case Column.CYCLE:
      case Column.CYCLE_TO_SHIELDS: {
        const [sum, times] = stats[key].reduce((acc, val) => val ? [acc[0] + val[0], acc[1].add(val[1])] : acc, [0, new Set()])
        if (times.size != 1 || times.has(null)) stats[key] = 'different'
        else stats[key] = getCycleTextFromVal([sum, Array.from(times)[0]])
        break
      }
      case Column.RANGE:
        if (stats[key].length == 1) stats[key] = `<div class="shrinkable-param">${getStatText(null, key, JSON.parse(stats[key][0]))}</div>`
        else {
          stats[key] = `<div class="shrinkable-param">${stats[key].map(el => getStatText(null, key, JSON.parse(el) || 0)).join(', ')}</div>`
        }
        break
      case Column.FIRING_TOLERANCE: {
        const rawValue = stats[key].length == 1 ? stats[key][0] : stats[key].map(el => getStatText(null, key, el || 0)).join(', ')
        const valueStr = String(rawValue)
        const needsShrink = valueStr.includes(',') ? valueStr.length > 3 : valueStr.length > 2
        const className = needsShrink ? 'shrinkable-param' : ''
        if (stats[key].length == 1) stats[key] = `<div class="${className}">${roundIfPossible(stats[key][0], 2)}</div>`
        else {
          stats[key] = `<div class="${className}">${stats[key].map(el => getStatText(null, key, el || 0)).join(', ')}</div>`
        }
        break
      }
      case Column.MUZZLE_VELOCITY:
        if (stats[key].length == 1) stats[key] = `<div class="shrinkable-param">${getStatText(null, key, stats[key][0])}</div>`
        else {
          stats[key] = `<div class="shrinkable-param">${stats[key].map(el => getStatText(null, key, el)).join(', ')}</div>`
        }
        break
      case Column.YAW:
        if (stats[key].length == 1) stats[key] = `<div class="shrinkable-param">${getStatText(null, key, stats[key][0])}</div>`
        else {
          stats[key] = `<div class="shrinkable-param">${stats[key].map(el => getStatText(null, key, el)).join(', ')}</div>`
        }
        break
      default:
        if (stats[key].length == 1) stats[key] = roundIfPossible(stats[key][0], 2)
        else {
          stats[key] = stats[key].map(el => getStatText(null, key, el || 0)).join(', ')
        }
    }
    if (stats[key] == undefined || stats[key] == '')
      stats[key] = '-'
  }
  return stats
})

const groupedWeapons = computed(() => {
  if (!isExpanded.value) return []

  const groups = []
  for (const weapon of weapons) {
    const signature = columns.map(col =>
      col === Column.TYPE ? category : getStat(weapon, col)
    ).join('|')

    const existing = groups.find(g => g.signature === signature)
    if (existing) {
      existing.count++
      existing.weapons.push(weapon)
    } else {
      groups.push({ signature, count: 1, weapons: [weapon] })
    }
  }
  return groups
})

const getDisplayName = (group) => {
  const name = addBr(group.weapons[0].DisplayName, 10)
  if (group.count > 1) return `<b class="weaponGroup__important">${group.count}x</b> ${name}`
  return name
}

const hasTractor = weapons.some(w => w.TractorDamage)
const tractorTooltip = hasTractor ? 'Tractor only deals damage \nonce the target is fully pulled in' : undefined

const shouldHighlightCollapsed = computed(() =>
  compareStore.toggles.highlightGroupedWeapons && !isExpanded.value && weapons.length > 1
)

</script>

<template>
  <tr v-if="weapons.length == 1">
    <td v-for="col in columns" :key="col" :data-tooltip="(col === Column.CYCLE || col === Column.CYCLE_TO_SHIELDS) ? getCycleTooltip(weapons[0], col) : (col === Column.DOT ? getDoTTooltip(weapons[0]) : undefined)" data-tooltip-params="big-top-left" v-html="getStatText(weapons[0], col) ?? '-'" />
  </tr>
  <template v-else>
    <tr class="weaponGroup" :class="{ active: isExpanded, highlighted: shouldHighlightCollapsed }" @click="toggleExpanded" style="cursor: pointer">
      <template v-for="col, index in columns" :key="col">
        <td v-if="index" v-html="getGroupStatText[col] || '-'" />
        <td v-else :data-tooltip="tractorTooltip" data-tooltip-params="big-top-right">
          <div class="groupToggle" @click.stop="toggleExpanded">
            <div class="groupToggle__triangle" :class="{ active: isExpanded }"></div>
            <div v-html="getGroupStatText[col] || '-'"></div>
          </div>
        </td>
      </template>
    </tr>
    <template v-if="isExpanded">
      <tr v-for="group, index in groupedWeapons" :key="group.signature" class="active" :class="{'lastWeapon': index == groupedWeapons.length - 1}">
        <td v-for="col, colIndex in columns" :key="col" :data-tooltip="(colIndex && (col === Column.CYCLE || col === Column.CYCLE_TO_SHIELDS)) ? getCycleTooltip(group.weapons[0], col) : (colIndex && col === Column.DOT ? getDoTTooltip(group.weapons[0]) : undefined)" data-tooltip-params="big-top-left" v-html="colIndex ? (getStatText(group.weapons[0], col) ?? '-') : getDisplayName(group)"></td>
      </tr>
    </template>
  </template>
</template>

<style lang="sass">
.weaponGroup
  &__important
    color: rgb(255,255,0)
  &.active td
    border-top: 1px solid rgba(255,255,255,.5)
    padding-top: 5px
  &.highlighted td
    background: rgba(0,0,0,.3)
    border-top: 1px solid rgba(255,255,255,.5) !important
    border-bottom: 1px solid rgba(255,255,255,.5) !important
    padding-top: 5px
    padding-bottom: 5px
  &.highlighted:hover td
    background: rgba(0,0,0,.3)
  &:hover:not(.active):not(.highlighted) td
    background: rgba(0,0,0,.1)
.lastWeapon.active td:nth-child(n)
  border-bottom: 1px solid rgba(255,255,255,.5)
  padding-bottom: 5px
.active .groupToggle
  font-weight: 800 !important
.groupToggle
  display: flex
  justify-content: center
  align-items: center
  gap: 3px
  &__triangle
    width: 0
    height: 0
    border-left: 4px solid transparent
    border-right: 4px solid transparent
    border-top: 6px solid currentColor
    transition: transform 0.2s ease
    cursor: pointer
    &.active
      transform: rotate(180deg)
.shrinkable-param
  width: min-content
  margin: auto
</style>
