import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'GladiatorsFinale'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.GladiatorsFinale, 2, percent(0.18))
const set4 = greaterEq(
  input.artSet.GladiatorsFinale,
  4,
  lookup(
    input.weaponType,
    { sword: percent(0.35), polearm: percent(0.35), claymore: percent(0.35) },
    naught
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmg_: set4,
  },
})

const sheet: IArtifactSheet = {
  name: "Gladiator's Finale",
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          fields: [
            {
              node: set4,
            },
          ],
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
