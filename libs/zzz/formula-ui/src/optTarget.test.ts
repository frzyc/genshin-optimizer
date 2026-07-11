import { read as tagRead } from '@genshin-optimizer/pando/engine'
import { describe, expect, it } from 'vitest'
import { formulaReadForTag, isOptTargetTag } from './optTarget'

describe('isOptTargetTag', () => {
  it('matches stat-only targets by q/qt/attribute', () => {
    const target = { q: 'atk', qt: 'final' as const }
    expect(isOptTargetTag({ q: 'atk', qt: 'final' }, target)).toBe(true)
    expect(isOptTargetTag({ q: 'atk', qt: 'initial' }, target)).toBe(false)
  })

  it('does not treat named formula targets as stat q/qt matches', () => {
    const target = {
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      q: 'standardDmg',
    }
    const sibling = {
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_1',
      q: 'standardDmg',
    }
    expect(
      isOptTargetTag(sibling, target, {
        sheet: 'Anby',
        name: 'BasicAttackTurboVolt_0',
        q: 'standardDmg',
        qt: 'formula',
      })
    ).toBe(false)
  })
})

describe('formulaReadForTag', () => {
  it('falls back to a tag read when no listing read is passed', () => {
    const tag = {
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      q: 'standardDmg',
    }
    const result = formulaReadForTag(undefined, tag)
    expect(result.tag).toEqual(tag)
    expect(result).not.toBe(tagRead(tag))
  })

  it('merges tags on plain pando reads without withTag', () => {
    const tag = { sheet: 'Alice', q: 'atk', qt: 'final' as const }
    const plainRead = tagRead(tag)
    const merged = { ...tag, attribute: 'atk' as const }
    const result = formulaReadForTag(undefined, merged, plainRead)
    expect(result.tag).toEqual(merged)
    expect(typeof (result as { withTag?: unknown }).withTag).toBe('undefined')
  })
})
