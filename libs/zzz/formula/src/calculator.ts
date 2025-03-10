import type { CalcMeta as CalcMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import { allDiscSetKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from './data/util'
import { tagStr } from './data/util'

export type CalcMeta = CalcMetaBase<Tag, never>

export class Calculator extends Base<Tag, never> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allWengineKeys, ...allDiscSetKeys])
    )
  }
}
