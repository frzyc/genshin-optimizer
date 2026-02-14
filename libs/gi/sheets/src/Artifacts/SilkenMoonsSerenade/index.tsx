import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
  percent,
  tally,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'SilkenMoonsSerenade'
const setHeader = setHeaderTemplate(key)

const set2_enerRech_ = greaterEq(
  input.artSet.SilkenMoonsSerenade,
  2,
  percent(0.2)
)

const [cond4GleamingMoonPath, cond4GleamingMoon] = cond(key, '4GleamingMoon')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(cond4GleamingMoon, 'on', input.charKey)
)
const [set4_eleMas, set4_eleMasInactive] = nonStackBuff(
  'gleamingmoondevotion',
  'eleMas',
  threshold(tally.moonsign, 2, 120, greaterEq(tally.moonsign, 1, 60))
)
const lunar_dmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_dmg_`,
  nonStackBuff('gleamingmoondevotion', `${k}_dmg_`, percent(0.1)),
])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2_enerRech_,
  },
  teamBuff: {
    premod: {
      eleMas: set4_eleMas,
      ...objMap(lunar_dmg_obj, (buffs) => buffs[0]),
    },
    nonStacking: {
      gleamingmoondevotion: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        fields: [
          {
            node: set2_enerRech_,
          },
        ],
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        path: cond4GleamingMoonPath,
        value: cond4GleamingMoon,
        name: st('hitOp.ele'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: set4_eleMas,
              },
              ...Object.values(lunar_dmg_obj).map((nodes) => ({
                node: nodes[0],
              })),
              {
                node: set4_eleMasInactive,
              },
              ...Object.values(lunar_dmg_obj).map((nodes) => ({
                node: nodes[1],
              })),
              {
                text: stg('duration'),
                value: 8,
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
