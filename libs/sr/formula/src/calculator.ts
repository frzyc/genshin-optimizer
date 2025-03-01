import type { PartialMeta as PartialMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import { allLightConeKeys, allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import type { Tag } from './data/util'
import { tagStr } from './data/util'

export type PartialMeta = PartialMetaBase<Tag>

export class Calculator extends Base<Tag> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allLightConeKeys, ...allRelicSetKeys])
    )
  }
}
