import { targetTag } from '@genshin-optimizer/zzz/db'
import { own } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { statKeyFromListingTag } from './optTarget'
import { getTagLabel } from './tagLabel'

describe('cappedCrit label resolution', () => {
  const listingTag = own.common.cappedCrit_.tag
  const targetResolved = targetTag({ q: 'cappedCrit_', qt: 'common' })

  it('maps capped crit tags to crit_ for display', () => {
    expect(statKeyFromListingTag(listingTag)).toBe('crit_')
    expect(getTagLabel(listingTag)).toBe('crit_')
    expect(getTagLabel(targetResolved)).toBe('crit_')
  })

  it('finds CharBase title via tagFieldSubset', () => {
    expect(tagFieldSubset(listingTag)[0]?.title).toBeDefined()
    expect(tagFieldSubset(targetResolved)[0]?.title).toBeDefined()
  })
})
