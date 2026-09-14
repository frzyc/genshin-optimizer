import { describe, expect, it } from 'vitest'
import {
  humanizeWeaponCondName,
  weaponCondI18nCandidates,
} from './weaponCondI18n'

describe('weaponCondI18nCandidates', () => {
  it('maps Homa RecklessCinnabar to shared sheet HP text', () => {
    expect(
      weaponCondI18nCandidates('StaffOfHoma', 'RecklessCinnabar')[0]
    ).toEqual({
      ns: 'sheet',
      key: 'lessPercentHP',
      values: { percent: 50 },
    })
  })

  it('maps afterSkill toggles to shared sheet text', () => {
    expect(
      weaponCondI18nCandidates('FootprintOfTheRainbow', 'afterSkill')
    ).toContainEqual({
      ns: 'sheet',
      key: 'afterUse.skill',
    })
  })

  it('uses gen passiveName for generic passive conds', () => {
    expect(weaponCondI18nCandidates('SapwoodBlade', 'passive')[1]).toEqual({
      ns: 'weapon_SapwoodBlade_gen',
      key: 'passiveName',
    })
  })
})

describe('humanizeWeaponCondName', () => {
  it('splits camelCase formula keys', () => {
    expect(humanizeWeaponCondName('RecklessCinnabar')).toBe('Reckless Cinnabar')
  })
})
