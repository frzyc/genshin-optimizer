import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Adventurer'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.Adventurer, 2, 1000)
const heal = greaterEq(
  input.artSet.Adventurer,
  4,
  prod(percent(0.3), input.total.hp)
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
  }
)

const sheet: IArtifactSheet = {
  name: 'Adventurer',
  rarity: [3],
  setEffects: {
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
  },
}
export default new ArtifactSheet(key, sheet, data)
