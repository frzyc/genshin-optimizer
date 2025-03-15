import { range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data, Info } from '@genshin-optimizer/gi/wr'
import {
  greaterEq,
  input,
  lookup,
  naught,
  percent,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'HuskOfOpulentDreams'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const [condStackPath, condStack] = cond(key, 'stack')
const def_info: Info = { path: 'def_' }
const set2 = greaterEq(
  input.artSet.HuskOfOpulentDreams,
  2,
  percent(0.3),
  def_info,
)
const stackArr = range(1, 4)
const set4Def = greaterEq(
  input.artSet.HuskOfOpulentDreams,
  4,
  lookup(
    condStack,
    Object.fromEntries(stackArr.map((i) => [i, percent(0.06 * i)])),
    naught,
  ),
  def_info,
)
const set4Geo = greaterEq(
  input.artSet.HuskOfOpulentDreams,
  4,
  lookup(
    condStack,
    Object.fromEntries(stackArr.map((i) => [i, percent(0.06 * i)])),
    naught,
  ),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    def_: sum(set2, set4Def),
    geo_dmg_: set4Geo,
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
        name: trm('condName'),
        states: Object.fromEntries(
          stackArr.map((i) => [
            i,
            {
              name: st('stack', { count: i }),
              fields: [
                { node: set4Def },
                {
                  node: set4Geo,
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
