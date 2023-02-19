import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq } from '../../../Formula/utils'
import { ArtifactSetKey } from '@genshin-optimizer/consts'
import { cond, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "Instructor"
const setHeader = setHeaderTemplate(key)
const [, trm] = trans("artifact", key)

const [condStatePath, condState] = cond(key, "set4")

const set2 = greaterEq(input.artSet.Instructor, 2, 80)
const set4 = greaterEq(input.artSet.Instructor, 4, equal("on", condState, 120))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2
  },
  teamBuff: {
    premod: {
      eleMas: set4
    }
  }
})

const sheet: IArtifactSheet = {
  name: "Instructor", rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        teamBuff: true,
        value: condState,
        path: condStatePath,
        name: trm("condName"),
        states: {
          on: {
            fields: [{
              node: set4,
            }, {
              text: stg("duration"),
              value: 8,
              unit: "s"
            }]
          },
        }
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
