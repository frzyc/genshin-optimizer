import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { objKeyMap, objKeyValMap } from '@genshin-optimizer/util'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { absorbableEle } from '../../../Types/consts'
import { condReadNode, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

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

const sheet: IArtifactSheet = {
  name: 'Viridescent Venerer',
  rarity: [4, 5],
  setEffects: {
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
  },
}
export default new ArtifactSheet(key, sheet, data)
