import { prod, sum } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { enemy, percent, self, selfBuff } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  selfBuff.formula.dmg.add(
    prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg)
  ),
  selfBuff.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  selfBuff.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.premod.heal_))
  ),
]
export default data
