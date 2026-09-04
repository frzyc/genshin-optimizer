import {
  formulaCatalog,
  formulas,
  STAT_SHEET,
} from '@genshin-optimizer/zzz/formula'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { tagFieldSubset } from './char/tagFieldMap'
import { TagDisplay } from './components/TagDisplay'
import { TagLabel } from './components/TagLabel'
import { TagTitle } from './components/TagTitle'

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

describe('TagTitle', () => {
  it('uses CharBase title for anomaly inst formulas', () => {
    const tag = formulas.Anby.anomalyDmgInst.tag
    expect(tagFieldSubset(tag)[0]?.title).toBeDefined()
    const { container } = render(<TagTitle tag={tag} />)
    expect(container.textContent).toContain('Anomaly')
    expect(container.textContent).not.toBe('anomalyDmg')
  })

  it('titles ability tags from the tag, not the formula name', () => {
    const tag =
      formulaCatalog.Soldier0Anby.UltimateVoidstrike_aftershock0.dims
        .standardDmg
    const { container } = render(<TagTitle tag={tag} />)
    expect(container.textContent).toBe('UltimateVoidstrike')
  })

  it('qualifies dmg_ with the live listing attribute', () => {
    const live = {
      ...formulaCatalog[STAT_SHEET]!.dmg_.dims.final!,
      attribute: 'electric' as const,
    }
    const { container } = render(<TagTitle tag={live} />)
    expect(container.textContent).toContain('Electric DMG Bonus')
  })
})

describe('TagDisplay', () => {
  it('uses CharBase title for inst formula tags', () => {
    const tag = formulas.Anby.anomalyDmgInst.tag
    const { container } = render(<TagDisplay tag={tag} />)
    expect(container.textContent).toContain('Anomaly')
    expect(container.textContent).not.toBe('anomalyDmg')
  })
})

describe('TagLabel', () => {
  it('falls back to ability-dim labels for named formulas without sheet title', () => {
    const { container } = render(<TagLabel tag={m6RuntimeTag()} />)
    expect(container.textContent?.trim().length).toBeGreaterThan(0)
    expect(container.textContent).not.toBe('standardDmg')
    expect(container.textContent).toContain('DMG')
  })
})
