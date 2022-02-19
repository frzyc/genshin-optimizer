import icons from './icons'
import { Data } from '../../../Formula/type'
import { percent, greaterEq, equal, sum } from '../../../Formula/utils'
import { input } from "../../../Formula/index"
import { allElements, ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, conditionalHeader, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import { cond, sgt, trans } from '../../SheetUtil'
import ColorText from '../../../Components/ColoredText'

const key: ArtifactSetKey = "TinyMiracle"
const [tr, trm] = trans("artifact", key)
const [condElePath, condEle] = cond(key, "element")

const set2Anemo = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "anemo_res_" })
const set2Geo = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "geo_res_" })
const set2Cryo = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "cryo_res_" })
const set2Pyro = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "pyro_res_" })
const set2Hydro = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "hydro_res_" })
const set2Electro = greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: "electro_res_" })

const set4Anemo = greaterEq(input.artSet.TinyMiracle, 4, equal('anemo', condEle, percent(0.3), { key: "anemo_res_" }))
const set4Geo = greaterEq(input.artSet.TinyMiracle, 4, equal('geo', condEle, percent(0.3), { key: "geo_res_" }))
const set4Pyro = greaterEq(input.artSet.TinyMiracle, 4, equal('pyro', condEle, percent(0.3), { key: "pyro_res_" }))
const set4Hydro = greaterEq(input.artSet.TinyMiracle, 4, equal('hydro', condEle, percent(0.3), { key: "hydro_res_" }))
const set4Electro = greaterEq(input.artSet.TinyMiracle, 4, equal('electro', condEle, percent(0.3), { key: "electro_res_" }))
const set4Cryo = greaterEq(input.artSet.TinyMiracle, 4, equal('cryo', condEle, percent(0.3), { key: "cryo_res_" }))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    anemo_res_: sum(set2Anemo, set4Anemo),
    geo_res_: sum(set2Geo, set4Geo),
    cryo_res_: sum(set2Cryo, set4Cryo),
    pyro_res_: sum(set2Pyro, set4Pyro),
    hydro_res_: sum(set2Hydro, set4Hydro),
    electro_res_: sum(set2Electro, set4Electro)
  },
})

const sheet: IArtifactSheet = {
  name: "Tiny Miracle", rarity: [3, 4],
  icons,
  setEffects: {
    2: {
      document: [{
        fields: [
          { node: set2Anemo },
          { node: set2Geo },
          { node: set2Cryo },
          { node: set2Pyro },
          { node: set2Hydro },
          { node: set2Electro }
        ]
      }]
    },
    4: {
      document: [
        {
          conditional: {
            path: condElePath,
            value: condEle,
            teamBuff: true,
            header: conditionalHeader(tr, icons.flower),
            description: tr(`setEffects.4`),
            name: trm("condName"),
            states: Object.fromEntries(allElements.map(e => [e, {
              name: <ColorText color={e}>{sgt(`element.${e}`)}</ColorText>,
              fields: [
                { node: set4Anemo },
                { node: set4Geo },
                { node: set4Cryo },
                { node: set4Pyro },
                { node: set4Hydro },
                { node: set4Electro },
                {
                  text: sgt("duration"),
                  value: 10,
                  unit: "s"
                }
              ]
            }])),
          }
        }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
