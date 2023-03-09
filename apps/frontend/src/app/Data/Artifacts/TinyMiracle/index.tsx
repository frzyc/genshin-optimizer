import ColorText from '../../../Components/ColoredText'
import { input } from '../../../Formula/index'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, percent, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import { cond, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'TinyMiracle'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)
const [condElePath, condEle] = cond(key, 'element')

const set2Nodes = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    greaterEq(
      input.artSet.TinyMiracle,
      2,
      percent(0.2),
      KeyMap.info(`${ele}_res_`)
    ),
  ])
)

const set4Nodes = Object.fromEntries(
  allElementKeys.map((ele) => [
    ele,
    greaterEq(
      input.artSet.TinyMiracle,
      4,
      equal(condEle, ele, percent(0.3)),
      KeyMap.info(`${ele}_res_`)
    ),
  ])
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: Object.fromEntries(
    allElementKeys.map((ele) => [
      `${ele}_res_`,
      sum(set2Nodes[ele], set4Nodes[ele]),
    ])
  ),
})

const sheet: IArtifactSheet = {
  name: 'Tiny Miracle',
  rarity: [3, 4],
  setEffects: {
    2: {
      document: [
        {
          header: setHeader(2),
          fields: Object.values(set2Nodes).map((n) => ({ node: n })),
        },
      ],
    },
    4: {
      document: [
        {
          header: setHeader(4),
          path: condElePath,
          value: condEle,
          teamBuff: true,
          name: trm('condName'),
          states: Object.fromEntries(
            allElementKeys.map((e) => [
              e,
              {
                name: <ColorText color={e}>{stg(`element.${e}`)}</ColorText>,
                fields: [
                  ...Object.values(set4Nodes).map((n) => ({ node: n })),
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
  },
}
export default new ArtifactSheet(key, sheet, data)
