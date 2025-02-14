import type { PartialMeta as PartialMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import { allLightConeKeys, allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import {
  tagStr,
  type Dst,
  type Member,
  type Sheet,
  type Src,
} from './data/util'

export type PartialMeta = PartialMetaBase<Src, Dst, Sheet>

export class Calculator extends Base<Src, Dst, Member, Sheet> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allLightConeKeys, ...allRelicSetKeys])
    )
  }
}
