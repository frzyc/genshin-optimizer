import { lookup, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { allStats } from '@genshin-optimizer/sr/stats'
import type { ElementalType, TagMapNodeEntries } from '../util'
import { percent, self, selfBuff } from '../util'

const breakBaseRatios: Record<ElementalType, number> = {
  physical: 2,
  fire: 2,
  ice: 1,
  lightning: 1,
  wind: 1.5,
  quantum: 0.5,
  imaginary: 0.5,
}
const data: TagMapNodeEntries = [
  // Formula calculations
  selfBuff.formula.dmg.add(
    prod(self.dmg.out, self.dmg.critMulti, self.dmg.inDmg)
  ),
  selfBuff.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  selfBuff.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.final.heal_))
  ),
  selfBuff.formula.breakDmg.add(
    prod(
      self.formula.base,
      lookup(self.char.ele, breakBaseRatios),
      subscript(self.char.lvl, allStats.misc.breakLevelMulti),
      sum(percent(1), self.final.brEff_),
      self.dmg.inDmg
    )
  ),
]
export default data
