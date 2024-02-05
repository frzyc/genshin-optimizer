import { lookup, prod, sum, sumfrac } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, enemyDebuff, percent, self, selfBuff } from '../util'

const data: TagMapNodeEntries = [
  enemyDebuff.common.inDmg.add(
    prod(
      // DEF Multiplier
      sumfrac(
        sum(self.char.lvl, 20),
        prod(
          sum(enemy.common.lvl, 20),
          sum(
            percent(1),
            prod(-1, enemy.common.defRed_),
            prod(-1, enemy.common.defIgn_)
          )
        )
      ),
      // RES Multiplier
      sum(
        percent(1),
        prod(-1, sum(enemyDebuff.common.res, prod(-1, self.final.resPen_)))
      )
      // TODO: Vulnerability, DMG Reduction and Broken multipliers
    )
  ),
  selfBuff.dmg.out.add(
    prod(self.formula.base, sum(percent(1), self.final.dmg_))
  ),
  selfBuff.dmg.critMulti.add(
    lookup(self.common.critMode, {
      crit: sum(percent(1), self.final.crit_dmg_),
      nonCrit: percent(1),
      avg: sum(percent(1), prod(self.common.cappedCrit_, self.final.crit_dmg_)),
    })
  ),
]
export default data
