import { describe, expect, it } from 'vitest'
import { statKeyFromListingTag } from './listingStatLabels'

describe('statKeyFromListingTag', () => {
  it('maps capped crit listing tags to stat highlight keys', () => {
    expect(statKeyFromListingTag({ q: 'cappedCrit_', qt: 'final' })).toBe(
      'crit_'
    )
    expect(statKeyFromListingTag({ q: 'anom_cappedCrit_', qt: 'final' })).toBe(
      'anom_crit_'
    )
  })

  it('returns empty string for named formula hits', () => {
    expect(
      statKeyFromListingTag({
        sheet: 'Anby',
        name: 'Hit_0',
        q: 'standardDmg',
        qt: 'formula',
      })
    ).toBe('')
  })

  it('uses attribute prefix for elemental stat rows', () => {
    expect(
      statKeyFromListingTag({
        q: 'atk_',
        qt: 'final',
        attribute: 'atk',
      })
    ).toBe('atk_atk_')
  })
})
