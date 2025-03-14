import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'BloodstainedChivalry'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.BloodstainedChivalry, 2, percent(0.25))
const [condPath, condNode] = cond(key, 'defeat')
const set4Charged = greaterEq(
  input.artSet.BloodstainedChivalry,
  4,
  equal('hit', condNode, percent(0.5)),
)
const set4StamDec = greaterEq(
  input.artSet.BloodstainedChivalry,
  4,
  equal('hit', condNode, percent(1)),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    physical_dmg_: set2,
    charged_dmg_: set4Charged,
    staminaChargedDec_: set4StamDec,
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
        name: st('afterDefeatEnemy', { percent: 70 }),
        states: {
          hit: {
            fields: [
              {
                node: set4Charged,
              },
              {
                node: set4StamDec,
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
