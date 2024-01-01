import { lookup, prod, sum } from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { enemy, enemyDebuff, percent, self, selfBuff } from '../util'

const preRes = enemy.common.preRes

const data: TagMapNodeEntries = [
  // TODO Def/Res
  enemyDebuff.common.postRes.add(preRes),
  enemyDebuff.common.inDmg.add(1),
  selfBuff.dmg.out.add(
    prod(self.formula.base, sum(percent(1), self.final.dmg_))
  ),
  selfBuff.dmg.critMulti.add(
    lookup(self.common.critMode, {
      crit: sum(1, self.final.crit_dmg_),
      nonCrit: 1,
      avg: sum(1, prod(self.common.cappedCrit_, self.final.crit_dmg_)),
    })
  ),
]
export default data
