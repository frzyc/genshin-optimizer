import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent, sum } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { cond, sgt, st } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "MartialArtist"
const setHeader = setHeaderTemplate(key, icons)
const [condStatePath, condState] = cond(key, "state")

const set2NA = greaterEq(input.artSet.MartialArtist, 2, percent(0.15), { key: "normal_dmg_" })
const set2CA = greaterEq(input.artSet.MartialArtist, 2, percent(0.15), { key: "charged_dmg_" })
const set4NA = greaterEq(input.artSet.MartialArtist, 4, equal("on", condState, percent(0.25), { key: "normal_dmg_" }))
const set4CA = greaterEq(input.artSet.MartialArtist, 4, equal("on", condState, percent(0.25), { key: "charged_dmg_" }))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    normal_dmg_: sum(set2NA, set4NA),
    charged_dmg_: sum(set2CA, set4CA),
  },
})

const sheet: IArtifactSheet = {
  name: "Martial Artist", rarity: [3, 4],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2NA }, { node: set2CA }] }] },
    4: {
      document: [{
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: st("afterUse.skill"),
        states: {
          on: {
            fields: [{
              node: set4NA,
            }, {
              node: set4CA,
            }, {
              text: sgt('duration'),
              value: 8,
              unit: 's'
            }]
          },
        }
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
