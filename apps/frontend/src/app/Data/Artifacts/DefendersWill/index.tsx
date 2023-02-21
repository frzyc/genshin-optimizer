import { input, tally } from "../../../Formula/index"
import { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import { allElementKeys, ArtifactSetKey } from '@genshin-optimizer/consts'
import { objectKeyValueMap } from '../../../Util/Util'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "DefendersWill"
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.DefendersWill, 2, percent(0.3))

const res_ = objectKeyValueMap(allElementKeys, (ele) => [
  `${ele}_res_`,
  greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally[ele], 1, percent(0.3)))])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: set2,
    ...res_
  },
})

const sheet: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        fields: Object.values(res_).map(node => ({ node }))
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
