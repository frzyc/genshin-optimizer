import type { Tag } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { abilityDisplayNameString } from './abilityFormulaLabels'

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

describe('abilityDisplayNameString', () => {
  it('shows the parent ability name for aftershock suffix hits, not the raw meta name', () => {
    expect(abilityDisplayNameString('Soldier0Anby', s0AnbyAftershockUlt)).toBe(
      'UltimateVoidstrike DMG'
    )
    expect(
      abilityDisplayNameString('Soldier0Anby', s0AnbyAftershockUlt)
    ).not.toContain('_aftershock')
  })
})
