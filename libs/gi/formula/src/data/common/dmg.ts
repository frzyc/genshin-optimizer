import {
  custom,
  lookup,
  prod,
  subscript,
  sum,
  sumfrac,
} from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries } from '../util'
import {
  enemy,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  priorityTable,
} from '../util'

export const infusionPrio = {
  nonOverridable: { hydro: 5, pyro: 6 },
  team: { hydro: 3, pyro: 4 },
  overridable: { physical: 0, hydro: 1, pyro: 2 },
}
const infusionTable = priorityTable(infusionPrio),
  preRes = enemy.common.preRes

const data: TagMapNodeEntries = [
  enemyDebuff.common.postRes.add(custom('res', preRes)),
  ownBuff.dmg.inDmg.add(
    prod(
      sumfrac(
        sum(own.char.lvl, 100),
        prod(
          sum(enemy.common.lvl, 100),
          sum(percent(1), prod(-1, enemy.common.defRed_)), // TODO: Cap
          sum(percent(1), prod(-1, enemy.common.defIgn)), // TODO: Cap
        ),
      ),
      enemy.common.postRes,
    ),
  ),
  ownBuff.dmg.out.add(
    prod(
      own.reaction.ampMulti,
      sum(own.formula.base, own.reaction.cataAddi),
      sum(percent(1), own.final.dmg_),
    ),
  ),
  ownBuff.dmg.critMulti.add(
    lookup(own.common.critMode, {
      crit: sum(1, own.common.cappedCritRate_),
      nonCrit: 1,
      avg: sum(1, prod(own.common.cappedCritRate_, own.final.critDMG_)),
    }),
  ),

  ownBuff.reaction.infusion.add(
    subscript(own.reaction.infusionIndex.max, infusionTable),
  ),
  ownBuff.reaction.infusionIndex.add(0),
]
export default data
