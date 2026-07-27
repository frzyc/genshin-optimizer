import type { Tag } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { partitionBundlableTags } from './bundledFormulaGrouping'

function partTagKeys(
  parts: ReturnType<typeof partitionBundlableTags>
): string[] {
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

describe('partitionBundlableTags', () => {
  it('orders partial bundles by ability dim regardless of input order', () => {
    const tags = [
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
    ]
    const reversed = [...tags].reverse()

    const expected = ['HitA_0:standardDmg', 'HitA_0:dazeBuildup']
    expect(partTagKeys(partitionBundlableTags(tags))).toEqual(expected)
    expect(partTagKeys(partitionBundlableTags(reversed))).toEqual(expected)
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
    expect(partTagKeys(partitionBundlableTags(tags))).toEqual(expected)
    expect(partTagKeys(partitionBundlableTags(shuffled))).toEqual(expected)
  })

  it('bundles complete dmg/daze/anom sets', () => {
    const tags = [
      anbyTag('HitA_0', 'anomBuildup'),
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
    ]
    expect(partTagKeys(partitionBundlableTags(tags))).toEqual(['HitA_0:bundle'])
  })

  it('keeps dual dmg dims as separate rows instead of bundling', () => {
    const tags = [
      anbyTag('HitA_0', 'anomBuildup'),
      anbyTag('HitA_0', 'dazeBuildup'),
      anbyTag('HitA_0', 'standardDmg'),
      anbyTag('HitA_0', 'sheerDmg'),
    ]
    expect(partTagKeys(partitionBundlableTags(tags))).toEqual([
      'HitA_0:standardDmg',
      'HitA_0:sheerDmg',
      'HitA_0:dazeBuildup',
      'HitA_0:anomBuildup',
    ])
  })
})
