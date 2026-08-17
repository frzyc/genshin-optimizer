import type { Tag } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import {
  hitId,
  lookupFormulaEntry,
  partitionAbilityHits,
  resolveFormulaSheet,
  stripCalcContextTag,
} from './hit'

function partTagKeys(parts: ReturnType<typeof partitionAbilityHits>): string[] {
  return parts.map((part) => {
    if (part.kind === 'bundle') {
      const tag = part.byQ.get(part.dmgQ)!
      return `${tag.name}:bundle`
    }
    return `${part.tag.name}:${part.tag.q}`
  })
}

const anbyTag = (name: string, q: string): Tag => ({
  et: 'own',
  qt: 'formula',
  sheet: 'Anby',
  name,
  q,
})

describe('partitionAbilityHits', () => {
  it('orders partial bundles by ability dim regardless of input order', () => {
    const tags = [
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
    ]
    const reversed = [...tags].reverse()

    const expected = ['HitA_0:standardDmg', 'HitA_0:dazeBuildup']
    expect(partTagKeys(partitionAbilityHits(tags))).toEqual(expected)
    expect(partTagKeys(partitionAbilityHits(reversed))).toEqual(expected)
  })

  it('orders ability groups by name regardless of input order', () => {
    const tags = [
      anbyTag('HitB_0', 'standardDmg'),
      anbyTag('HitA_0', 'standardDmg'),
      anbyTag('HitA_0', 'dazeBuildup'),
    ]
    const shuffled = [tags[1], tags[2], tags[0]]

    const expected = [
      'HitA_0:standardDmg',
      'HitA_0:dazeBuildup',
      'HitB_0:standardDmg',
    ]
    expect(partTagKeys(partitionAbilityHits(tags))).toEqual(expected)
    expect(partTagKeys(partitionAbilityHits(shuffled))).toEqual(expected)
  })

  it('bundles complete dmg/daze/anom sets', () => {
    const tags = [
      anbyTag('HitA_0', 'anomBuildup'),
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
    ]
    expect(partTagKeys(partitionAbilityHits(tags))).toEqual(['HitA_0:bundle'])
  })

  it('keeps dual dmg dims as separate rows instead of bundling', () => {
    const tags = [
      anbyTag('HitA_0', 'anomBuildup'),
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
      anbyTag('HitA_0', 'sheerDmg'),
    ]
    expect(partTagKeys(partitionAbilityHits(tags))).toEqual([
      'HitA_0:standardDmg',
      'HitA_0:sheerDmg',
      'HitA_0:dazeBuildup',
      'HitA_0:anomBuildup',
    ])
  })

  it('bundles normal and aftershock hits with distinct names separately', () => {
    const tags = [
      anbyTag('HitA_0', 'anomBuildup'),
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
      {
        ...anbyTag('HitA_aftershock0', 'anomBuildup'),
        damageType2: 'aftershock' as const,
      },
      {
        ...anbyTag('HitA_aftershock0', 'dazeBuildup'),
        damageType2: 'aftershock' as const,
      },
      {
        ...anbyTag('HitA_aftershock0', 'standardDmg'),
        damageType2: 'aftershock' as const,
      },
    ]
    expect(partTagKeys(partitionAbilityHits(tags))).toEqual([
      'HitA_0:bundle',
      'HitA_aftershock0:bundle',
    ])
  })
})

describe('hitId', () => {
  it('groups by sheet and name only', () => {
    expect(
      hitId({ sheet: 'Anby', name: 'Hit_0', damageType2: 'aftershock' })
    ).toBe(hitId({ sheet: 'Anby', name: 'Hit_0' }))
    expect(hitId({ sheet: 'Anby', name: 'Hit_0' })).not.toBe(
      hitId({ sheet: 'Anby', name: 'Hit_aftershock0' })
    )
  })
})

describe('stripCalcContextTag', () => {
  it('removes calc runtime keys before listing lookup', () => {
    const tag = {
      sheet: 'Soldier0Anby',
      name: 'm6_additional_dmg',
      q: 'standardDmg',
      qt: 'formula' as const,
      src: 'Soldier0Anby',
      preset: 'preset0',
    }
    expect(stripCalcContextTag(tag)).toEqual({
      sheet: 'Soldier0Anby',
      name: 'm6_additional_dmg',
      q: 'standardDmg',
      qt: 'formula',
    })
  })
})

describe('resolveFormulaSheet', () => {
  it('honors an explicit sheet hint for cross-char formula names', () => {
    expect(
      resolveFormulaSheet({
        sheet: 'Soldier0Anby',
        name: 'm6_additional_dmg',
        q: 'standardDmg',
      })
    ).toBe('Soldier0Anby')
  })

  it('finds unique formula owners without a sheet hint', () => {
    expect(
      resolveFormulaSheet({
        name: 'UltimateVoidstrike_aftershock0',
        q: 'standardDmg',
      })
    ).toBe('Soldier0Anby')
  })

  it('returns undefined when multiple sheets own the same name and q', () => {
    expect(
      resolveFormulaSheet({
        name: 'standardDmgInst',
        q: 'standardDmg',
      })
    ).toBeUndefined()
  })

  it('distinguishes normal and aftershock sibling abilities', () => {
    expect(
      resolveFormulaSheet({
        name: 'UltimateVoidstrike_0',
        q: 'standardDmg',
      })
    ).toBe('Soldier0Anby')
    expect(
      resolveFormulaSheet({
        name: 'UltimateVoidstrike_aftershock0',
        q: 'standardDmg',
      })
    ).toBe('Soldier0Anby')
  })
})

describe('lookupFormulaEntry', () => {
  it('hydrates named non-ability formulas by name and q', () => {
    const entry = lookupFormulaEntry({
      sheet: 'Soldier0Anby',
      name: 'm6_additional_dmg',
      q: 'standardDmg',
    })
    expect(entry?.sheet).toBe('Soldier0Anby')
    expect(entry?.tag).toMatchObject({
      name: 'm6_additional_dmg',
      q: 'standardDmg',
      attribute: 'electric',
      damageType1: 'aftershock',
    })
  })

  it('resolves bundled ability dims from persisted opt-target keys', () => {
    const entry = lookupFormulaEntry({
      sheet: 'Trigger',
      name: 'BasicAttackHarmonizingShot_0',
      q: 'standardDmg',
    })
    expect(entry?.tag.name).toBe('BasicAttackHarmonizingShot_0')
    expect(entry?.tag.q).toBe('standardDmg')
    expect(entry?.tag.skillType).toBe('basicSkill')
  })

  it('requires the correct ability dim for sheer-only hits', () => {
    const sheer = lookupFormulaEntry({
      sheet: 'Yixuan',
      name: 'BasicAttackCirrusStrike_0',
      q: 'sheerDmg',
    })
    const standard = lookupFormulaEntry({
      sheet: 'Yixuan',
      name: 'BasicAttackCirrusStrike_0',
      q: 'standardDmg',
    })
    expect(sheer?.tag.q).toBe('sheerDmg')
    expect(standard).toBeUndefined()
  })

  it('returns distinct entries for aftershock sibling ability names', () => {
    const normal = lookupFormulaEntry({
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_0',
      q: 'standardDmg',
    })
    const aftershock = lookupFormulaEntry({
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_aftershock0',
      q: 'standardDmg',
    })
    expect(normal?.tag.name).toBe('UltimateVoidstrike_0')
    expect(aftershock?.tag.name).toBe('UltimateVoidstrike_aftershock0')
    expect(aftershock?.tag.damageType2).toBe('aftershock')
  })
})
