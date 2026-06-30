import type { ArtifactSetKey } from '@genshin-optimizer/gi-consts'
import type { Data } from '@genshin-optimizer/gi-wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi-wr'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'DisenchantmentInDeepShadow'
const setHeader = setHeaderTemplate(key)

const [condStatePath, condState] = cond(key, 'state')

const set2 = greaterEq(
  input.artSet.DisenchantmentInDeepShadow,
  2,
  percent(0.18)
)
const set4_superconduct_dmg_ = greaterEq(
  input.artSet.DisenchantmentInDeepShadow,
  4,
  percent(0.8)
)
const set4_critRate_ = greaterEq(
  input.artSet.DisenchantmentInDeepShadow,
  4,
  equal(condState, 'on', percent(0.16))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    superconduct_dmg_: set4_superconduct_dmg_,
  },
  total: {
    // TODO: this crit rate is on-hit. Might put it in a `hit.critRate_` namespace later.
    critRate_: set4_critRate_,
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        fields: [
          {
            node: set4_superconduct_dmg_,
          },
        ],
      },
      {
        header: setHeader(4),
        value: condState,
        path: condStatePath,
        name: st('enemyAffected.superconduct'),
        states: {
          on: {
            fields: [{ node: set4_critRate_ }],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
