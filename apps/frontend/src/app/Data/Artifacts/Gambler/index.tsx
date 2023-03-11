import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, percent } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'Gambler'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.Gambler, 2, percent(0.2))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    skill_dmg_: set2,
  },
})

const sheet: IArtifactSheet = {
  name: 'Gambler',
  rarity: [3, 4],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: { document: [{ header: setHeader(4), fields: [] }] },
  },
}
export default new ArtifactSheet(key, sheet, data)
