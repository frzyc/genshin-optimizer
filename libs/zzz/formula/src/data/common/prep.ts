import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  ownBuff.formula.standardDmg.add(
    prod(own.formula.base, own.dmg.critMulti, own.dmg.shared)
  ),
  ownBuff.formula.anomalyDmg.add(
    prod(
      own.formula.base,
      own.dmg.shared,
      // AP Multiplier
      prod(own.final.anomProf, 0.01),
      // Anomaly Level Multiplier
      // 1 + 1/59 * (level - 1)
      sum(1, prod(1 / 59, sum(own.char.lvl, -1)))
    )
  ),
  ownBuff.formula.shield.add(
    prod(own.formula.base, sum(percent(1), own.final.shield_))
  ),
  // ownBuff.formula.heal.add(
  //   prod(own.formula.base, sum(percent(1), own.final.heal_))
  // ),
]
export default data
