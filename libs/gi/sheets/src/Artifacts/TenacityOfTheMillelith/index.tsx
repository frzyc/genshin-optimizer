import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
  percent,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'TenacityOfTheMillelith'
const setHeader = setHeaderTemplate(key)

const hp_ = greaterEq(input.artSet.TenacityOfTheMillelith, 2, percent(0.2))
const [condPath, condNode] = cond(key, 'skill')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(condNode, 'cast', input.charKey)
)
const [set4Atk, set4AtkInactive] = nonStackBuff('totm4', 'atk_', percent(0.2))
const [set4Shield, set4ShieldInactive] = nonStackBuff(
  'totm4',
  'shield_',
  percent(0.2)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    hp_,
  },
  teamBuff: {
    premod: {
      atk_: set4Atk,
      shield_: set4Shield,
    },
    nonStacking: {
      totm4: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: hp_ }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        teamBuff: true,
        path: condPath,
        value: condNode,
        name: st('hitOp.skill'),
        states: {
          cast: {
            fields: [
              {
                node: set4Atk,
              },
              {
                node: set4Shield,
              },
              {
                node: set4AtkInactive,
              },
              {
                node: set4ShieldInactive,
              },
              {
                text: stg('duration'),
                value: 3,
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
