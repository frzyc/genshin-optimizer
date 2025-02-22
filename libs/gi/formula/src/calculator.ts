import type { PartialMeta as PartialMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { allArtifactSetKeys, allWeaponKeys } from '@genshin-optimizer/gi/consts'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import type { Dst, Member, Sheet, Src } from './data/util'
import { tagStr } from './data/util'

type Op = 'const' | 'sum' | 'prod' | 'min' | 'max' | 'sumfrac' | 'res'
export type PartialMeta = PartialMetaBase<Src, Dst, Sheet, Op>

export class Calculator extends Base<Src, Dst, Member, Sheet, Op> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allWeaponKeys, ...allArtifactSetKeys])
    )
  }
}
