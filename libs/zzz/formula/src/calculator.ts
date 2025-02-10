import type { PartialMeta as PartialMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import type { Dst, Member, Sheet, Src } from './data/util'
import { tagStr } from './data/util'

export type PartialMeta = PartialMetaBase<Src, Dst, Sheet>

export class Calculator extends Base<Src, Dst, Member, Sheet> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(this, tagStr)
  }
}
