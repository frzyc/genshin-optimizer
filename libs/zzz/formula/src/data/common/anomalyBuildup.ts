import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Anomaly buildup
  ownBuff.formula.anomalyBuildup.add(
    prod(
      own.formula.base,
      prod(own.final.anomMas, 0.01),
      sum(percent(1), own.final.anomBuildup_),
      sum(percent(1), prod(-1, enemy.common.anomBuildupRes_))
    )
  ),
]

export default data
