import ColorText from '../../../Components/ColoredText'
import { input } from "../../../Formula/index"
import { Data } from '../../../Formula/type'
import { equal, greaterEq, percent, sum } from '../../../Formula/utils'
import { allElements, ArtifactSetKey } from '../../../Types/consts'
import { cond, sgt, trans } from '../../SheetUtil'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "TinyMiracle"
const setHeader = setHeaderTemplate(key, icons)
const [, trm] = trans("artifact", key)
const [condElePath, condEle] = cond(key, "element")

const set2Nodes = Object.fromEntries(allElements.map(ele => [
  ele,
  greaterEq(input.artSet.TinyMiracle, 2, percent(0.2), { key: `${ele}_res_` })
]))

const set4Nodes = Object.fromEntries(allElements.map(ele => [
  ele,
  greaterEq(input.artSet.TinyMiracle, 4, equal(condEle, ele, percent(0.3)), { key: `${ele}_res_` })
]))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: Object.fromEntries(allElements.map(ele => [
    `${ele}_res_`,
    sum(set2Nodes[ele], set4Nodes[ele])
  ]))
})

const sheet: IArtifactSheet = {
  name: "Tiny Miracle", rarity: [3, 4],
  icons,
  setEffects: {
    2: {
      document: [{
        header: setHeader(2),
        fields: Object.values(set2Nodes).map(n => ({ node: n }))
      }]
    },
    4: {
      document: [{
        header: setHeader(4),
        path: condElePath,
        value: condEle,
        teamBuff: true,
        name: trm("condName"),
        states: Object.fromEntries(allElements.map(e => [e, {
          name: <ColorText color={e}>{sgt(`element.${e}`)}</ColorText>,
          fields: [
            ...Object.values(set4Nodes).map(n => ({ node: n })),
            {
              text: sgt("duration"),
              value: 10,
              unit: "s"
            }
          ]
        }])),
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
