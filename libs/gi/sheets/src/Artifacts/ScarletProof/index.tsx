import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { SetEffectSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'ScarletProof'
const setHeader = setHeaderTemplate(key)

const set2_atk_ = greaterEq(input.artSet[key], 2, 0.18)

const [cond4SsPath, cond4Ss] = cond(key, '4Ss')
const set4_critRate_ = greaterEq(
  input.artSet[key],
  4,
  equal(cond4Ss, 'on', 0.16)
)
const set4_stellarswirl_dmg_ = greaterEq(
  input.artSet[key],
  4,
  equal(cond4Ss, 'on', 0.4)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2_atk_,
    critRate_: set4_critRate_,
    stellarswirl_dmg_: set4_stellarswirl_dmg_,
  },
})

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
        path: cond4SsPath,
        value: cond4Ss,
        name: st('elementalReaction.stellarswirl'),
        states: {
          on: {
            fields: [
              {
                node: set4_critRate_,
              },
              {
                node: set4_stellarswirl_dmg_,
              },
              {
                text: stg('duration'),
                value: 10,
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
