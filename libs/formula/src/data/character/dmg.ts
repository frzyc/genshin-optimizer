import { AnyNode, cmpGE, lookup, prod, RawTagMapEntries, sum, sumfrac } from "@genshin-optimizer/waverider"
import { base, cappedCritRate_, final, hitEle, one, percent, reader, todo } from "../util"

// TODO: Figure out the tag for these
const outDmg = todo, inDefence = todo
const dmgInc = todo
const hitMode = todo
const dmgBonus = todo
const preRes = todo
const baseDmg = base.q('dmg'), enemy = reader.char('enemy')

const res = cmpGE(preRes, percent(0.75),
  sumfrac(1, prod(4, preRes)),
  cmpGE(preRes, 0,
    sum(1, prod(-1, preRes)),
    sum(1, prod(-0.5, preRes))
  )
)

// Dmg formula
const data: RawTagMapEntries<AnyNode> = [
  outDmg.addNode(prod(
    sum(baseDmg, dmgInc),
    sum(one, dmgBonus),
    lookup(hitMode, {
      hit: one,
      critHit: sum(one, final.q('critDMG_')),
      avgHit: sum(one, prod(cappedCritRate_, final.q('critDMG_'))),
    }),
    enemy.final.q('def'),
    lookup(hitEle, {
      // TODO Res Multi
    }),
    // Amp multi
  ))
]
export default data
