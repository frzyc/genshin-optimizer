import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, lookup, naught, percent, sum } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "VermillionHereafter"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.VermillionHereafter, 2, percent(0.18), { key: "atk_" })
const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurstAtk_ = greaterEq(input.artSet.VermillionHereafter, 4,
  equal(condAfterBurst, "on", percent(0.08)), { key: "atk_" }
)
const [condStacksPath, condStacks] = cond(key, "stacks")
const stacksAtk_ = greaterEq(input.artSet.VermillionHereafter, 4, equal(condAfterBurst, "on",
  lookup(condStacks, Object.fromEntries(range(1, 4).map(stacks => [
    stacks,
    percent(0.10 * stacks)
  ])), naught),
  { key: "atk_" }
))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: sum(set2, afterBurstAtk_, stacksAtk_)
  }
})
const sheet: IArtifactSheet = {
  name: "Vermillion Hereafter", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condAfterBurst,
        path: condAfterBurstPath,
        teamBuff: true,
        name: st("afterUse.burst"),
        states: {
          on: {
            fields: [{ node: afterBurstAtk_ }]
          }
        }
      }, {
        header: setHeader(4),
        value: condStacks,
        path: condStacksPath,
        teamBuff: true,
        name: st("stacks"),
        canShow: equal(condAfterBurst, "on", 1),
        states: Object.fromEntries(range(1, 4).map(stacks => [
          stacks, {
            name: st("stack", { count: stacks }),
            fields: [{ node: stacksAtk_ }]
          }
        ]))
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
