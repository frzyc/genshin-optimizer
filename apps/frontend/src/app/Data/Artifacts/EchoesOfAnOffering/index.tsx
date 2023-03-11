import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import {
  greaterEq,
  lookup,
  naught,
  percent,
  prod,
} from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
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
const sheet: IArtifactSheet = {
  name: 'Echoes of an Offering',
  rarity: [4, 5],
  setEffects: {
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
  },
}
export default new ArtifactSheet(key, sheet, data)
