import { prod, sum } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, percent, self } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  self.formula.dmg.add(
    prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg)
  ),
  self.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  self.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.premod.heal_))
  ),
]
export default data
