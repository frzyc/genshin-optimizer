import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, sum } from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'ADayCarvedFromRisingWinds'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet[key], 2, 0.18, {
  path: 'atk_',
})

const [condSet4Path, condSet4] = cond(key, 'set4')
const set4Cond = greaterEq(
  input.artSet[key],
  4,
  equal(condSet4, 'on', 0.25, { path: 'atk_' })
)
const set4Hex = greaterEq(
  input.artSet[key],
  4,
  equal(condSet4, 'on', equal(input.isHexerei, 1, 0.2))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: sum(set2, set4Cond),
    critRate_: set4Hex,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        path: condSet4Path,
        value: condSet4,
        name: st('hitOp.normalChargedSkillBurst'),
        states: {
          on: {
            fields: [
              {
                node: set4Cond,
              },
              {
                text: stg('duration'),
                value: 6,
                unit: 's',
              },
            ],
          },
        },
      },
      {
        header: setHeader(4),
        canShow: greaterEq(set4Hex, 0.1, 1),
        fields: [
          {
            node: set4Hex,
          },
          {
            text: stg('duration'),
            value: 6,
            unit: 's',
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
