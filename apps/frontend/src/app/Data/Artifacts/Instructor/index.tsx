import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq } from '../../../Formula/utils'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'Instructor'
const setHeader = setHeaderTemplate(key)

const [condStatePath, condState] = cond(key, 'set4')

const set2 = greaterEq(input.artSet.Instructor, 2, 80)
const set4 = greaterEq(input.artSet.Instructor, 4, equal('on', condState, 120))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
  },
  teamBuff: {
    premod: {
      eleMas: set4,
    },
  },
})

const sheet: IArtifactSheet = {
  name: 'Instructor',
  rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          teamBuff: true,
          value: condState,
          path: condStatePath,
          name: st('afterReaction'),
          states: {
            on: {
              fields: [
                {
                  node: set4,
                },
                {
                  text: stg('duration'),
                  value: 8,
                  unit: 's',
                },
              ],
            },
          },
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
