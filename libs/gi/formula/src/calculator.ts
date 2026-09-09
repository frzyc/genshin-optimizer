import type { CalcMeta as CalcMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { allArtifactSetKeys, allWeaponKeys } from '@genshin-optimizer/gi/consts'
import type { AnyNode, CalcResult } from '@genshin-optimizer/pando/engine'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import type { Read, Tag } from './data/util'
import { enemyTag, ownTag, tagStr } from './data/util'

export type CalcMeta = CalcMetaBase<Tag, 'res'>

function isListingFormulaQ(
  q: string | null | undefined
): q is 'heal' | 'shield' | 'param' {
  return q === 'heal' || q === 'shield' || q === 'param'
}

/** Heal/shield/param listings collapse onto `formula.base`; keep the listing `q`. */
export function preserveListingFormulaQ(
  tag: Tag | undefined,
  inner: Tag | undefined
): Tag | undefined {
  if (
    tag?.qt !== 'formula' ||
    !isListingFormulaQ(tag.q) ||
    inner?.qt !== 'formula' ||
    inner.q !== 'base'
  )
    return inner
  return {
    ...inner,
    q: tag.q,
    ...(tag.name ? { name: tag.name } : {}),
    ...(tag.sheet ? { sheet: tag.sheet } : {}),
  }
}

export class Calculator extends Base<Tag, 'res'> {
  override computeMeta(
    n: AnyNode,
    val: number | string,
    x: (CalcResult<number | string, CalcMeta> | undefined)[],
    br: CalcResult<number | string, CalcMeta>[],
    tag: Tag | undefined
  ): CalcMeta {
    const meta = super.computeMeta(n, val, x, br, tag)
    const restored = preserveListingFormulaQ(tag, meta.tag)
    if (restored === meta.tag) return meta
    return Object.freeze({ ...meta, tag: restored })
  }
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allWeaponKeys, ...allArtifactSetKeys])
    )
  }
  override defaultAccu(tag: Tag): Read['ex'] {
    const { qt, q } = tag
    if (!qt || !q) return
    switch (tag.et) {
      case 'own':
      case 'target':
        return (ownTag as any)[qt]?.[q]?.accu
      case 'enemy':
        return (enemyTag as any)[qt]?.[q]?.accu
      case 'team':
        // Count-like tallies default to sum; everything else needs explicit `accu`
        if (
          qt === 'common' &&
          (q === 'count' || q === 'moonsign' || q === 'hexerei')
        )
          return 'sum'
        throw new Error('non-explicit team value accumulator')
    }
    return
  }
}
