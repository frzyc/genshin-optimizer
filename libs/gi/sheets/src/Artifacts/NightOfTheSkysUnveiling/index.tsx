import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allLunarReactionKeys,
} from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
  percent,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'NightOfTheSkysUnveiling'
const setHeader = setHeaderTemplate(key)

const set2_eleMas = greaterEq(input.artSet.NightOfTheSkysUnveiling, 2, 80)

const [cond4GleamingMoonPath, cond4GleamingMoon] = cond(key, '4GleamingMoon')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(cond4GleamingMoon, 'on', input.charKey)
)
const set4_critRate_ = greaterEq(
  input.artSet.NightOfTheSkysUnveiling,
  4,
  equal(
    cond4GleamingMoon,
    'on',
    threshold(
      input.tally.moonsign,
      2,
      percent(0.3),
      greaterEq(input.tally.moonsign, 1, percent(0.15))
    )
  )
)
const lunar_dmg_obj = objKeyValMap(allLunarReactionKeys, (k) => [
  `${k}_dmg_`,
  nonStackBuff('gleamingmoonintent', `${k}_dmg_`, percent(0.1)),
])

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2_eleMas,
    critRate_: set4_critRate_,
  },
  teamBuff: {
    premod: objMap(lunar_dmg_obj, (buffs) => buffs[0]),
    nonStacking: {
      gleamingmoonintent: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        fields: [
          {
            node: set2_eleMas,
          },
        ],
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        path: cond4GleamingMoonPath,
        value: cond4GleamingMoon,
        name: st('elementalReaction.team.lunar'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: set4_critRate_,
              },
              ...Object.values(lunar_dmg_obj).map((nodes) => ({
                node: nodes[0],
              })),
              ...Object.values(lunar_dmg_obj).map((nodes) => ({
                node: nodes[1],
              })),
              {
                text: stg('duration'),
                value: 4,
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
