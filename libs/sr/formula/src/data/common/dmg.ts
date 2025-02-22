import { lookup, prod, sum, sumfrac } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import { enemy, enemyDebuff, own, ownBuff, percent } from '../util'

const data: TagMapNodeEntries = [
  ownBuff.dmg.inDmg.add(
    prod(
      // DEF Multiplier
      sumfrac(
        sum(own.char.lvl, 20),
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
        prod(-1, sum(enemyDebuff.common.res, prod(-1, own.final.resPen_)))
      )
      // TODO: Vulnerability, DMG Reduction and Broken multipliers
    )
  ),
  ownBuff.dmg.out.add(
    prod(
      own.formula.base,
      sum(percent(1), own.final.dmg_, own.final.common_dmg_)
    )
  ),
  ownBuff.dmg.critMulti.add(
    lookup(own.common.critMode, {
      crit: sum(percent(1), own.final.crit_dmg_),
      nonCrit: percent(1),
      avg: sum(percent(1), prod(own.common.cappedCrit_, own.final.crit_dmg_)),
    })
  ),
]
export default data
