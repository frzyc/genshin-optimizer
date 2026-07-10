import type { Tag } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import {
  abilityDisplayNameString,
  resolveAbilityDisplay,
} from './abilityFormulaLabels'

const anbyTurboVoltHit3: Tag = {
  et: 'own',
  qt: 'formula',
  q: 'standardDmg',
  sheet: 'Anby',
  attribute: 'electric',
  damageType1: 'basic',
  skillType: 'basicSkill',
  name: 'BasicAttackTurboVolt_3',
}

const s0AnbyAftershockUlt: Tag = {
  et: 'own',
  qt: 'formula',
  q: 'standardDmg',
  sheet: 'Soldier0Anby',
  attribute: 'electric',
  damageType1: 'ult',
  damageType2: 'aftershock',
  skillType: 'chainSkill',
  name: 'UltimateVoidstrike_aftershock0',
}

describe('resolveAbilityDisplay', () => {
  it('ignores skillHint when tag.skillType is already set', () => {
    expect(resolveAbilityDisplay(anbyTurboVoltHit3, 'chain')?.skill).toBe(
      'basic'
    )
  })
})

describe('abilityDisplayNameString', () => {
  it('uses hit-specific param labels for multi-hit abilities', () => {
    const hitLabel = abilityDisplayNameString('Anby', anbyTurboVoltHit3)
    const baseLabel = abilityDisplayNameString('Anby', {
      ...anbyTurboVoltHit3,
      name: 'BasicAttackTurboVolt',
    })
    expect(hitLabel).toMatch(/DMG$/)
    expect(baseLabel).toBe('BasicAttackTurboVolt DMG')
    expect(hitLabel).not.toBe(baseLabel)
  })

  it('shows the parent ability name for aftershock suffix hits, not the raw meta name', () => {
    expect(abilityDisplayNameString('Soldier0Anby', s0AnbyAftershockUlt)).toBe(
      'UltimateVoidstrike DMG'
    )
    expect(
      abilityDisplayNameString('Soldier0Anby', s0AnbyAftershockUlt)
    ).not.toContain('_aftershock')
  })
})
