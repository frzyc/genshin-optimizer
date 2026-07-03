import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  ownBuff.formula.standardDmg.add(
    sum(own.formula.standardDmgBase, own.final.flat_dmg)
  ),
  ownBuff.formula.standardDmg.add(own.dmg.crit_mult_),
  // Reread to flatten the formula
  ownBuff.formula.standardDmg.reread(ownBuff.dmg.shared),
  ownBuff.formula.standardDmg.add(own.dmg.def_mult_),

  ownBuff.formula.sheerDmg.add(own.formula.sheerDmgBase),
  ownBuff.formula.sheerDmg.add(own.dmg.crit_mult_),
  // Reread to flatten the formula
  ownBuff.formula.sheerDmg.reread(ownBuff.dmg.shared),
  ownBuff.formula.sheerDmg.add(own.dmg.sheer_mult_),

  ownBuff.formula.anomalyDmg.add(
    sum(
      prod(own.formula.anomalyDmgBase, own.dmg.anom_base_mult_),
      own.final.anom_flat_dmg
    )
  ),
  ownBuff.formula.anomalyDmg.add(own.dmg.anomaly_crit_mult_),
  // Reread to flatten the formula
  ownBuff.formula.anomalyDmg.reread(own.dmg.shared),
  ownBuff.formula.anomalyDmg.add(own.dmg.def_mult_),
  // AP Multiplier
  ownBuff.formula.anomalyDmg.add(prod(own.final.anomProf, 0.01)),
  // Anomaly Level Multiplier
  // 1 + 1/59 * (level - 1)
  ownBuff.formula.anomalyDmg.add(sum(1, prod(1 / 59, sum(own.char.lvl, -1)))),

  ownBuff.formula.shield.add(
    prod(own.formula.shieldBase, sum(percent(1), own.final.shield_))
  ),

  ownBuff.formula.heal.add(own.formula.healBase),
]
export default data
