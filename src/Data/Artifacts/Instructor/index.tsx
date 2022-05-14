import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "Instructor"
const setHeader = setHeaderTemplate(key, icons)
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
  icons,
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
              text: sgt("duration"),
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
