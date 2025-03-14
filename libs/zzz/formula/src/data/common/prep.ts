import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  ownBuff.formula.standardDmg.add(own.formula.base),
  ownBuff.formula.standardDmg.add(own.dmg.crit_mult_),
  // Reread to flatten the formula
  ownBuff.formula.standardDmg.reread(ownBuff.dmg.shared),

  ownBuff.formula.anomalyDmg.add(own.formula.base),
  // Reread to flatten the formula
  ownBuff.formula.anomalyDmg.reread(own.dmg.shared),
  // AP Multiplier
  ownBuff.formula.anomalyDmg.add(prod(own.final.anomProf, 0.01)),
  // Anomaly Level Multiplier
  // 1 + 1/59 * (level - 1)
  ownBuff.formula.anomalyDmg.add(sum(1, prod(1 / 59, sum(own.char.lvl, -1)))),
  ownBuff.formula.shield.add(
    prod(own.formula.base, sum(percent(1), own.final.shield_)),
  ),
  // ownBuff.formula.heal.add(
  //   prod(own.formula.base, sum(percent(1), own.final.heal_))
  // ),
]
export default data
