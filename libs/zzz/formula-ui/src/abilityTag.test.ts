import type { Tag } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { parseAbilityFromTag, parseAbilityHitFromName } from './abilityTag'

describe('parseAbilityHitFromName', () => {
  it('splits numeric hit suffix', () => {
    expect(parseAbilityHitFromName('BasicAttack_3')).toEqual({
      abilityKey: 'BasicAttack',
      hitIndex: '3',
    })
  })

  it('strips aftershock name suffix before resolving ability key', () => {
    expect(parseAbilityHitFromName('UltimateVoidstrike_aftershock0')).toEqual({
      abilityKey: 'UltimateVoidstrike',
    })
    expect(
      parseAbilityHitFromName('ChainAttackLeapingThunderstrike_aftershock0')
    ).toEqual({
      abilityKey: 'ChainAttackLeapingThunderstrike',
    })
  })
})

describe('parseAbilityFromTag', () => {
  const triggerAftershockHit: Tag = {
    et: 'own',
    qt: 'formula',
    q: 'standardDmg',
    sheet: 'Trigger',
    name: 'BasicAttackHarmonizingShot_0',
    skillType: 'basicSkill',
    damageType2: 'aftershock',
  }

  const s0AnbyAftershockHit: Tag = {
    et: 'own',
    qt: 'formula',
    q: 'standardDmg',
    sheet: 'Soldier0Anby',
    name: 'UltimateVoidstrike_aftershock0',
    skillType: 'chainSkill',
    damageType2: 'aftershock',
  }

  it('parses aftershock-only hits that use damageType2 on a standard name', () => {
    expect(parseAbilityFromTag(triggerAftershockHit)).toEqual({
      skill: 'basic',
      abilityKey: 'BasicAttackHarmonizingShot',
      hitIndex: '0',
    })
  })

  it('parses sibling aftershock hits that use a distinct meta name', () => {
    expect(parseAbilityFromTag(s0AnbyAftershockHit)).toEqual({
      skill: 'chain',
      abilityKey: 'UltimateVoidstrike',
    })
  })
})
