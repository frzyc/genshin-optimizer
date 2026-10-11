import { enemy, own, toTag } from '@genshin-optimizer/zzz/formula'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { TagLabel } from './components/TagLabel'
import { statKeyFromListingTag } from './listingStatLabels'
import { getTagLabel } from './tagLabel'

describe('crit_ opt target label resolution', () => {
  const listingTag = own.final.crit_.tag
  const targetResolved = toTag({
    sheet: 'stat',
    name: 'crit_',
    dim: 'final',
  })!

  it('maps final crit listing tags to crit_ for display keys', () => {
    expect(statKeyFromListingTag(listingTag)).toBe('crit_')
    expect(getTagLabel(listingTag)).toBe('crit_')
    expect(getTagLabel(targetResolved)).toBe('crit_')
  })

  it('renders CRIT Rate via TagLabel', () => {
    const { container: listing } = render(<TagLabel tag={listingTag} />)
    expect(listing.textContent).toContain('CRIT Rate')
    expect(listing.textContent).not.toContain('cappedCrit_')

    const { container: target } = render(<TagLabel tag={targetResolved} />)
    expect(target.textContent).toContain('CRIT Rate')
    expect(target.textContent).not.toContain('cappedCrit_')
  })

  it('rejects legacy cappedCrit_ opt targets after migration', () => {
    expect(
      toTag({ sheet: 'stat', name: 'cappedCrit_', dim: 'common' })
    ).toBeUndefined()
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

  it('renders CRIT Rate via TagLabel', () => {
    const { container } = render(<TagLabel tag={charBaseTag} />)
    expect(container.textContent).toContain('CRIT Rate')
    expect(container.textContent).not.toContain('cappedCrit_')
  })
})

describe('attributed stat label resolution', () => {
  it('uses statKeyTextMap for attributed dmg_', () => {
    const tag = { ...own.final.dmg_.tag, attribute: 'fire' as const }
    expect(getTagLabel(tag)).toBe('fire_dmg_')
    const { container } = render(<TagLabel tag={tag} />)
    expect(container.textContent).toContain('Fire DMG Bonus')
    expect(container.textContent).not.toContain('fire_dmg_')
  })

  it('renders attributed base stats such as electric DEF', () => {
    const tag = {
      et: 'own' as const,
      qt: 'formula' as const,
      q: 'electric_def',
    }
    expect(getTagLabel(tag)).toBe('electric_def')
    const { container } = render(<TagLabel tag={tag} />)
    expect(container.textContent).toContain('Electric')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).not.toContain('electric_def')
  })

  it('renders attributed final DEF with qt prefix', () => {
    const tag = {
      ...own.final.def.tag,
      attribute: 'electric' as const,
    }
    expect(getTagLabel(tag)).toBe('electric_def')
    const { container } = render(<TagLabel tag={tag} />)
    expect(container.textContent).toContain('Final')
    expect(container.textContent).toContain('Electric')
    expect(container.textContent).toContain('DEF')
    expect(container.textContent).not.toContain('electric_def')
  })

  it('qualifies mapped dmg_mult_ with attribute when the composite key is absent', () => {
    const tag = {
      ...own.dmg.dmg_mult_.tag,
      attribute: 'electric' as const,
      damageType2: 'aftershock' as const,
    }
    expect(getTagLabel(tag)).toBe('dmg_mult_')
    const { container } = render(<TagLabel tag={tag} />)
    expect(container.textContent).toContain(
      'Electric Aftershock DMG Multiplier'
    )
    expect(container.textContent).not.toContain('electric_dmg_mult_')
    expect(container.querySelector('svg')).toBeTruthy()
  })
})

describe('staged hp/atk/def labels', () => {
  it('maps own.final.atk to final_atk', () => {
    expect(getTagLabel(own.final.atk.tag)).toBe('final_atk')
    const { container } = render(<TagLabel tag={own.final.atk.tag} />)
    expect(container.textContent).toContain('Final ATK')
  })
})

describe('formula-tree identity query labels', () => {
  it('maps lvl identity reads onto existing display keys', () => {
    expect(getTagLabel(own.char.lvl.tag)).toBe('char_lvl')
    expect(getTagLabel(own.wengine.lvl.tag)).toBe('wengine_lvl')
    expect(getTagLabel(enemy.common.lvl.tag)).toBe('common_lvl')
    expect(getTagLabel(own.wengine.phase.tag)).toBe('phase')
    expect(getTagLabel(own.wengine.modification.tag)).toBe('modification')
  })

  it('renders Character Level for own.char.lvl', () => {
    const { container } = render(<TagLabel tag={own.char.lvl.tag} />)
    expect(container.textContent).toContain('Character Level')
  })

  it('renders W-Engine Level for own.wengine.lvl', () => {
    const { container } = render(<TagLabel tag={own.wengine.lvl.tag} />)
    expect(container.textContent).toContain('W-Engine Level')
  })

  it('renders Enemy Level for enemy.common.lvl', () => {
    const { container } = render(<TagLabel tag={enemy.common.lvl.tag} />)
    expect(container.textContent).toContain('Enemy Level')
  })
})
