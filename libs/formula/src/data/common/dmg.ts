import { cmpGE, lookup, prod, subscript, sum, sumfrac } from '@genshin-optimizer/waverider'
import { Data, enemy, percent, priorityTable, self, todo } from '../util'

const preRes = todo
const res = cmpGE(preRes, percent(0.75),
  sumfrac(1, prod(4, preRes)),
  cmpGE(preRes, 0,
    sum(1, prod(-1, preRes)),
    sum(1, prod(-0.5, preRes))
  )
)

export const infusionPrio = {
  overridable: { hydro: 4, pyro: 5 },
  team: { hydro: 2, pyro: 3 },
  nonOverridable: { hydro: 0, pyro: 1 },
}
const infusionTable = priorityTable(infusionPrio)

const baseDmg = todo
const baseDmgInc = todo, dmgBonus = todo
const enemyDef = todo
const enemyDefRed = todo, enemyDefIgn = todo

const selfBuff = self

const data: Data = [
  selfBuff.dmg.outDmg.addNode(prod(
    self.reaction.ampMulti,
    sum(baseDmg, baseDmgInc),
    sum(percent(1), dmgBonus),
  )),
  enemyDef.addNode(sumfrac(
    sum(self.char.lvl, 100),
    prod(
      sum(enemy.common.lvl, 100),
      sum(percent(1), prod(-1, enemyDefRed)), // TODO: Cap
      sum(percent(1), prod(-1, enemyDefIgn)), // TODO: Cap
    )
  )),
  selfBuff.preDmg.critMulti.addNode(lookup(self.common.critMode, {
    'crit': sum(1, self.common.cappedCritRate_),
    'nonCrit': 1,
    'avg': sum(1, prod(self.common.cappedCritRate_, self.final.critDMG_))
  })),
  // TODO: merge this with `common.critMulti`
  selfBuff.trans.critMulti.addNode(lookup(self.common.critMode, {
    'crit': sum(1, self.trans.cappedCritRate_),
    'nonCrit': 1,
    'avg': sum(1, prod(self.trans.cappedCritRate_, self.trans.critDMG_))
  })),

  selfBuff.reaction.infusion.addNode(subscript(self.reaction.infusionIndex.max, infusionTable)),
  selfBuff.reaction.infusionIndex.addNode(0),
]
export default data
