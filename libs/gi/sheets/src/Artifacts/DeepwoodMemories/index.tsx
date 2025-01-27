import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
  percent,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'DeepwoodMemories'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.DeepwoodMemories, 2, 0.15)

const [condSet4Path, condSet4] = cond(key, 'set4')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(condSet4, 'on', input.charKey)
)
const [set4, set4Inactive] = nonStackBuff(
  'dm4',
  'dendro_enemyRes_',
  percent(-0.3)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    dendro_dmg_: set2,
  },
  teamBuff: {
    premod: {
      dendro_enemyRes_: set4,
    },
    nonStacking: {
      dm4: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        path: condSet4Path,
        value: condSet4,
        teamBuff: true,
        name: st('hitOp.skillOrBurst'),
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
