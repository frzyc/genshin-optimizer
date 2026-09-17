import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { describe, expect, it, vi } from 'vitest'
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

const s0AnbyUltHit0: Tag = {
  ...s0AnbyAftershockUlt,
  damageType2: undefined,
  name: 'UltimateVoidstrike_0',
}

function mockBlankUltimateVoidstrikeParam() {
  return vi.spyOn(i18n, 't').mockImplementation((key, opts) => {
    if (
      typeof key === 'string' &&
      key === 'chain.UltimateVoidstrike.params.0'
    ) {
      return ' '
    }
    const options = opts as { defaultValue?: string } | undefined
    return options?.defaultValue ?? key
  })
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

  it('falls back to ability name when hit param text is blank', () => {
    mockBlankUltimateVoidstrikeParam()

    expect(abilityDisplayNameString('Soldier0Anby', s0AnbyUltHit0)).toBe(
      'UltimateVoidstrike DMG'
    )

    vi.restoreAllMocks()
  })

  it('falls back to abilityKey when ability name is not translated', () => {
    expect(
      abilityDisplayNameString('Anby', {
        ...anbyTurboVoltHit3,
        name: 'UnknownAbilityName',
      })
    ).toBe('UnknownAbilityName DMG')
  })
})
