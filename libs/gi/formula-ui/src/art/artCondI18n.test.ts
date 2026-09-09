import { describe, expect, it } from 'vitest'
import { artCondI18nCandidates, humanizeArtCondName } from './artCondI18n'

describe('artCondI18nCandidates', () => {
  it('maps Finale formula keys to authored artifact locale keys', () => {
    expect(
      artCondI18nCandidates('FinaleOfTheDeepGalleries', '0EnergyNoBurst')[0]
    ).toEqual({
      ns: 'artifact_FinaleOfTheDeepGalleries',
      key: 'noBurst',
    })
  })

  it('maps stack sliders to shared sheet text', () => {
    expect(artCondI18nCandidates('CrimsonWitchOfFlames', 'stack')[0]).toEqual({
      ns: 'sheet',
      key: 'afterUse.skill',
    })
    expect(artCondI18nCandidates('UnfinishedReverie', 'stacks')[0]).toEqual({
      ns: 'sheet',
      key: 'stacks',
    })
  })

  it('maps state toggles to enemy-affected sheet strings', () => {
    expect(artCondI18nCandidates('Thundersoother', 'state')[0]).toEqual({
      ns: 'sheet',
      key: 'enemyAffected.electro',
    })
  })

  it('maps swirl bools via name pattern', () => {
    expect(artCondI18nCandidates('ViridescentVenerer', 'swirlcryo')[0]).toEqual(
      {
        ns: 'sheet',
        key: 'swirlReaction.cryo',
      }
    )
  })
})

describe('humanizeArtCondName', () => {
  it('splits camelCase formula keys', () => {
    expect(humanizeArtCondName('0EnergyNoBurst')).toBe('0 Energy No Burst')
  })
})
