import { lookup, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allStats } from '@genshin-optimizer/sr/stats'
import type { TagMapNodeEntries } from '../util'
import { enemy, percent, self } from '../util'

const breakBaseRatios = {
  Physical: 2,
  Fire: 2,
  Ice: 1,
  Lightning: 1,
  Wind: 1.5,
  Quantum: 0.5,
  Imaginary: 0.5,
}
const data: TagMapNodeEntries = [
  // Formula calculations
  self.formula.dmg.add(
    prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg)
  ),
  self.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  self.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.final.heal_))
  ),
  self.formula.breakDmg.add(
    prod(
      self.formula.base,
      lookup(self.char.ele, breakBaseRatios),
      subscript(self.char.lvl, allStats.misc.breakLevelMulti),
      sum(1, self.final.brEff_),
      enemy.common.inDmg
    )
  ),
]
export default data
