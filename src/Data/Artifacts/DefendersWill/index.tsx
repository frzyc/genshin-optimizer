import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq } from '../../../Formula/utils'
import { input, tally } from "../../../Formula/index"
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = "DefendersWill"

const set2 = greaterEq(input.artSet.DefendersWill, 2, percent(0.3))

// TODO: Maybe theres a cleaner way to do this?
const anemo_res_ = greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally.anemo, 1, percent(0.3)))
const cryo_res_ = greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally.cryo, 1, percent(0.3)))
const pyro_res_ = greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally.pyro, 1, percent(0.3)))
const electro_res_ = greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally.electro, 1, percent(0.3)))
const geo_res_ = greaterEq(input.artSet.DefendersWill, 4, greaterEq(tally.geo, 1, percent(0.3)))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: set2,
    anemo_res_,
    cryo_res_,
    pyro_res_,
    electro_res_,
    geo_res_
  },
})

const sheet: IArtifactSheet = {
  name: "Defender's Will", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        fields: [{
          node: anemo_res_
        }, {
          node: cryo_res_
        }, {
          node: pyro_res_
        }, {
          node: electro_res_
        }, {
          node: geo_res_
        },
        ]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)