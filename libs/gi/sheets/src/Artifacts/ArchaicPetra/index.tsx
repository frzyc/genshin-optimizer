import { ColorText } from '@genshin-optimizer/common/ui'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { absorbableEle } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { cond, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = 'ArchaicPetra'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.ArchaicPetra, 2, percent(0.15))
const [condPath, condNode] = cond(key, 'element')
const set4Nodes = Object.fromEntries(
  absorbableEle.map((e) => [
    `${e}_dmg_`,
    greaterEq(input.artSet.ArchaicPetra, 4, equal(e, condNode, percent(0.35))),
  ])
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    geo_dmg_: set2,
  },
  teamBuff: {
    premod: set4Nodes,
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
                {
                  node: set4Nodes[`${e}_dmg_`],
                },
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
