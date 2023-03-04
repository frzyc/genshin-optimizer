import { input, tally } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, lookup, naught, percent, prod, sum, unequal } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { allElementKeys, ArtifactSetKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "GildedDreams"
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.GildedDreams, 2, 80, KeyMap.info("eleMas"))

const [condPassivePath, condPassive] = cond(key, "passive")
const set4_atk_ = greaterEq(input.artSet.GildedDreams, 4,
  equal(condPassive, "on",
    lookup(input.charEle, Object.fromEntries(allElementKeys.map(ele => [
      ele,
      greaterEq(tally[ele], 2, prod(sum(tally[ele], -1), percent(0.14))) // Do not include wielder (maybe)
    ])), naught)
  )
)
const totalNonEleParty = sum(
  ...allElementKeys.map(ele =>
    greaterEq(tally[ele], 1,
      unequal(ele, input.charEle,
        tally[ele]
      )
    )
  )
)
const set4_eleMas = greaterEq(input.artSet.GildedDreams, 4,
  equal(condPassive, "on",
    greaterEq(totalNonEleParty, 1, prod(totalNonEleParty, 50)),
    KeyMap.info("eleMas")
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: sum(set2, set4_eleMas),
    atk_: set4_atk_
  },
})

const sheet: IArtifactSheet = {
  name: "Gilded Dreams", rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        teamBuff: true,
        path: condPassivePath,
        value: condPassive,
        name: st("afterReaction"),
        states: {
          on: {
            fields: [{
              node: set4_atk_
            }, {
              node: set4_eleMas
            }, {
              canShow: (data) => !data.get(set4_atk_).isEmpty || !data.get(set4_eleMas).isEmpty,
              text: stg("duration"),
              value: 8,
              unit: "s",
            }, {
              canShow: (data) => !data.get(set4_atk_).isEmpty || !data.get(set4_eleMas).isEmpty,
              text: stg("cd"),
              value: 8,
              unit: "s",
            }]
          }
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
