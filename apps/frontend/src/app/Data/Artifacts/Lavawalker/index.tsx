import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, percent } from '../../../Formula/utils'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import type { IArtifactSheet } from '../IArtifactSheet'

const key: ArtifactSetKey = 'Lavawalker'
const setHeader = setHeaderTemplate(key)

const [condStatePath, condState] = cond(key, 'state')
const set2 = greaterEq(input.artSet.Lavawalker, 2, percent(0.4))
const set4 = greaterEq(
  input.artSet.Lavawalker,
  4,
  equal('on', condState, percent(0.35))
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    pyro_res_: set2,
    all_dmg_: set4,
  },
})

const sheet: IArtifactSheet = {
  name: 'Lavawalker',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          value: condState,
          path: condStatePath,
          name: st('enemyAffected.burningOrPyro'),
          states: {
            on: {
              fields: [
                {
                  node: set4,
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
