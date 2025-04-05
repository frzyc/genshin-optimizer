import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Attacker Daze Multiplier
  ownBuff.formula.daze_mult_.add(
    sum(percent(1), own.final.dazeInc_, prod(-1, own.final.dazeRed_))
  ),
  // Enemy Daze Resistance Multiplier
  ownBuff.formula.enemyDazeRes_mult_.add(
    sum(percent(1), prod(-1, enemy.common.dazeRes_))
  ),
  // Enemy Daze Taken Multiplier
  ownBuff.formula.enemyDazeTaken_mult_.add(
    sum(percent(1), enemy.common.dazeInc_, prod(-1, enemy.common.dazeRed_))
  ),

  // Daze buildup
  ownBuff.formula.dazeBuildup.add(
    prod(
      own.formula.base,
      own.final.impact,
      own.formula.daze_mult_,
      own.formula.enemyDazeRes_mult_,
      own.formula.enemyDazeTaken_mult_
    )
  ),
]

export default data
