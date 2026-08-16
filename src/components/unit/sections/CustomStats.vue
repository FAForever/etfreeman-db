<script setup>
import { computed, ref } from 'vue'
import { formatNum, round } from '@/composables/helpers/common'
import LineItem from '../helpers/LineItem.vue'
import { useCompareStore } from '@/stores/compare'
import { parseStatLabel, resolveRef } from '@/stores/compare/customStatsVars'
import { useUnitData } from '@/composables/useUnitData'
import { categorizeWeapon } from '@/composables/useWeaponGroups'
import { EXPAND_SCORE_THRESHOLD } from '@/composables/useRowAlignment'
import StatVarsPopup from '@/components/compare/StatVarsPopup.vue'

const store = useCompareStore()
const { showedSections, customStats } = store
const { unitDefaults } = useUnitData()
const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])

const popupFor = ref(null)

const val = (stat, n, enriched) => {
  const raw = resolveRef(store.getVarValue(stat, unit.id, n), enriched)
  const num = Number(raw)
  return raw !== '' && Number.isFinite(num) ? num : raw
}

const enrich = (u) => {
  let result = { ...u }
  if (u.Defense?.Shield) {
    result.Defense = {
      ...u.Defense,
      Shield: {
        ...u.Defense.Shield,
        ShieldRechargeTime: u.Defense.Shield.ShieldRechargeTime ?? unitDefaults.value.shieldDefaultRechargeTime,
        ShieldSpillOverDamageMod: u.Defense.Shield.ShieldSpillOverDamageMod ?? unitDefaults.value.shieldDefaultOverspill
      }
    }
  }
  if (u.VeteranMassMult == null) {
    const vetKey = u.Categories?.includes('COMMAND') ? 'COMMAND'
                  : u.Categories?.includes('SUBCOMMANDER') ? 'SUBCOMMANDER'
                  : u.tech === 'EXP' ? 'EXPERIMENTAL'
                  : 'TECH' + u.tech?.charAt(1)
    result.VeteranMassMult = unitDefaults.value.techToVetMultipliers?.[vetKey]
  }
  if (u.Wreckage?.MassMult) {
    const mults = unitDefaults.value.wreckageTechMassMults || {}
    const techKey = 'TECH' + u.tech?.charAt(1)
    const techMult = mults[techKey] || mults.EXPERIMENTAL || 1
    result.Wreckage = { ...u.Wreckage, MassMult: u.Wreckage.MassMult * techMult }
  }

  if (u.Weapon?.length) {
    const groups = {}
    for (const w of u.Weapon) {
      const cat = categorizeWeapon(w)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(w)
    }
    result.Weapons = Object.fromEntries(
      Object.entries(groups).map(([cat, ws]) => {
        const isNuke = ws.some(w => w.NukeInnerRingRadius)
        const radii = ws.map(w => w.MaxRadius || 0)
        const dmgRadii = isNuke
          ? ws.flatMap(w => [w.NukeInnerRingRadius || 0, w.NukeOuterRingRadius || 0])
          : ws.map(w => w.DamageRadius || 0)
        return [cat, {
          DPS: ws.reduce((s, w) => s + (w.dps || 0), 0),
          FullCycleDamage: ws.reduce((s, w) => s + ((w.fullDamage || 0) * (w.firingCycle?.cycleProjs || 1)), 0),
          MaxMaxRadius: radii.length ? Math.max(...radii) : null,
          MinMaxRadius: radii.length ? Math.min(...radii) : null,
          MaxDamageRadius: dmgRadii.length ? Math.max(...dmgRadii) : null,
          MinDamageRadius: dmgRadii.length ? Math.min(...dmgRadii) : null,
        }]
      })
    )
    const allCats = Object.values(result.Weapons)
    result.Weapons.ALL = {
      DPS: allCats.reduce((s, c) => s + (c.DPS || 0), 0),
      FullCycleDamage: allCats.reduce((s, c) => s + (c.FullCycleDamage || 0), 0),
      MaxMaxRadius: Math.max(...allCats.map(c => c.MaxMaxRadius || 0)) ?? null,
      MinMaxRadius: Math.min(...allCats.map(c => c.MinMaxRadius || 0)) ?? null,
      MaxDamageRadius: Math.max(...allCats.map(c => c.MaxDamageRadius || 0)) ?? null,
      MinDamageRadius: Math.min(...allCats.map(c => c.MinDamageRadius || 0)) ?? null,
    }
  }
  result.ID = u.id

  return result
}

const computedStats = computed(() => {
  const enriched = enrich(unit)
  return customStats.stats
    .filter(stat => stat.label && stat.formula)
    .map(stat => {
      try {
        const { pre, post, vars } = parseStatLabel(stat.label)
        const fn = new Function('unit', ...vars, `return ${stat.formula}`)
        const value = fn(enriched, ...vars.map(n => val(stat, n, enriched)))
        let finalvalue = value

        if ([null, undefined, NaN].includes(value)) return null
        if (typeof(value) == 'number') {
          if (!Number.isFinite(value)) return null
          finalvalue = formatNum(round(value, 3))
        }
        const text = vars.length
          ? pre + vars.map(n => `<b style="color:${stat.vars?.[n]?.color || '#fff'}">${val(stat, n, enriched)}</b>`).join(', ') + post
          : stat.label
        return { id: stat.id, stat, text, vars, value: finalvalue, isfat: stat.fullLine }
      } catch {
        return null
      }
    })
    .filter(Boolean)
})

const isSomeStatTakesFullLine = computed(() => computedStats.value.some(stat => stat.isfat))
const isCompact = computed(() => isSomeStatTakesFullLine.value? false : computedStats.value.length <= 3)
const isShown = computed(() => showedSections['CustomStats'] && computedStats.value.length > 0)
const expandScore = computed(() => isSomeStatTakesFullLine.value? EXPAND_SCORE_THRESHOLD : computedStats.value.length / 3)

defineExpose({ name: 'CustomStats', isCompact, isShown, expandScore })
</script>

<template>
  <div class="ucustomstats uc__section" v-if="isShown" :class="{ 'uc__section_compact': compactOverride ?? isCompact }">
    <div class="uc__section-query">
      <h2 class="uc__section-title">Custom Stats</h2>
      <div class="uc__section-line">
        <LineItem v-for="item in computedStats" :key="item.id" :value="item.value" :span="item.isfat? 12 : undefined">
          <span class="lineItem-text" v-html="item.text + ':'"
            :style="item.vars.length ? 'cursor: pointer' : undefined"
            @click.stop="item.vars.length && (popupFor = item.stat)" />
        </LineItem>
        <StatVarsPopup v-if="popupFor" :stat="popupFor" :unit-id="unit.id" @close="popupFor = null" />
      </div>
    </div>
  </div>
</template>
