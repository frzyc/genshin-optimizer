import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'AubadeOfMorningstarAndMoon'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet[key], 2, 80)

const [condSet4Path, condSet4] = cond(key, 'set4')
const set4Cond = greaterEq(input.artSet[key], 4, equal(condSet4, 'on', 0.2))
const set4CondObj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_dmg_`,
  infoMut({ ...set4Cond }, { path: `${k}_dmg_` }),
])
const set4Gleam = greaterEq(
  input.artSet[key],
  4,
  equal(condSet4, 'on', greaterEq(tally.moonsign, 2, 0.4))
)
const set4GleamObj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_dmg_`,
  infoMut({ ...set4Gleam }, { path: `${k}_dmg_` }),
])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
    ...objMap(set4CondObj, (_, k) => sum(set4CondObj[k], set4GleamObj[k])),
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
        name: st('charOffField'),
        states: {
          on: {
            fields: [
              ...Object.values(set4CondObj).map((node) => ({ node })),
              {
                text: stg('duration'),
                value: 3,
                unit: 's',
              },
            ],
          },
        },
      },
      {
        header: setHeader(4),
        canShow: greaterEq(set4Gleam, 0.1, 1),
        fields: [
          ...Object.values(set4GleamObj).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 3,
            unit: 's',
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
