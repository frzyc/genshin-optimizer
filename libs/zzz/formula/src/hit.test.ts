import { describe, expect, it } from 'vitest'
import { stripCalcContextTag } from './hit'

describe('stripCalcContextTag', () => {
  it('removes calc runtime keys before listing lookup', () => {
    const tag = {
      sheet: 'Soldier0Anby',
      name: 'm6_additional_dmg',
      q: 'standardDmg',
      qt: 'formula' as const,
      src: 'Soldier0Anby',
      preset: 'preset0',
    }
    expect(stripCalcContextTag(tag)).toEqual({
      sheet: 'Soldier0Anby',
      name: 'm6_additional_dmg',
      q: 'standardDmg',
      qt: 'formula',
    })
  })
})
