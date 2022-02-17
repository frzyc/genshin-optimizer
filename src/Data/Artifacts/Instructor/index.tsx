import icons from './icons'
import { Data } from '../../../Formula/type'
import { equal, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond } from '../../SheetUtil'
import { Translate } from '../../../Components/Translate'

const key: ArtifactSetKey = "Instructor"
const trm = (strKey: string) => <Translate ns="artifact_Instructor" key18={strKey} />

const [condStatePath, condState] = cond(key, "state")

const set2 = greaterEq(input.artSet.Instructor, 2, 80)
const set4 = greaterEq(input.artSet.Instructor, 4, equal("on", condState, 120))

// TODO: Is it premod? Or is it total
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
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        conditional: {
          value: condState,
          path: condStatePath,
          teamBuff: true, // TODO: Should this be set to true?
          name: trm("condName"),
          states: {
            on: {
              fields: [{
                node: set4,
              }, {
                text: "Duration",
                value: "8",
                unit: "s"
              }]
            },
          }
        }
      }],
    }
  }
}
export default new ArtifactSheet(key, sheet, data)