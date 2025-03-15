import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data, Info } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent, sum } from '@genshin-optimizer/gi/wr'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Berserker'
const setHeader = setHeaderTemplate(key)

const critRate_info: Info = { path: 'critRate_' }
const set2 = greaterEq(input.artSet.Berserker, 2, percent(0.12), critRate_info)
const [condPath, condNode] = cond(key, 'hp')
const set4 = greaterEq(
  input.artSet.Berserker,
  4,
  equal('70', condNode, percent(0.24)),
  critRate_info,
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    critRate_: sum(set2, set4),
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
        name: st('lessPercentHP', { percent: 70 }),
        states: {
          70: {
            fields: [
              {
                node: set4,
              },
            ],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
