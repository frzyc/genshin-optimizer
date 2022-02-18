import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq } from '../../../Formula/utils'
import { input, tally } from "../../../Formula/index"
import { allElements, ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { objectKeyValueMap } from '../../../Util/Util'

const key: ArtifactSetKey = "DefendersWill"

const set2 = greaterEq(input.artSet.DefendersWill, 2, percent(0.3))

const res_ = objectKeyValueMap(allElements, (ele) => [`${ele}_res_`,
  greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally[ele], 1, percent(0.3)))])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: set2,
    ...res_
  },
})

const sheet: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        fields: Object.values(res_).map(node => ({ node }))
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
