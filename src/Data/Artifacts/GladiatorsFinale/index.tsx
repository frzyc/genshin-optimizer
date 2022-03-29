import icons from './icons'
import { Data } from '../../../Formula/type'
import { lookup, naught, percent, greaterEq } from '../../../Formula/utils'
import { input } from '../../../Formula'
import { ArtifactSetKey } from '../../../Types/consts'
import { ArtifactSheet, IArtifactSheet } from '../ArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'
const key: ArtifactSetKey = "GladiatorsFinale"

const set2 = greaterEq(input.artSet.GladiatorsFinale, 2, percent(0.18))
const set4 = greaterEq(input.artSet.GladiatorsFinale, 4, lookup(input.weaponType, { "sword": percent(0.35), "polearm": percent(0.35), "claymore": percent(0.35) }, naught))

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    normal_dmg_: set4
  }
})

const sheet: IArtifactSheet = {
  name: "Gladiator's Finale", rarity: [4, 5],
  icons,
  setEffects: {
    2: { document: [{ fields: [{ node: set2 }] }] },
    4: {
      document: [{
        fields: [{
          node: set4,
        }]
      }]
    }
  }
}
export default new ArtifactSheet(key, sheet, data)
