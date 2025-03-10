import type { CalcMeta as CalcMetaBase } from '@genshin-optimizer/game-opt/engine'
import { Calculator as Base } from '@genshin-optimizer/game-opt/engine'
import { createFilterDebug } from '@genshin-optimizer/game-opt/formula'
import { allArtifactSetKeys, allWeaponKeys } from '@genshin-optimizer/gi/consts'
import { DebugCalculator } from '@genshin-optimizer/pando/engine'
import type { Tag } from './data/util'
import { tagStr } from './data/util'

export type CalcMeta = CalcMetaBase<Tag, 'res'>

export class Calculator extends Base<Tag, 'res'> {
  override toDebug(): DebugCalculator {
    return new DebugCalculator(
      this,
      tagStr,
      createFilterDebug([...allWeaponKeys, ...allArtifactSetKeys])
    )
  }
}
