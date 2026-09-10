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

/** Higher index wins (`infusionIndex.max`). Tiers match WR `stringPrio`:
 * overridableSelf < team < nonOverridableSelf. Element order inside a tier is
 * stable but unused when only one infusion is on. */
export const infusionPrio = {
  overridable: {
    physical: 0,
    hydro: 1,
    pyro: 2,
    cryo: 3,
    electro: 4,
    anemo: 5,
    dendro: 6,
    geo: 7,
  },
  team: {
    hydro: 8,
    pyro: 9,
    cryo: 10,
    electro: 11,
    anemo: 12,
    dendro: 13,
  },
  nonOverridable: {
    hydro: 14,
    pyro: 15,
    geo: 16,
    cryo: 17,
    electro: 18,
    anemo: 19,
    dendro: 20,
  },
}
const infusionTable = priorityTable(infusionPrio),
  preRes = enemy.common.preRes

const data: TagMapNodeEntries = [
  enemyDebuff.common.postRes.add(custom('res', preRes)),
  ownBuff.dmg.def_mult_.add(
    sumfrac(
      sum(own.char.lvl, 100),
      prod(
        sum(enemy.common.lvl, 100),
        // WR formula.ts also TODOs a 90% shred cap; keep uncapped for parity.
        sum(percent(1), prod(-1, enemy.common.defRed_)),
        sum(percent(1), prod(-1, enemy.common.defIgn))
      )
    )
  ),
  ownBuff.dmg.inDmg.add(prod(own.dmg.def_mult_, enemy.common.postRes)),
  ownBuff.dmg.out.add(
    prod(
      own.reaction.ampMulti,
      sum(own.formula.base, own.reaction.cataAddi),
      sum(percent(1), own.final.dmg_)
    )
  ),
  ownBuff.dmg.critMulti.add(
    lookup(own.common.critMode, {
      crit: sum(1, own.common.cappedCritRate_),
      nonCrit: 1,
      avg: sum(1, prod(own.common.cappedCritRate_, own.final.critDMG_)),
    })
  ),

  ownBuff.reaction.infusion.add(
    subscript(own.reaction.infusionIndex.max, infusionTable)
  ),
  ownBuff.reaction.infusionIndex.add(0),
]
export default data
