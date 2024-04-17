import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { absorbableEle } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { condReadNode, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'ViridescentVenerer'
const setHeader = setHeaderTemplate(key)

const anemo_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 2, percent(0.15))
const swirl_dmg_ = greaterEq(input.artSet.ViridescentVenerer, 4, percent(0.6))

const condSwirlPaths = objKeyMap(absorbableEle, (e) => [key, `swirl${e}`])
const condSwirls = objKeyMap(absorbableEle, (e) =>
  condReadNode(condSwirlPaths[e])
)

const condSwirlNodes = objKeyValMap(absorbableEle, (e) => [
  `${e}_enemyRes_`,
  greaterEq(
    input.artSet.ViridescentVenerer,
    4,
    equal(e, condSwirls[e], percent(-0.4))
  ),
])

const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    anemo_dmg_,
    swirl_dmg_,
  },
  teamBuff: {
    premod: {
      ...condSwirlNodes,
    },
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        header: setHeader(2),
        fields: [{ node: anemo_dmg_ }],
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: [{ node: swirl_dmg_ }],
      },
      {
        header: setHeader(4),
        teamBuff: true,
        states: Object.fromEntries(
          absorbableEle.map((eleKey) => [
            eleKey,
            {
              value: condSwirls[eleKey],
              path: condSwirlPaths[eleKey],
              name: st(`swirlReaction.${eleKey}`),
              fields: [
                {
                  node: condSwirlNodes[`${eleKey}_enemyRes_`],
                },
                {
                  text: st(`effectDuration.${eleKey}`),
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
