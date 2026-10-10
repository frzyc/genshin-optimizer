import { describe, expect, it } from 'vitest'
import { charCondI18nCandidates } from './charCondI18n'

describe('charCondI18nCandidates', () => {
  it('maps Kaeya CryoC1 to enemyAffected.cryo', () => {
    expect(charCondI18nCandidates('Kaeya', 'CryoC1')).toEqual(
      expect.arrayContaining([{ ns: 'sheet', key: 'enemyAffected.cryo' }])
    )
  })

  it('maps Amber C6 to char overlay key', () => {
    expect(charCondI18nCandidates('Amber', 'C6')).toEqual(
      expect.arrayContaining([{ ns: 'char_Amber', key: 'c6CondName' }])
    )
  })
})
