<script setup>
import { computed, ref } from 'vue';
import { round } from '../../composables/helpers/common';
import Icon from '../Icon.vue';
import LineItem from './LineItem.vue';
import { useUnitData } from '../../composables/useUnitData';
import { useCalcEfficiency } from '../../composables/useCalcEfficiency';

const { unit, compactOverride } = defineProps(['unit', 'compactOverride'])
const { unitDefaults } = useUnitData()
const { getDivisor, calculate, denominatorLabel, invert } = useCalcEfficiency('unit')

const health = computed(() => unit.Defense.Health)
const shield = computed(() => unit.Defense.Shield && unit.Defense.Shield.ShieldMaxHealth ? unit.Defense.Shield : null)

const hpBarValue = computed(() => health.value + ' HP' + (unit.Defense.RegenRate ? (' + ' + unit.Defense.RegenRate + '/s') : ''))
const shieldBarValue = computed(() => shield.value.ShieldMaxHealth + ' HP' + (shield.value.ShieldRegenRate ? (' + ' + shield.value.ShieldRegenRate + '/s') : ''))
const mergedBarValue = computed(() => health.value + shield.value.ShieldMaxHealth + ' HP' + (unit.Defense?.RegenRate || shield.value.ShieldRegenRate ? (' + ' + ((unit.Defense?.RegenRate || 0) + (shield.value.ShieldRegenRate || 0)) + '/s') : ''))
const shieldType = computed(() => {
  if (shield.value.PersonalShield)
    return 'Personal'
  if (shield.value.PersonalBubble)
    return 'Personal*'
  return 'Bubble'
})

const divisor = computed(() => getDivisor(unit.Economy))

const getEfficiencyDisplay = (hpValue) => {
  const d = divisor.value
  const result = calculate(hpValue, d)
  const decimals = result >= 10 ? 2 : 3
  if (invert.value) {
    return `${round(result, decimals)} ${denominatorLabel.value} / HP`
  }
  return `${round(result, decimals)} / ${denominatorLabel.value}`
}

const isShieldAndHpUnited = ref(false)

const isShown = computed(() => true)
const isCompact = computed(() => false)
const expandScore = computed(() => 0)

defineExpose({ isCompact, isShown, expandScore })
</script>

<template>
  <div class="u2defense uc__section" v-if="isShown">
    <h2 class="uc__section-title u2defense__header" v-if="false">Defense</h2>
    <div class="uc__section-line uc__section-line_close" v-if="!isShieldAndHpUnited">
      <LineItem :span="invert ? 7 : 8" :type="['bar', 'bar-hp']" :value="hpBarValue" />
      <LineItem span="4" :value="getEfficiencyDisplay(health)" />
    </div>
    <button v-if="shield" class="u2defense__merge" :class="{'u2defense__merge_merged': isShieldAndHpUnited}" @click="isShieldAndHpUnited = !isShieldAndHpUnited">{{isShieldAndHpUnited? '-' : '+'}}</button>
    <template v-if="shield">
      <div class="uc__section-line uc__section-line_close" v-if="!isShieldAndHpUnited">
        <LineItem :span="invert ? 7 : 8" :type="['bar', 'bar-shield']" :value="shieldBarValue" />
        <LineItem span="4" :value="getEfficiencyDisplay(shield.ShieldMaxHealth)" />
      </div>
      <div class="uc__section-line uc__section-line_close" v-if="isShieldAndHpUnited">
        <LineItem :span="invert ? 7 : 8" :type="['bar', 'bar-hp-and-shield']" :value="mergedBarValue" />
        <LineItem span="4" :value="getEfficiencyDisplay(health + shield.ShieldMaxHealth)" />
      </div>
      <div class="uc__section-line">
        <LineItem text="Shield regen delay:" :value="shield.ShieldRegenStartTime + 's'" />
        <LineItem text="Shield type:" :value="shieldType"
          :tooltip="shield.PersonalBubble ? ['PersonalBubble, to be precise','bottom-left'] : null" />
      </div>
      <div class="uc__section-line" v-if="shieldType == 'Bubble'">
        <LineItem text="Shield size:" :value="shield.ShieldSize" />
        <LineItem text="Shield overspill:" :value="shield.ShieldSpillOverDamageMod || unitDefaults.shieldDefaultOverspill" />
      </div>
      <div class="uc__section-line">
        <LineItem text="Recharge time:" span="12"
          :value="(shield.ShieldRechargeTime || unitDefaults.shieldDefaultRechargeTime) + `s<span>, so recharges</span> ${round(shield.ShieldMaxHealth / (shield.ShieldRechargeTime || unitDefaults.shieldDefaultRechargeTime), 2)} hp/s`" />
      </div>
    </template>
  </div>
</template>

<style lang="sass">
.uc
  --mergedopacity: 0
.uc:hover
  --mergedopacity: .75
  --mergedopacity-merged: .2
.u2defense
  position: relative
  margin-top: -4px
  --bottompadding: 3px
  &:last-child
    --bottompadding: 1px
  &:hover
    --mergedopacity-merged: .75
  &__merge
    transition: opacity .2s ease
    opacity: var(--mergedopacity, 0)
    width: 20px
    height: 20px
    font-weight: 800
    font-size: 20px
    position: absolute
    background: color.adjust(#f5da42, $alpha: -0.4)
    border: 1px solid #f5da42
    box-shadow: 0 0 2px #f5da42
    border-radius: 5px
    color: white
    display: flex
    align-items: center
    justify-content: center
    text-shadow: 1px 1px black, -1px 1px black, 1px -1px black, -1px -1px black
    border-radius: 5px
    transform: translate(-50%, calc(-50% - 2px))
    &_merged
      transform: translate(-50%, 3px)
      opacity: var(--mergedopacity-merged, 0.1)
    &:hover
      opacity: 1 !important

  &__header
    &-icon
      stroke: white
      fill: #999
</style>