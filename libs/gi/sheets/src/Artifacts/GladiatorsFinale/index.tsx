import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  greaterEq,
  input,
  lookup,
  naught,
  percent,
} from '@genshin-optimizer/gi/wr'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
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
    naught,
  ),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmg_: set4,
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
            node: set4,
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
