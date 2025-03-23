import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Daze buildup
  ownBuff.formula.dazeBuildup.add(
    prod(
      own.formula.base,
      own.final.impact,
      sum(percent(1), own.final.dazeInc_, prod(-1, own.final.dazeRed_)),
      sum(percent(1), prod(-1, enemy.common.dazeRes_)),
      sum(percent(1), enemy.common.dazeInc_, prod(-1, enemy.common.dazeRed_))
    )
  ),
]

export default data
