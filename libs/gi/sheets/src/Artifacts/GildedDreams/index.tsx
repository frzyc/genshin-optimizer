import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  compareEq,
  constant,
  equal,
  greaterEq,
  input,
  lookup,
  percent,
  prod,
  sum,
  tally,
  unequal,
  zero,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'GildedDreams'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.GildedDreams, 2, 80, { path: 'eleMas' })

const [condPassivePath, condPassive] = cond(key, 'passive')

const teamSameNum = lookup(input.charEle, tally, zero)
// Do not include wielder (maybe)
const autoSameNum = greaterEq(teamSameNum, 2, sum(teamSameNum, -1))

const autoOtherNum = sum(
  ...allElementKeys.map((ele) =>
    greaterEq(tally[ele], 1, unequal(ele, input.charEle, tally[ele])),
  ),
)

const [condOverrideOtherPath, condOverrideOther] = cond(key, 'overrideOther')
const overrideArr = range(0, 3)
const overrideOtherNum = lookup(
  condOverrideOther,
  objKeyMap(overrideArr, (numOther) => constant(numOther)),
  -1,
)
const [condOverrideSamePath, condOverrideSame] = cond(key, 'overrideSame')
const overrideSameNum = lookup(
  condOverrideSame,
  objKeyMap(overrideArr, (numSame) => constant(numSame)),
  -1,
)

const set4_atk_ = greaterEq(
  input.artSet.GildedDreams,
  4,
  equal(
    condPassive,
    'on',
    prod(
      percent(0.14),
      compareEq(overrideSameNum, -1, autoSameNum, overrideSameNum),
    ),
  ),
)

const set4_eleMas = greaterEq(
  input.artSet.GildedDreams,
  4,
  equal(
    condPassive,
    'on',
    prod(50, compareEq(overrideOtherNum, -1, autoOtherNum, overrideOtherNum)),
    { path: 'eleMas' },
  ),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: sum(set2, set4_eleMas),
    atk_: set4_atk_,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        teamBuff: true,
        path: condPassivePath,
        value: condPassive,
        name: st('afterReaction'),
        states: {
          on: {
            fields: [
              {
                node: set4_atk_,
              },
              {
                node: set4_eleMas,
              },
              {
                text: stg('duration'),
                value: 8,
                unit: 's',
              },
              {
                text: stg('cd'),
                value: 8,
                unit: 's',
              },
            ],
          },
        },
      },
      {
        header: setHeader(4),
        teamBuff: true,
        path: condOverrideSamePath,
        value: condOverrideSame,
        name: trm('overrideSameCond'),
        states: objKeyMap(overrideArr, (override) => ({
          name: st('members', { count: override }),
          fields: [],
        })),
      },
      {
        header: setHeader(4),
        teamBuff: true,
        path: condOverrideOtherPath,
        value: condOverrideOther,
        name: trm('overrideOtherCond'),
        states: objKeyMap(overrideArr, (override) => ({
          name: st('members', { count: override }),
          fields: [],
        })),
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
