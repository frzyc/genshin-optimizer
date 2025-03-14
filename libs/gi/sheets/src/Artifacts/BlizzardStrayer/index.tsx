import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  greaterEq,
  input,
  lookup,
  naught,
  percent,
} from '@genshin-optimizer/gi/wr'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'BlizzardStrayer'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const [condStatePath, condState] = cond(key, 'state')

const set2 = greaterEq(input.artSet.BlizzardStrayer, 2, percent(0.15))
const set4 = greaterEq(
  input.artSet.BlizzardStrayer,
  4,
  lookup(condState, { cryo: percent(0.2), frozen: percent(0.4) }, naught),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    cryo_dmg_: set2,
  },
  total: {
    // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
    critRate_: set4,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: trm('condName'),
        states: {
          cryo: {
            name: trm('condCryo'),
            fields: [{ node: set4 }],
          },
          frozen: {
            name: trm('condFrozen'),
            fields: [{ node: set4 }],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
