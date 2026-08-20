import { resolveTargetTag } from '@genshin-optimizer/zzz/db'
import { own } from '@genshin-optimizer/zzz/formula'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { TagFallbackLabel } from './components/TagFallbackLabel'
import { statKeyFromListingTag } from './optTarget'
import { getTagLabel } from './tagLabel'

describe('crit_ opt target label resolution', () => {
  const listingTag = own.final.crit_.tag
  const targetResolved = resolveTargetTag({ q: 'crit_', qt: 'final' })!

  it('maps final crit listing tags to crit_ for display keys', () => {
    expect(statKeyFromListingTag(listingTag)).toBe('crit_')
    expect(getTagLabel(listingTag)).toBe('crit_')
    expect(getTagLabel(targetResolved)).toBe('crit_')
  })

  it('renders CRIT Rate via TagFallbackLabel', () => {
    const { container: listing } = render(<TagFallbackLabel tag={listingTag} />)
    expect(listing.textContent).toContain('CRIT Rate')
    expect(listing.textContent).not.toContain('cappedCrit_')

    const { container: target } = render(
      <TagFallbackLabel tag={targetResolved} />
    )
    expect(target.textContent).toContain('CRIT Rate')
    expect(target.textContent).not.toContain('cappedCrit_')
  })

  it('rejects legacy cappedCrit_ opt targets after migration', () => {
    expect(resolveTargetTag({ q: 'cappedCrit_', qt: 'common' })).toBeUndefined()
  })
})

describe('cappedCrit CharBase display labels', () => {
  const charBaseTag = own.common.cappedCrit_.tag

  it('maps capped crit tags to crit_ for display keys', () => {
    expect(statKeyFromListingTag(charBaseTag)).toBe('crit_')
    expect(getTagLabel(charBaseTag)).toBe('crit_')
  })

  it('maps CharBase field for capped crit tags', () => {
    expect(tagFieldSubset(charBaseTag)[0]?.fieldRef).toMatchObject({
      q: 'cappedCrit_',
      qt: 'common',
    })
  })

  it('renders CRIT Rate via TagFallbackLabel', () => {
    const { container } = render(<TagFallbackLabel tag={charBaseTag} />)
    expect(container.textContent).toContain('CRIT Rate')
    expect(container.textContent).not.toContain('cappedCrit_')
  })
})

describe('attributed stat label resolution', () => {
  it('preserves generic dmg_ labelMap for attributed tags', () => {
    const tag = { ...own.final.dmg_.tag, attribute: 'fire' as const }
    const { container } = render(<TagFallbackLabel tag={tag} />)
    expect(container.textContent).toContain('Fire')
    expect(container.textContent).toContain('DMG')
    expect(container.textContent).not.toContain('fire_dmg_')
  })

  it('renders attributed base stats such as electric DEF', () => {
    const tag = {
      et: 'own' as const,
      qt: 'formula' as const,
      q: 'electric_def',
    }
    const { container } = render(<TagFallbackLabel tag={tag} />)
    expect(container.textContent).toContain('Electric')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).not.toContain('electric_def')
  })

  it('renders attributed final DEF with qt prefix', () => {
    const tag = {
      ...own.final.def.tag,
      attribute: 'electric' as const,
    }
    const { container } = render(<TagFallbackLabel tag={tag} />)
    expect(container.textContent).toContain('Final')
    expect(container.textContent).toContain('Electric')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).not.toContain('electric_def')
  })
})
