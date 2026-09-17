import { read as tagRead } from '@genshin-optimizer/pando/engine'
import { targetTag } from '@genshin-optimizer/zzz/db'
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
    const resolved = targetTag(persisted)
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

    expect(isOptTargetTag(targetTag(normal), normal)).toBe(true)
    expect(isOptTargetTag(targetTag(aftershock), aftershock)).toBe(true)
    expect(isOptTargetTag(targetTag(aftershock), normal)).toBe(false)
    expect(isOptTargetTag(targetTag(normal), aftershock)).toBe(false)
  })

  it('does not match aftershock vs normal rows that share name and q', () => {
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
    expect(isOptTargetTag(aftershockRow, persisted, normalRow)).toBe(false)
  })

  it('requires damage types for generic inst targets', () => {
    const target = {
      name: 'standardDmgInst',
      q: 'standardDmg',
      sheet: 'Anby',
      damageType1: 'basic',
      damageType2: 'aftershock',
    }
    const resolved = targetTag(target)
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
    const resolvedInst = targetTag(optTarget)

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
    const resolvedInst = targetTag(instTarget)

    expect(mergeTagForOpt(rowTag, resolvedInst, instTarget)).toBe(rowTag)
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

    expect(mergeTagForOpt(aftershockRow, normalRow, optTarget)).toBe(
      aftershockRow
    )
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
