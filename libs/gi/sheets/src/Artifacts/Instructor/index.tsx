import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Instructor'
const setHeader = setHeaderTemplate(key)

const [condStatePath, condState] = cond(key, 'set4')

const set2 = greaterEq(input.artSet.Instructor, 2, 80)
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(condState, 'on', input.charKey)
)
const [set4, set4Inactive] = nonStackBuff('inst4', 'eleMas', 120)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
  },
  teamBuff: {
    premod: {
      eleMas: set4,
    },
    nonStacking: {
      inst4: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
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
                node: set4Inactive,
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
}
export default new ArtifactSheet(sheet, data)
