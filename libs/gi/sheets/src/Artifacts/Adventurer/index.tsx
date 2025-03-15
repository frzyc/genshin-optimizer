import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  greaterEq,
  infoMut,
  input,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Adventurer'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.Adventurer, 2, 1000)
const heal = greaterEq(
  input.artSet.Adventurer,
  4,
  prod(percent(0.3), input.total.hp),
)

export const data: Data = dataObjForArtifactSheet(
  key,
  {
    premod: {
      hp: set2,
    },
  },
  {
    heal,
  },
)

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: [
          {
            node: infoMut(heal, { name: stg('healing'), variant: 'heal' }),
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
