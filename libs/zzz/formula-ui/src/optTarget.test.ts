import { read as tagRead } from '@genshin-optimizer/pando/engine'
import { listingId } from '@genshin-optimizer/zzz/formula'
import { resolveTargetTag } from '@genshin-optimizer/zzz/db'
import { describe, expect, it } from 'vitest'
import {
  formulaReadForTag,
  isOptTargetTag,
  mergeTagForOpt,
  statKeyFromListingTag,
} from './optTarget'

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

  it('matches Trigger aftershock abilities via targetTag without persisted damage types', () => {
    const persisted = {
      sheet: 'Trigger',
      name: 'BasicAttackHarmonizingShot_0',
      q: 'standardDmg',
    }
    const resolved = resolveTargetTag(persisted)!
    expect(resolved.damageType2).toBe('aftershock')
    expect(isOptTargetTag(resolved, persisted)).toBe(true)
  })

  it('distinguishes S0 Anby normal and aftershock sibling opt targets', () => {
    const normal = {
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_0',
      q: 'standardDmg',
    }
    const aftershock = {
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_aftershock0',
      q: 'standardDmg',
    }

    expect(isOptTargetTag(resolveTargetTag(normal)!, normal)).toBe(true)
    expect(isOptTargetTag(resolveTargetTag(aftershock)!, aftershock)).toBe(true)
    expect(isOptTargetTag(resolveTargetTag(aftershock)!, normal)).toBe(false)
    expect(isOptTargetTag(resolveTargetTag(normal)!, aftershock)).toBe(false)
  })

  it('highlights the whole hit when aftershock shares name with normal row', () => {
    const persisted = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
    }
    const normalRow = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    const aftershockRow = { ...normalRow, damageType2: 'aftershock' as const }

    expect(isOptTargetTag(normalRow, persisted, normalRow)).toBe(true)
    expect(isOptTargetTag(aftershockRow, persisted, normalRow)).toBe(true)
  })

  it('requires damage types for generic inst targets', () => {
    const target = {
      name: 'standardDmgInst',
      q: 'standardDmg',
      sheet: 'Anby',
      damageType1: 'basic',
      damageType2: 'aftershock',
    }
    const resolved = resolveTargetTag(target)!
    const wrongDmg = { ...resolved, damageType1: 'ult' as const }

    expect(isOptTargetTag(resolved, target)).toBe(true)
    expect(isOptTargetTag(wrongDmg, target, resolved)).toBe(false)
  })
})

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

describe('mergeTagForOpt', () => {
  it('applies persisted inst damage types only for generic inst opt targets', () => {
    const rowTag = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    const optTarget = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      damageType1: 'ult' as const,
      damageType2: 'aftershock' as const,
    }
    const resolvedInst = resolveTargetTag(optTarget)!

    const merged = mergeTagForOpt(rowTag, resolvedInst, optTarget)
    expect(merged.damageType1).toBe('ult')
    expect(merged.damageType2).toBe('aftershock')
  })

  it('does not apply inst damage-type overrides to non-inst rows', () => {
    const rowTag = {
      sheet: 'Trigger',
      name: 'BasicAttackHarmonizingShot_0',
      q: 'standardDmg',
      damageType2: 'aftershock' as const,
      qt: 'formula' as const,
    }
    const instTarget = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      damageType1: 'ult' as const,
      damageType2: 'aftershock' as const,
    }
    const resolvedInst = resolveTargetTag(instTarget)!

    expect(mergeTagForOpt(rowTag, resolvedInst, instTarget)).toEqual(rowTag)
  })

  it('does not merge generic inst rows from a different sheet', () => {
    const rowTag = {
      sheet: 'Sigrid',
      name: 'standardDmgInst',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    const optTarget = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      damageType1: 'ult' as const,
    }
    const resolvedInst = resolveTargetTag(optTarget)!

    expect(mergeTagForOpt(rowTag, resolvedInst, optTarget)).toEqual(rowTag)
  })

  it('does not merge generic inst when target sheet is unknown', () => {
    const rowTag = {
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    const resolvedInst = {
      ...rowTag,
      damageType1: 'ult' as const,
    }
    const optTarget = {
      name: 'standardDmgInst',
      q: 'standardDmg',
    }

    expect(mergeTagForOpt(rowTag, resolvedInst, optTarget)).toEqual(rowTag)
  })

  it('does not merge rows from a different aftershock bundle group', () => {
    const normalRow = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    const aftershockRow = { ...normalRow, damageType2: 'aftershock' as const }
    const optTarget = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
    }

    expect(mergeTagForOpt(aftershockRow, normalRow, optTarget)).toEqual(
      aftershockRow
    )
  })
})

describe('formulaReadForTag', () => {
  it('returns undefined for named formulas without a listing read map', () => {
    const tag = {
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      q: 'standardDmg',
      qt: 'formula' as const,
    }
    expect(formulaReadForTag(tag)).toBeUndefined()
  })

  it('falls back to a tag read for stat rows when no listing map is passed', () => {
    const tag = { q: 'atk', qt: 'final' as const, attribute: 'atk' as const }
    const result = formulaReadForTag(tag)!
    expect(result.tag).toEqual(tag)
    expect(result).not.toBe(tagRead(tag))
  })

  it('merges tags on plain pando reads without withTag', () => {
    const tag = { sheet: 'Alice', q: 'atk', qt: 'final' as const }
    const plainRead = tagRead(tag)
    const merged = { ...tag, attribute: 'atk' as const }
    const readByListingKey = new Map([[listingId(merged), plainRead as never]])
    const result = formulaReadForTag(merged, readByListingKey)!
    expect(result.tag).toEqual(merged)
    expect(typeof (result as { withTag?: unknown }).withTag).toBe('undefined')
  })
})
