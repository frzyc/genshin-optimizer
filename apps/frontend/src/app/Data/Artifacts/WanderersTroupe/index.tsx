import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent } from '../../../Formula/utils'
import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'WanderersTroupe'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.WanderersTroupe, 2, 80)
const set4 = greaterEq(
  input.artSet.WanderersTroupe,
  4,
  lookup(
    input.weaponType,
    { catalyst: percent(0.35), bow: percent(0.35) },
    naught
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
    charged_dmg_: set4,
  },
})

const sheet: IArtifactSheet = {
  name: "Wanderer's Troupe",
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: { document: [{ header: setHeader(4), fields: [{ node: set4 }] }] },
  },
}
export default new ArtifactSheet(key, sheet, data)
