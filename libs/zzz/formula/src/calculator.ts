import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type {
  CalcMeta as CalcMetaBase,
  Read as ReadBase,
} from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import { allDiscSetKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import type { Read, Tag } from './data/util'
import { enemyTag, ownTag, tagStr } from './data/util'

export type CalcMeta = CalcMetaBase<Tag, never>

export class Calculator extends Base<Tag, never> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allWengineKeys, ...allDiscSetKeys])
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
  // TODO: Remove me once we figure out what to do with character sheet listing explosion
  override listFormulas(read: ReadBase<Tag>): ReadBase<Tag>[] {
    return super
      .listFormulas(read)
      .filter(
        (r) =>
          shouldShowDevComponents ||
          r.tag.qt !== 'formula' ||
          [
            'standardDmgInst',
            'anomalyDmgInst',
            'anomalyBuildupInst',
            'dazeInst',
          ].includes(r.tag.name ?? '')
      )
  }
}
