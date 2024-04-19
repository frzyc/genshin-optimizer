import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  greaterEq,
  input,
  lookup,
  naught,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'EchoesOfAnOffering'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.EchoesOfAnOffering, 2, percent(0.18))
const [condModePath, condMode] = cond(key, 'mode')
const normal_dmgInc = greaterEq(
  input.artSet.EchoesOfAnOffering,
  4,
  prod(
    lookup(
      condMode,
      {
        on: percent(0.7),
        avg: percent(0.7 * 0.50204),
      },
      naught
    ),
    input.total.atk
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmgInc,
  },
})
const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: condMode,
        path: condModePath,
        name: trm('mode'),
        states: {
          on: {
            name: trm('always'),
            fields: [{ node: normal_dmgInc }],
          },
          avg: {
            name: trm('avg'),
            fields: [{ node: normal_dmgInc }],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
