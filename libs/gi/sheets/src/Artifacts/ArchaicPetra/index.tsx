import { ColorText } from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { absorbableEle } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  greaterEq,
  greaterEqStr,
  input,
  percent,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = 'ArchaicPetra'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.ArchaicPetra, 2, percent(0.15))
const [condPath, condNode] = cond(key, 'element')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  // Only allow one element at all to be buffed
  greaterEqStr(
    sum(...absorbableEle.map((ele) => equal(condNode, ele, 1))),
    1,
    input.charKey
  )
)
const set4Nodes = Object.fromEntries(
  absorbableEle.map((e) => [
    `${e}_dmg_`,
    nonStackBuff('ap4', `${e}_dmg_`, equal(condNode, e, percent(0.35))),
  ])
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    geo_dmg_: set2,
  },
  teamBuff: {
    premod: objMap(set4Nodes, (nodes) => nodes[0]), // First node is active node
    nonStacking: {
      ap4: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        path: condPath,
        value: condNode,
        teamBuff: true,
        name: trm('condName'),
        states: Object.fromEntries(
          absorbableEle.map((e) => [
            e,
            {
              name: <ColorText color={e}>{stg(`element.${e}`)}</ColorText>,
              fields: [
                ...set4Nodes[`${e}_dmg_`].map((node) => ({ node })),
                {
                  text: stg('duration'),
                  value: 10,
                  unit: 's',
                },
              ],
            },
          ])
        ),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
