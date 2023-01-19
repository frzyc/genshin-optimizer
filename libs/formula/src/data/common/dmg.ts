import { cmpEq, cmpGE, lookup, prod, sum, sumfrac } from "@genshin-optimizer/waverider"
import { cappedCritRate_, Data, elements, enemy, one, percent, reader, todo } from "../util"
import { ampMulti, crystallizeHit, transHit } from './reaction'

const preRes = todo
const res = cmpGE(preRes, percent(0.75),
  sumfrac(1, prod(4, preRes)),
  cmpGE(preRes, 0,
    sum(1, prod(-1, preRes)),
    sum(1, prod(-0.5, preRes))
  )
)

const { critDMG_ } = reader.final
const nonOverridableSelfInfusion = todo, teamInfusion = todo, overridableSelfInfusion = todo
const infusion = reader.q.infusion, baseInfusion = todo
const move = todo, charEle = todo, hitEle = todo
const baseDmg = todo, outDmg = todo, inDef = todo
const finalDmg = todo, baseDmgInc = todo, dmgBonus = todo
const hitMode = todo, cataAddi = todo
const enemyDef = todo, lvl = todo, enemyLvl = todo
const enemyDefRed = todo, enemyDefIgn = todo

const data: Data = [
  hitEle.addNode(
    lookup(move, { skill: charEle, burst: charEle },
      lookup(reader.q.weaponType, { bow: 'physical', catalyst: charEle },
        infusion))),
  outDmg.addNode(prod(
    ampMulti,
    sum(baseDmg, baseDmgInc),
    sum(one, dmgBonus),
  )),
  inDef.addNode(prod(
    enemy.final.def,
    lookup(hitEle, Object.fromEntries(elements.map(ele =>
      [ele, enemy.with('ele', ele).custom['res']])))
  )),
  enemyDef.addNode(sumfrac(
    sum(lvl, 100),
    prod(
      sum(enemyLvl, 100),
      sum(one, prod(-1, enemyDefRed)), // TODO: Cap
      sum(one, prod(-1, enemyDefIgn)), // TODO: Cap
    )
  )),
]
export default data
