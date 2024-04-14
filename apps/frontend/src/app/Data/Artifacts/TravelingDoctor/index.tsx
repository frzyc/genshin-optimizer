import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'TravelingDoctor'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.TravelingDoctor, 2, percent(0.2))
const heal = greaterEq(
  input.artSet.TravelingDoctor,
  4,
  prod(percent(0.2), input.total.hp)
)

export const data: Data = dataObjForArtifactSheet(
  key,
  {
    premod: {
      incHeal_: set2,
    },
  },
  {
    heal,
  }
)

const sheet: IArtifactSheet = {
  name: 'Traveling Doctor',
  rarity: [3],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          fields: [
            {
              node: infoMut(heal, {
                name: stg('healing'),
                variant: 'heal',
              }),
            },
          ],
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
