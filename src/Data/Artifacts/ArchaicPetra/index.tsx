import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { absorbableEle, ArtifactSetKey } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'
const key: ArtifactSetKey = "ArchaicPetra"
const setHeader = setHeaderTemplate(key, icons)
const [, trm] = trans("artifact", key)

const set2 = greaterEq(input.artSet.ArchaicPetra, 2, percent(0.15))
const [condPath, condNode] = cond(key, "element")
const set4Nodes = Object.fromEntries(absorbableEle.map(e => [
  `${e}_dmg_`,
  greaterEq(input.artSet.ArchaicPetra, 4,
    equal(e, condNode, percent(0.35))
  )
]))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    geo_dmg_: set2,
  },
  teamBuff: {
    premod: set4Nodes
  }
})

const sheet: IArtifactSheet = {
  name: "Archaic Petra", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [{
        header: setHeader(4),
        path: condPath,
        value: condNode,
        teamBuff: true,
        name: trm("condName"),
        states: Object.fromEntries(absorbableEle.map(e => [e, {
          name: sgt(`element.${e}`),
          fields: [{
            node: set4Nodes[`${e}_dmg_`]
          }, {
            text: sgt("duration"),
            value: 10,
            unit: "s"
          }]
        }])),
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
