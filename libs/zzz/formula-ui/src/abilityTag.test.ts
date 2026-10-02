import { formulaCatalog } from '@genshin-optimizer/zzz/formula'
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
  it('parses aftershock-only hits that use damageType2 on a standard name', () => {
    expect(
      parseAbilityFromTag(
        formulaCatalog.Trigger.BasicAttackHarmonizingShot_0.dims.standardDmg
      )
    ).toEqual({
      skill: 'basic',
      abilityKey: 'BasicAttackHarmonizingShot',
      hitIndex: '0',
    })
  })

  it('parses sibling aftershock hits that use a distinct meta name', () => {
    expect(
      parseAbilityFromTag(
        formulaCatalog.Soldier0Anby.UltimateVoidstrike_aftershock0.dims
          .standardDmg
      )
    ).toEqual({
      skill: 'chain',
      abilityKey: 'UltimateVoidstrike',
    })
  })
})
