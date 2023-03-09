import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, infoMut } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'LuckyDog'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.LuckyDog, 2, 100)
const heal = greaterEq(input.artSet.LuckyDog, 4, 300)

export const data: Data = dataObjForArtifactSheet(
  key,
  {
    premod: {
      def: set2,
    },
  },
  {
    heal,
  }
)

const sheet: IArtifactSheet = {
  name: 'Lucky Dog',
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
