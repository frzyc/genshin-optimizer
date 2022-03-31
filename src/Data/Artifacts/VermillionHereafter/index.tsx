import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, equal, sum, lookup, naught } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, st } from '../../SheetUtil'
import { range } from '../../../Util/Util'

const key: ArtifactSetKey = "VermillionHereafter"

const set2 = greaterEq(input.artSet.VermillionHereafter, 2, percent(0.18), { key: "atk_" })
const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurstAtk_ = greaterEq(input.artSet.VermillionHereafter, 4,
  equal(condAfterBurst, "on", percent(0.08)), { key: "atk_" }
)
const [condStacksPath, condStacks] = cond(key, "stacks")
const stacksAtk_ = equal(condAfterBurst, "on",
  lookup(condStacks, Object.fromEntries(range(1, 4).map(stacks => [
    stacks,
    percent(0.10 * stacks)
  ])), naught),
  { key: "atk_" }
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: sum(set2, afterBurstAtk_, stacksAtk_)
  }
})
const sheet: IArtifactSheet = {
  name: "Vermillion Hereafter", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: { document: [{
      conditional: {
        value: condAfterBurst,
        path: condAfterBurstPath,
        name: st("afterUse.burst"),
        canShow: greaterEq(input.artSet.VermillionHereafter, 4, 1),
        states: {
          on: {
            fields: [{ node: afterBurstAtk_ }]
          }
        }
      }
    }, {
      conditional: {
        value: condStacks,
        path: condStacksPath,
        name: st("stacks"),
        canShow: equal(condAfterBurst, "on", 1),
        states: Object.fromEntries(range(1, 4).map(stacks => [
          stacks, {
            name: st("stack", { count: stacks }),
            fields: [{ node: stacksAtk_ }]
          }
        ]))
      }
    }]}
  }
}
export default new ArtifactSheet(key, sheet, data)
