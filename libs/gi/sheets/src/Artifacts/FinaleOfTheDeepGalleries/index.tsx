import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input } from '@genshin-optimizer/gi/wr'
import { cond, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'FinaleOfTheDeepGalleries'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.FinaleOfTheDeepGalleries, 2, 0.15)

const [cond0EnergyNoNormalPath, cond0EnergyNoNormal] = cond(
  key,
  '0EnergyNoNormal'
)
const [cond0EnergyNoBurstPath, cond0EnergyNoBurst] = cond(key, '0EnergyNoBurst')
const set4_normal_dmg_ = greaterEq(
  input.artSet.FinaleOfTheDeepGalleries,
  4,
  equal(cond0EnergyNoBurst, 'on', 0.6)
)
const set4_burst_dmg_ = greaterEq(
  input.artSet.FinaleOfTheDeepGalleries,
  4,
  equal(cond0EnergyNoNormal, 'on', 0.6)
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    cryo_dmg_: set2,
    normal_dmg_: set4_normal_dmg_,
    burst_dmg_: set4_burst_dmg_,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        value: cond0EnergyNoBurst,
        path: cond0EnergyNoBurstPath,
        name: trm('noBurst'),
        states: {
          on: {
            fields: [
              {
                node: set4_normal_dmg_,
              },
            ],
          },
        },
      },
      {
        header: setHeader(4),
        value: cond0EnergyNoNormal,
        path: cond0EnergyNoNormalPath,
        name: trm('noNormal'),
        states: {
          on: {
            fields: [
              {
                node: set4_burst_dmg_,
              },
            ],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
