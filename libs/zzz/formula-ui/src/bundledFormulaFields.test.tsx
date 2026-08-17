import { render } from '@testing-library/react'
import { formulas } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { TagFallbackLabel } from './components/TagFallbackLabel'

const m6RuntimeTag = () => ({
  ...formulas.Soldier0Anby.m6_additional_dmg.tag,
  src: 'Soldier0Anby',
  preset: 'preset0',
})

describe('tagFieldSubset', () => {
  it('matches authored sheet fields when listing tags include calc context', () => {
    const tag = m6RuntimeTag()
    expect(tagFieldSubset(tag)[0]?.fieldRef.name).toBe('m6_additional_dmg')
    expect(tagFieldSubset(tag)[0]?.title).toBeDefined()
  })
})

describe('TagFallbackLabel', () => {
  it('falls back to ability-dim labels for named formulas without sheet title', () => {
    const { container } = render(<TagFallbackLabel tag={m6RuntimeTag()} />)
    expect(container.textContent?.trim().length).toBeGreaterThan(0)
    expect(container.textContent).not.toBe('standardDmg')
    expect(container.textContent).toContain('DMG')
  })
})
