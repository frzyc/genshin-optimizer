import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // AM Bonus
  ownBuff.formula.anomMas_mult_.add(prod(own.final.anomMas, 0.01)),
  // Anomaly Buildup Bonus Multiplier
  ownBuff.formula.anomBuildup_mult_.add(
    sum(percent(1), own.final.anomBuildup_)
  ),
  // Enemy Anomaly Buildup RES Multiplier
  ownBuff.formula.enemyAnomBuildupRes_mult_.add(
    sum(percent(1), prod(-1, enemy.common.anomBuildupRes_))
  ),

  // Anomaly Buildup Formula
  ownBuff.formula.anomBuildup.add(
    prod(
      own.formula.base,
      own.formula.anomMas_mult_,
      own.formula.anomBuildup_mult_,
      ownBuff.formula.enemyAnomBuildupRes_mult_
    )
  ),
]

export default data
