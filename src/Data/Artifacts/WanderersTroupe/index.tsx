import { input } from '../../../Formula'
import { Data } from '../../../Formula/type'
import { greaterEq, lookup, naught, percent } from '../../../Formula/utils'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
import icons from './icons'

const key: ArtifactSetKey = "WanderersTroupe"
const setHeader = setHeaderTemplate(key, icons)

const set2 = greaterEq(input.artSet.WanderersTroupe, 2, 80)
const set4 = greaterEq(input.artSet.WanderersTroupe, 4, lookup(input.weaponType, { "catalyst": percent(0.35), "bow": percent(0.35) }, naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    eleMas: set2,
    charged_dmg_: set4
  },
})

const sheet: IArtifactSheet = {
  name: "Wanderer's Troupe", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: { document: [{ header: setHeader(4), fields: [{ node: set4 }] }] }
  }
}
export default new ArtifactSheet(key, sheet, data)
