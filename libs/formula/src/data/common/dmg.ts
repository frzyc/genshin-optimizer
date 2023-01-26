import { cmpGE, lookup, prod, sum, sumfrac } from '@genshin-optimizer/waverider'
import { Data, elements, percent, read, todo } from '../util'
import { ampMulti } from './reaction'

const preRes = todo
const res = cmpGE(preRes, percent(0.75),
  sumfrac(1, prod(4, preRes)),
  cmpGE(preRes, 0,
    sum(1, prod(-1, preRes)),
    sum(1, prod(-0.5, preRes))
  )
)

const nonOverridableSelfInfusion = todo, teamInfusion = todo, overridableSelfInfusion = todo
const move = todo, charEle = todo, hitEle = todo
const baseDmg = todo
const baseDmgInc = todo, dmgBonus = todo
const cataAddi = todo
const enemyDef = todo, lvl = todo
const enemyDefRed = todo, enemyDefIgn = todo

const {
  input: { enemy, self: { final: { critDMG_ }, common: { infusion, weaponType }, dmg } },
  output: { selfBuff }
} = read('agg')

const data: Data = [
  hitEle.addNode(
    lookup(move, { skill: charEle, burst: charEle },
      lookup(weaponType, { bow: 'physical', catalyst: charEle },
        infusion))),
  selfBuff.dmg.outDmg.addNode(prod(
    ampMulti,
    sum(baseDmg, baseDmgInc),
    sum(percent(1), dmgBonus),
  )),
  selfBuff.dmg.inDmg.addNode(prod(
    enemy.lvl,
    lookup(hitEle, Object.fromEntries(elements.map(ele =>
      [ele, enemy.res[ele]])))
  )),
  enemyDef.addNode(sumfrac(
    sum(lvl, 100),
    prod(
      sum(enemy.lvl, 100),
      sum(percent(1), prod(-1, enemyDefRed)), // TODO: Cap
      sum(percent(1), prod(-1, enemyDefIgn)), // TODO: Cap
    )
  )),
]
export default data
