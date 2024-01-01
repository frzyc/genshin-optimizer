import { prod, sum } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { enemy, percent, self, selfBuff } from '../util'

const data: TagMapNodeEntries = [
  // Formula calculations
  // TODO: Probably don't need to have move and type here, theres no tag that will change these values, so prep step isn't needed
  selfBuff.formula.dmg.add(
    prod(self.dmg.out, self.dmg.critMulti, enemy.common.inDmg)
  ),
  // We can probably simplify these 2 into the util function
  selfBuff.formula.shield.add(
    prod(self.formula.base, sum(percent(1), self.premod.shield_))
  ),
  selfBuff.formula.heal.add(
    prod(self.formula.base, sum(percent(1), self.premod.heal_))
  ),
]
export default data
