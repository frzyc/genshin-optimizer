import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equalStr,
  greaterEq,
  greaterEqStr,
  input,
  percent,
  tally,
  threshold,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'SilkenMoonsSerenade'
const setHeader = setHeaderTemplate(key)

const set2_enerRech_ = greaterEq(
  input.artSet.SilkenMoonsSerenade,
  2,
  percent(0.2)
)

const [cond4GleamingMoonPath, cond4GleamingMoon] = cond(key, '4GleamingMoon')
const set4TallyWrite = greaterEqStr(
  input.artSet[key],
  4,
  equalStr(cond4GleamingMoon, 'on', input.charKey)
)
const [set4_eleMas, set4_eleMasInactive] = nonStackBuff(
  'gleamingmoondevotion',
  'eleMas',
  threshold(tally.moonsign, 2, 120, greaterEq(tally.moonsign, 1, 60))
)
const [set4_lunarcharged_dmg_, set4_lunarcharged_dmg_inactive] = nonStackBuff(
  'gleamingmoondevotion',
  'lunarcharged_dmg_',
  percent(0.1)
)
const [set4_lunarbloom_dmg_, set4_lunarbloom_dmg_inactive] = nonStackBuff(
  'gleamingmoondevotion',
  'lunarbloom_dmg_',
  percent(0.1)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    enerRech_: set2_enerRech_,
  },
  teamBuff: {
    premod: {
      eleMas: set4_eleMas,
      lunarcharged_dmg_: set4_lunarcharged_dmg_,
      lunarbloom_dmg_: set4_lunarbloom_dmg_,
    },
    nonStacking: {
      gleamingmoondevotion: set4TallyWrite,
    },
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        fields: [
          {
            node: set2_enerRech_,
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
        name: st('hitOp.ele'),
        teamBuff: true,
        states: {
          on: {
            fields: [
              {
                node: set4_eleMas,
              },
              {
                node: set4_lunarcharged_dmg_,
              },
              {
                node: set4_lunarbloom_dmg_,
              },
              {
                node: set4_eleMasInactive,
              },
              {
                node: set4_lunarcharged_dmg_inactive,
              },
              {
                node: set4_lunarbloom_dmg_inactive,
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
