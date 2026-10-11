import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allStellarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  inferInfoMut,
  input,
  mergeData,
  percent,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { SetEffectSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'HeartOfTheFurnace'
const setHeader = setHeaderTemplate(key)

const set2_atk_ = greaterEq(input.artSet[key], 2, percent(0.18))

const [cond4StellarPath, cond4Stellar] = cond(key, '4Stellar')
const set4Stellar_atk_ = greaterEq(
  input.artSet[key],
  4,
  equal(cond4Stellar, 'on', 0.12)
)
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(cond4Stellar, 'on', input.charKey)
)
const set4_stellar_dmg_obj = objKeyValMap(allStellarReactionKeys, (k) => [
  `${k}_dmg_`,
  nonStackBuff('heartofthefurnace', `${k}_dmg_`, percent(0.5)),
])

export const data: Data = dataObjForArtifactSheet(
  key,
  mergeData([
    inferInfoMut({
      premod: {
        atk_: set2_atk_,
      },
      teamBuff: {
        premod: {
          ...objMap(set4_stellar_dmg_obj, (buffs) => buffs[0]),
        },
        nonStacking: {
          heartofthefurnace: set4TallyWrite,
        },
      },
    }),
    inferInfoMut({
      premod: {
        atk_: set4Stellar_atk_,
      },
    }),
  ])
)

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        fields: [
          {
            node: set2_atk_,
          },
        ],
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        path: cond4StellarPath,
        value: cond4Stellar,
        name: st('elementalReaction.stellar.triggerOrHit'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: set4Stellar_atk_,
              },
              ...Object.values(set4_stellar_dmg_obj).map((nodes) => ({
                node: nodes[0],
              })),
              ...Object.values(set4_stellar_dmg_obj).map((nodes) => ({
                node: nodes[1],
              })),
              {
                text: stg('duration'),
                value: 12,
                unit: 's',
              },
            ],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
