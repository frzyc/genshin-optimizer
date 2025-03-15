import { range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data, Info } from '@genshin-optimizer/gi/wr'
import {
  equal,
  greaterEq,
  input,
  lookup,
  naught,
  percent,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'PaleFlame'
const setHeader = setHeaderTemplate(key)

const [condStackPath, condStack] = cond(key, 'stacks')

const physical_dmg_info: Info = { path: 'physical_dmg_' }
const set2 = greaterEq(
  input.artSet.PaleFlame,
  2,
  percent(0.25),
  physical_dmg_info,
)

const stackArr = range(1, 2)
const set4Atk = greaterEq(
  input.artSet.PaleFlame,
  4,
  lookup(
    condStack,
    Object.fromEntries(stackArr.map((i) => [i, percent(0.09 * i)])),
    naught,
  ),
)
const set4Phys = greaterEq(
  input.artSet.PaleFlame,
  4,
  lookup(
    condStack,
    Object.fromEntries(stackArr.map((i) => [i, equal(i, 2, percent(0.25))])),
    naught,
  ),
  physical_dmg_info,
)
export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    physical_dmg_: sum(set2, set4Phys),
    atk_: set4Atk,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: condStack,
        path: condStackPath,
        teamBuff: true,
        name: st('hitOp.skill'),
        states: Object.fromEntries(
          stackArr.map((i) => [
            i,
            {
              name: i.toString(),
              fields: [
                { node: set4Atk },
                {
                  node: set4Phys,
                },
                {
                  text: stg('duration'),
                  value: 7,
                  unit: 's',
                },
              ],
            },
          ]),
        ),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
