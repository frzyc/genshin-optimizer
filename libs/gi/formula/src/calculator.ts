import type { CalcMeta as CalcMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { allArtifactSetKeys, allWeaponKeys } from '@genshin-optimizer/gi/consts'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import type { Read, Tag } from './data/util'
import { enemyTag, ownTag, tagStr } from './data/util'

export type CalcMeta = CalcMetaBase<Tag, 'res'>

export class Calculator extends Base<Tag, 'res'> {
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
        // everything else should provide explicit `accu`
        if (qt === 'common' && q === 'count') return 'sum'
        throw new Error('non-explicit team value accumulator')
    }
    return
  }
}
